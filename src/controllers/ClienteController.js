
import moment from 'moment-timezone';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default {
  async createCliente(req, res) {
    const { nome, sobrenome, celular, dataCadastro, horario } = req.body;
    const userId = req.userId;

    if (!nome || !sobrenome || !celular || !dataCadastro || !horario) {
      return res.status(400).json({
        error: true,
        message: "Erro: Todos os campos são obrigatórios!",
      });
    }

    try {
      const clienteExistente = await prisma.cliente.findFirst({
        where: { celular, userId },
      });

      if (clienteExistente) {
        return res.status(400).json({
          error: true,
          message: "Erro: Cliente já existe!",
        });
      }

      const realizadoEmAdjusted = moment
        .tz(dataCadastro, "America/Sao_Paulo")
        .toISOString();

      const cliente = await prisma.cliente.create({
        data: {
          nome,
          sobrenome,
          celular,
          dataCadastro: new Date(realizadoEmAdjusted),
          horario,
          visitCount: 0,
          scoreRelevancia: 0,
          frequencia: 0,
          relevante: 0,
          userId,
        },
      });

      return res.status(201).json({
        error: false,
        message: "Sucesso: Cliente cadastrado com sucesso!",
        cliente,
      });
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message });
    }
  },

  async findAll(req, res) {
    const userId = req.userId;

    try {
      const clientes = await prisma.cliente.findMany({
        where: { userId },
        select: {
          id: true,
          nome: true,
          sobrenome: true,
          celular: true,
          dataCadastro: true,
          horario: true,
          scoreRelevancia: true,
          relevante: true,
        },
      });

      return res.status(200).json(clientes);
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message });
    }
  },

  async getClienteById(req, res) {
    const { id } = req.params;
    const userId = req.userId;

    try {
      const cliente = await prisma.cliente.findFirst({
        where: { id: Number(id), userId },
      });

      if (!cliente) {
        return res.status(404).json({
          error: true,
          message: "Erro: Cliente não encontrado ou acesso negado.",
        });
      }

      return res.status(200).json(cliente);
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message });
    }
  },

  async updateCliente(req, res) {
    const { id } = req.params;
    const {
      nome,
      sobrenome,
      celular,
      dataCadastro,
      horario,
      visitCount,
      scoreRelevancia,
      frequencia,
      relevante,
    } = req.body;
    const userId = req.userId;

    try {
      const cliente = await prisma.cliente.findFirst({
        where: { id: Number(id), userId },
      });

      if (!cliente) {
        return res.status(404).json({
          error: true,
          message: "Erro: Cliente não encontrado ou acesso negado.",
        });
      }

      const realizadoEmAdjusted = moment
        .tz(dataCadastro, "America/Sao_Paulo")
        .toISOString();

      const clienteAtualizado = await prisma.cliente.update({
        where: { id: Number(id) },
        data: {
          nome,
          sobrenome,
          celular,
          dataCadastro: new Date(realizadoEmAdjusted),
          horario,
          visitCount: visitCount !== undefined ? visitCount : cliente.visitCount,
          scoreRelevancia:
            scoreRelevancia !== undefined
              ? scoreRelevancia
              : cliente.scoreRelevancia,
          frequencia: frequencia !== undefined ? frequencia : cliente.frequencia,
          relevante: relevante !== undefined ? relevante : cliente.relevante,
        },
      });

      return res.status(200).json({
        error: false,
        message: "Sucesso: Cliente atualizado com sucesso!",
        cliente: clienteAtualizado,
      });
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message });
    }
  },

  async deleteCliente(req, res) {
    const { id } = req.params;
    const userId = req.userId;

    try {
      const cliente = await prisma.cliente.findFirst({
        where: { id: Number(id), userId },
      });

      if (!cliente) {
        return res.status(404).json({
          error: true,
          message: "Erro: Cliente não encontrado ou acesso negado.",
        });
      }

      await prisma.cliente.delete({ where: { id: Number(id) } });

      return res.status(200).json({
        error: false,
        message: "Sucesso: Cliente deletado com sucesso!",
      });
    } catch (error) {
      return res.status(500).json({ error: true, message: error.message });
    }
  },


  async getClientesRelevantes(req, res) {
    try {
        const clientesRelevantes = await Cliente.findAll({
            where: {
                relevante: true 
            }
        });
        return res.json(clientesRelevantes);
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao buscar clientes relevantes', error });
    }
}
};


