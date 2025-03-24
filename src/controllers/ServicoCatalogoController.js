import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


export default {
  // Criação de um novo Serviço no Catálogo
  async createServicoCatalogo(req, res) {
    const { nome, preco } = req.body;
    const userId = req.userId;

    if (!nome || !preco) {
      return res.status(400).json({
        error: true,
        message: "Erro: Todos os campos (nome, preco) são obrigatórios!",
      });
    }

    if (preco <= 0) {
      return res.status(400).json({
        error: true,
        message: "Erro: O preço deve ser maior que zero!",
      });
    }

    try {
      const servicoCatalogo = await prisma.servicoCatalogo.create({
        data: {
          nome,
          preco,
          userId, 
        },
      });

      return res.status(201).json({
        error: false,
        message: "Sucesso: Serviço cadastrado com sucesso!",
        servicoCatalogo,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: true,
        message: "Erro interno no servidor. Por favor, tente novamente mais tarde.",
      });
    }
  },

  // Busca de todos os Serviços no Catálogo com paginação
  async findAll(req, res) {
    const userId = req.userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    try {
      const [servicos, total] = await Promise.all([
        prisma.servicoCatalogo.findMany({
          where: { userId }, // Aqui você filtra por userId
            skip,              
            take: limit       
        }),
        prisma.servicoCatalogo.count({ where: { userId } }),
      ]);

      return res.status(200).json({
        error: false,
        data: servicos,
        total,
        page,
        pages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: true,
        message: "Erro interno no servidor. Por favor, tente novamente mais tarde.",
      });
    }
  },

  // Atualização de um Serviço no Catálogo
  async updateServicoCatalogo(req, res) {
    const { id } = req.params;
    const { nome, preco } = req.body;
    const userId = req.userId;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: true,
        message: "Erro: ID inválido.",
      });
    }

    try {
      const servicoCatalogo = await prisma.servicoCatalogo.findUnique({
        where: { id: Number(id) },
      });

      if (!servicoCatalogo) {
        return res.status(404).json({
          error: true,
          message: "Erro: Serviço no catálogo não encontrado.",
        });
      }

      if (servicoCatalogo.userId !== userId) {
        return res.status(403).json({
          error: true,
          message: "Erro: Você não tem permissão para atualizar este serviço.",
        });
      }

      const updatedServicoCatalogo = await prisma.servicoCatalogo.update({
        where: { id: Number(id) },
        data: { nome, preco },
      });

      return res.status(200).json({
        error: false,
        message: "Sucesso: Serviço atualizado com sucesso!",
        servicoCatalogo: updatedServicoCatalogo,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: true,
        message: "Erro interno no servidor. Por favor, tente novamente mais tarde.",
      });
    }
  },

  async deleteServicoCatalogo(req, res) {
    const { id } = req.params;
    const userId = req.userId;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: true,
        message: "Erro: ID inválido.",
      });
    }

    try {
      const servicoCatalogo = await prisma.servicoCatalogo.findUnique({
        where: { id: Number(id) },
      });

      if (!servicoCatalogo) {
        return res.status(404).json({
          error: true,
          message: "Erro: Serviço no catálogo não encontrado.",
        });
      }

      if (servicoCatalogo.userId !== userId) {
        return res.status(403).json({
          error: true,
          message: "Erro: Você não tem permissão para deletar este serviço.",
        });
      }

      await prisma.servicoCatalogo.delete({
        where: { id: Number(id) },
      });

      return res.status(200).json({
        error: false,
        message: "Sucesso: Serviço deletado com sucesso!",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: true,
        message: "Erro interno no servidor. Por favor, tente novamente mais tarde.",
      });
    }
  },
};
