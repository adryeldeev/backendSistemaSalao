import pkg from "@prisma/client";
import moment from "moment-timezone";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const getMesAtual = () => {
  return moment().format("YYYY-MM");
};

const ServicoController = {
  async createServico(req, res) {
    const { produtoNome, realizadoEm, horario, quantidade, valor, desconto, funcionario, clienteId, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Erro: userId é obrigatório" });
    }

    try {
      if (!clienteId || isNaN(Number(clienteId))) {
        return res.status(400).json({ message: "ID do cliente é inválido" });
      }

      const cliente = await prisma.cliente.findUnique({
        where: { id: Number(clienteId) },
      });

      if (!cliente || cliente.userId !== userId) {
        return res.status(404).json({ message: "Cliente não encontrado ou não pertence ao usuário." });
      }

      const servicoCatalogo = await prisma.servicoCatalogo.findFirst({
        where: { nome: produtoNome, userId },
      });

      if (!servicoCatalogo) {
        return res.status(404).json({ message: "Serviço no catálogo não encontrado." });
      }

      const realizadoEmAdjusted = moment.tz(realizadoEm, "America/Sao_Paulo").toISOString();

      const novoServico = await prisma.servico.create({
        data: {
          produtoNome: servicoCatalogo.nome,
          realizadoEm: realizadoEmAdjusted,
          horario,
          quantidade,
          valor,
          desconto: desconto !== undefined ? Number(desconto) : undefined,
          funcionario,
          cliente: { connect: { id: Number(clienteId) } },
          servicoCatalogo: { connect: { id: servicoCatalogo.id } },
          userId, // Associa o serviço ao usuário
          lastUpdated: new Date(),
        },
      });

      await ServicoController.updateClienteRelevancia(clienteId, userId);

      return res.status(201).json(novoServico);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async updateClienteRelevancia(clienteId, userId) {
    if (!clienteId || isNaN(Number(clienteId))) {
      console.error("ID do cliente é inválido");
      return;
    }

    try {
      const mesAtual = getMesAtual();

      const cliente = await prisma.cliente.findUnique({
        where: { id: Number(clienteId) },
      });

      if (!cliente || cliente.userId !== userId) {
        console.error("Cliente não encontrado ou não pertence ao usuário.");
        return;
      }

      if (!cliente.lastUpdated || moment(cliente.lastUpdated).format("YYYY-MM") !== mesAtual) {
        await prisma.cliente.update({
          where: { id: Number(clienteId) },
          data: {
            visitCount: 0,
            relevanceScore: 0,
            lastUpdated: new Date(),
          },
        });
      }

      const totalServicosMensais = await prisma.servico.count({
        where: {
          clienteId: Number(clienteId),
          userId,
          realizadoEm: {
            gte: moment().startOf("month").toISOString(),
            lte: moment().endOf("month").toISOString(),
          },
          realizado: true,
        },
      });

      if (totalServicosMensais > 0) {
        let relevancia = 0;
        if (totalServicosMensais >= 10) relevancia = 10;
        else if (totalServicosMensais >= 5) relevancia = 5;

        await prisma.cliente.update({
          where: { id: Number(clienteId) },
          data: {
            relevanceScore: relevancia,
            visitCount: totalServicosMensais,
          },
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar relevância do cliente: " + error.message);
    }
  },

  async findAllServico(req, res) {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "Erro: userId é obrigatório" });
    }

    try {
      const servicos = await prisma.servico.findMany({
        where: { userId },
        include: {
          servicoCatalogo: true,
          cliente: true,
        },
      });

      return res.status(200).json(servicos);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async getServicosByClienteId(req, res) {
    const { id } = req.params;
    const { userId } = req.query;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "ID do cliente inválido" });
    }

    if (!userId) {
      return res.status(400).json({ message: "Erro: userId é obrigatório" });
    }

    try {
      const servicos = await prisma.servico.findMany({
        where: { clienteId: Number(id), userId },
        include: { servicoCatalogo: true },
      });

      return res.status(200).json(servicos);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};

export default ServicoController;
