import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export default {
  async createServicoCatalogo(req, res) {
    const { nome, preco, userId } = req.body;

    if (!nome || !preco || !userId) {
      return res.status(400).json({
        error: true,
        message: "Erro: Todos os campos (nome, preco, userId) são obrigatórios!",
      });
    }

    try {
      const servicoCatalogo = await prisma.servicoCatalogo.create({
        data: {
          nome,
          preco,
          userId, // Associa o serviço ao usuário
        },
      });

      return res.json({
        error: false,
        message: "Sucesso: Serviço cadastrado com sucesso!",
        servicoCatalogo,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async findAll(req, res) {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: true,
        message: "Erro: userId é obrigatório para buscar os serviços.",
      });
    }

    try {
      const servicoCatalogo = await prisma.servicoCatalogo.findMany({
        where: { userId }, // Filtra os serviços pelo userId
      });
      return res.json(servicoCatalogo);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async updateServicoCatalogo(req, res) {
    const { id } = req.params;
    const { nome, preco, userId } = req.body;

    try {
      let servicoCatalogo = await prisma.servicoCatalogo.findUnique({
        where: { id: Number(id) },
      });

      if (!servicoCatalogo) {
        return res
          .status(404)
          .json({ message: "Serviço no catálogo não encontrado" });
      }

      // Verifica se o userId informado corresponde ao registro
      if (userId && servicoCatalogo.userId !== userId) {
        return res.status(403).json({
          message: "Erro: Você não tem permissão para atualizar este serviço.",
        });
      }

      servicoCatalogo = await prisma.servicoCatalogo.update({
        where: { id: Number(id) },
        data: {
          nome,
          preco,
        },
      });

      return res.status(200).json({
        error: false,
        message: "Sucesso: Serviço atualizado com sucesso!",
        servicoCatalogo,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async deleteServicoCatalogo(req, res) {
    const { id } = req.params;
    const { userId } = req.body;

    try {
      const servicoCatalogo = await prisma.servicoCatalogo.findUnique({
        where: { id: Number(id) },
      });

      if (!servicoCatalogo) {
        return res
          .status(404)
          .json({ message: "Serviço no catálogo não encontrado" });
      }

      // Verifica se o userId informado corresponde ao registro
      if (servicoCatalogo.userId !== userId) {
        return res.status(403).json({
          message: "Erro: Você não tem permissão para deletar este serviço.",
        });
      }

      await prisma.servicoCatalogo.delete({
        where: { id: Number(id) },
      });

      return res
        .status(200)
        .json({ message: "Sucesso: Serviço deletado com sucesso!" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};
