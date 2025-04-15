import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from 'dotenv'

dotenv.config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);
const prisma = new PrismaClient();

const messages = {
  fieldsMissing: "Preencha todos os campos",
  passwordsMismatch: "As senhas devem ser iguais",
  emailExists: "Usuário ou email já existem",
  invalidCredentials: "Credenciais inválidas",
  userNotFound: "Usuário não encontrado",
  passwordUpdated: "Senha atualizada com sucesso",
  userCreated: "Usuário criado com sucesso",
  tokenInvalid: "Token inválido ou expirado",
  tokenValid: "Token válido",
};

export default {
  async createUser(req, res) {
    const { username, email, password, confirmPassword } = req.body;
    console.log("Dados recebidos:", { username, email, password });
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: messages.fieldsMissing });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: messages.passwordsMismatch });
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const userExists = await prisma.user.findFirst({
        where: { email: normalizedEmail },
      });

      if (userExists) {
        return res.status(400).json({ message: messages.emailExists });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          username,
          email: normalizedEmail,
          password: hashedPassword,
        },
      });
      console.log('Dados da criação: ', user)
      return res.status(201).json({
        error: false,
        message: messages.userCreated,
        user,
      });
    } catch (error) {
      console.log('error 500', error)
      console.error("Error creating user:", error.message);
      return res.status(500).json({
        error: true,
        message: "Ocorreu um erro ao tentar cadastrar o usuário",
        errorMessage: error.message,
      });
    }
  },

  async loginUser(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: messages.fieldsMissing });
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const user = await prisma.user.findFirst({
        where: { email: normalizedEmail },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: messages.invalidCredentials });
      }
      console.log("Usuário encontrado:", user);
      console.log("JWT_SECRET:", process.env.JWT_SECRET);
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
         algorithm: 'HS256'
      });
      console.log("Token gerado com sucesso:", token);
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
      };

      return res.status(200).json({
        error: false,
        message: "Login realizado com sucesso!",
        token,
        userData,
      });
    } catch (error) {
      console.error("Error during login:", error.message);
      return res.status(500).json({
        error: true,
        message: "Ocorreu um erro ao tentar fazer login",
        errorMessage: error.message,
      });
    }
  },

  async validateToken(req, res) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return res.status(404).json({ message: messages.userNotFound });
      }

      return res.status(200).json({
        error: false,
        message: messages.tokenValid,
        userData: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Error validating token:", error.message);
      return res.status(401).json({ message: messages.tokenInvalid });
    }
  },

  async getUserById(req, res) {
    const { id } = req.params;

    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return res.status(404).json({ message: messages.userNotFound });
      }

      return res.status(200).json({
        error: false,
        message: "Usuário encontrado com sucesso",
        user,
      });
    } catch (error) {
      console.error("Error fetching user:", error.message);
      return res.status(500).json({
        message: "Erro interno no servidor",
        errorMessage: error.message,
      });
    }
  },

  async updatePassword(req, res) {
    const { userId, currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: messages.fieldsMissing });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: messages.passwordsMismatch });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ message: messages.userNotFound });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Senha atual incorreta" });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      return res.status(200).json({
        message: messages.passwordUpdated,
      });
    } catch (error) {
      console.error("Error updating password:", error.message);
      return res.status(500).json({
        message: "Erro ao atualizar a senha",
        errorMessage: error.message,
      });
    }
  },
};
