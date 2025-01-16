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
  async updateServico (req, res) {
    const { id } = req.params;
    const { produtoNome, realizadoEm, horario, quantidade, valor, desconto, funcionario, clienteId } = req.body;

    try {
      let servico = await prisma.servico.findUnique({ where: { id: Number(id) } });
      if (!servico) {
        return res.status(404).json({ message: 'Serviço não encontrado' });
      }

      const realizadoEmAdjusted = moment.tz(realizadoEm, 'America/Sao_Paulo').toISOString();

      servico = await prisma.servico.update({
        where: { id: Number(id) },
        data: {
          produtoNome,
          realizadoEm: realizadoEmAdjusted,
          horario,
          quantidade,
          valor,
          desconto: desconto !== undefined ? Number(desconto) : undefined,
          funcionario,
          cliente: { connect: { id: Number(clienteId) } },
          servicoCatalogo: { connect: { id: servico.servicoCatalogoId } },
          lastUpdated: new Date(),
        },
      });

      await ServicoController.updateClienteRelevancia(clienteId);

      return res.status(200).json(servico);
    } catch (error) {
      console.log('Erro ao atualizar serviço: ' + error);
      return res.status(500).json({ message: error.message });
    }
  },
  async updateServico (req, res) {
    const { id } = req.params;
    const { produtoNome, realizadoEm, horario, quantidade, valor, desconto, funcionario, clienteId } = req.body;

    try {
      let servico = await prisma.servico.findUnique({ where: { id: Number(id) } });
      if (!servico) {
        return res.status(404).json({ message: 'Serviço não encontrado' });
      }

      const realizadoEmAdjusted = moment.tz(realizadoEm, 'America/Sao_Paulo').toISOString();

      servico = await prisma.servico.update({
        where: { id: Number(id) },
        data: {
          produtoNome,
          realizadoEm: realizadoEmAdjusted,
          horario,
          quantidade,
          valor,
          desconto: desconto !== undefined ? Number(desconto) : undefined,
          funcionario,
          cliente: { connect: { id: Number(clienteId) } },
          servicoCatalogo: { connect: { id: servico.servicoCatalogoId } },
          lastUpdated: new Date(),
        },
      });

      await ServicoController.updateClienteRelevancia(clienteId);

      return res.status(200).json(servico);
    } catch (error) {
      console.log('Erro ao atualizar serviço: ' + error);
      return res.status(500).json({ message: error.message });
    }
  },
  async  updateRealizado (req, res) {
    const { id } = req.params;
    const { realizado } = req.body;

    try {
      const servico = await prisma.servico.findUnique({
        where: { id: Number(id) },
      });

      if (!servico) {
        return res.status(404).json({ message: 'Serviço não encontrado' });
      }

      const updatedServico = await prisma.servico.update({
        where: { id: Number(id) },
        data: { realizado: Boolean(realizado) },
      });

  
      return res.status(200).json(updatedServico);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  async deleteServico (req, res)  {
    const { id } = req.params;
    try {
      const servico = await prisma.servico.findUnique({ where: { id: Number(id) } });
      if (!servico) {
        return res.status(404).json({ message: 'Serviço não encontrado' });
      }

      await prisma.servico.delete({ where: { id: Number(id) } });
      return res.status(200).json({ message: 'Serviço deletado com sucesso' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  async getTotalPorMes(req, res) {
    const { month } = req.query;
  
    try {
      const totalPorMes = await prisma.$queryRaw(`
        SELECT 
          DATE_FORMAT(realizadoEm, '%Y-%m') as mes, -- Formata a data para exibir mês e ano
          clienteId,                               -- ID do cliente
          COUNT(*) as totalServicos,               -- Conta o total de serviços realizados
          CAST(SUM(valor * quantidade - desconto) AS DECIMAL(10, 2)) as totalValor, -- Soma total com desconto
          CAST(SUM(valor * quantidade) AS DECIMAL(10, 2)) as totalVendas            -- Soma total de vendas
        FROM 
          servicos
        WHERE 
          DATE_FORMAT(realizadoEm, '%Y-%m') = ${month || `'${moment().format('YYYY-MM')}'`}
          AND realizado = true                    -- Filtra apenas serviços realizados
        GROUP BY 
          mes, clienteId
        ORDER BY 
          mes;
      `);
  
      return res.status(200).json(totalPorMes);
    } catch (error) {
      console.error('Erro ao obter total por mês:', error);
      return res.status(500).json({ message: error.message });
    }
  },

  async getTotalPorPeriodo(req, res) {
    try {
      const startDate = req.query.startDate; // Certifique-se de validar esses dados
      const endDate = req.query.endDate;     // Certifique-se de validar esses dados
  
      const totalPorPeriodo = await prisma.$queryRaw(`
        SELECT 
          DATE_FORMAT(realizadoEm, '%Y-%m') as mes,  -- Formata a data para exibir mês e ano
          COUNT(*) as totalServicos,                -- Conta o total de serviços realizados
          CAST(SUM(valor * quantidade - desconto) AS DECIMAL(10, 2)) as totalValor,  -- Soma total dos valores com desconto
          35 as totalVendas  -- Retorna um valor fixo de 35 para as vendas, conforme solicitado
        FROM 
          servicos
        WHERE 
          realizadoEm BETWEEN ${startDate} AND ${endDate}
          AND realizado = true  -- Filtra apenas serviços que foram realizados
        GROUP BY 
          mes
        ORDER BY 
          mes;
      `);
  
      // Converte BigInt para Number se necessário
      const result = totalPorPeriodo.map(item => ({
        ...item,
        totalValor: Number(item.totalValor),
        totalVendas: Number(item.totalVendas),
        totalServicos: Number(item.totalServicos),
      }));
  
      res.json(result);
    } catch (error) {
      console.error('Erro ao obter dados financeiros', error);
      res.status(500).json({ error: 'Erro ao obter os dados financeiros.' });
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
  async getServicoById (req, res) {
    const { id } = req.params;
    try {
      const servico = await prisma.servico.findUnique({
        where: { id: parseInt(id) },
        include: { servicoCatalogo: true, cliente: true },
      });
      if (!servico) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }
      res.json(servico);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar serviço" });
    }
  }
};

export default ServicoController;
