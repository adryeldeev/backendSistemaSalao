import pkg from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const messages = {
  fieldsMissing: "Preencha todos os campos",
  passwordsMismatch: "As senhas devem ser iguais",
  emailExists: "Usuário ou email já existem",
  invalidCredentials: "Credenciais inválidas",
  userNotFound: "Usuário não encontrado",
  passwordUpdated: "Senha atualizada com sucesso",
  userCreated: "Usuário criado com sucesso",
};

export default {
  async createUser(req, res) {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: messages.fieldsMissing });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: messages.passwordsMismatch });
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const userExiste = await prisma.user.findFirst({
        where: {
          OR: [ { email: normalizedEmail }],
        },
      });

      if (userExiste) {
        return res.status(400).json({ message: messages.emailExists });
      }

      const hashPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          username,
          email: normalizedEmail,
          password: hashPassword,
        },
      });

      return res.status(201).json({
        error: false,
        message: messages.userCreated,
        user,
      });
    } catch (error) {
      return res.status(400).json({
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
  
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
  
      // Include user data in the response
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
      return res.status(400).json({
        error: true,
        message: "Ocorreu um erro ao tentar fazer login",
        errorMessage: error.message,
      });
    }
  },
  async getUserById(req, res) {
    const { id } = req.params; 
  
    try {
      const user = await prisma.user.findFirst({
        where: { 
          id: id 
        }
      });
  
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
  
      return res.status(200).json({
        error: false,
        message: "Usuário encontrado com sucesso",
        user,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro interno no servidor" });
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

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      return res.status(200).json({
        message: messages.passwordUpdated,
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Erro ao atualizar a senha",
        error: error.message,
      });
    }
  },
};
