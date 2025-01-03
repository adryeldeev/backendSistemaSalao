import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client"; // Certifique-se de importar o PrismaClient
dotenv.config();

const prisma = new PrismaClient();

const messages = {
  fieldsMissing: "Preencha todos os campos.",
  passwordsMismatch: "As senhas devem ser iguais.",
  userNotFound: "Usuário não encontrado.",
  passwordUpdated: "Senha atualizada com sucesso.",
  resetPasswordLinkSent: "E-mail de recuperação enviado.",
  invalidToken: "Token inválido ou expirado.",
  errorSendingEmail: "Erro ao enviar o e-mail de recuperação.",
  errorResettingPassword: "Erro ao redefinir a senha.",
};

export default {
  async requestPasswordReset(req, res) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: messages.fieldsMissing });
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const user = await prisma.user.findFirst({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return res.status(404).json({ message: messages.userNotFound });
      }

      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hora de validade

      await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpiration,
        },
      });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: "Recuperação de Senha",
        text: `Clique no link abaixo para redefinir sua senha:
      
      ${resetLink}
      
      Se você não encontrar este e-mail na sua caixa de entrada, verifique também a sua caixa de spam ou lixo eletrônico.
      
      Caso você não tenha solicitado a recuperação de senha, desconsidere este e-mail.
      
      Atenciosamente,
      Equipe ${process.env.SISTEMA_NOME || 'Sua Empresa'}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ message: messages.errorSendingEmail });
        }
        return res.status(200).json({ message: messages.resetPasswordLinkSent });
      });
    } catch (error) {
      return res.status(500).json({ message: messages.errorSendingEmail });
    }
  },

  async resetPassword(req, res) {
    const { token, newPassword, confirmNewPassword } = req.body;

    if (!token || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: messages.fieldsMissing });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: messages.passwordsMismatch });
    }

    try {
      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { gte: new Date() }, // Verifica se o token ainda é válido
        },
      });

      if (!user) {
        return res.status(400).json({ message: messages.invalidToken });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedNewPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });

      return res.status(200).json({ message: messages.passwordUpdated });
    } catch (error) {
      return res.status(500).json({ message: messages.errorResettingPassword });
    }
  },
};
