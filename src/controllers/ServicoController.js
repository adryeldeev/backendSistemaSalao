import { PrismaClient } from '@prisma/client';
import moment from "moment-timezone";
const prisma = new PrismaClient();



const getMesAtual = () => {
  return moment().format("YYYY-MM");
};

const ServicoController = {
  // Criação de um novo Serviço
  async createServico(req, res) {
    const { produtoNome, realizadoEm, horario, quantidade, valor, desconto, funcionario, clienteId } = req.body;
    
    const userId = req.userId;
  
    if (!clienteId || isNaN(Number(clienteId))) {
      return res.status(400).json({ message: "Erro: ID do cliente é inválido." });
    }
  
    try {
      const cliente = await prisma.cliente.findUnique({
        where: {
          id: clienteId, // ID do cliente que você está procurando
        },
        include: {
          user: true, // Isso traz o usuário associado ao cliente
        },
      });
      
      if (!cliente || cliente.userId !== userId) {
        throw new Error("Cliente não encontrado ou não pertence ao usuário.");
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
          desconto: desconto !== undefined ? Number(desconto) : 0,    // Alterado para `undefined` ao invés de `null`
          funcionario,
          cliente: { connect: { id: Number(clienteId) } },
          servicoCatalogo: { connect: { id: servicoCatalogo.id } },
          user: userId ? { connect: { id: userId } } : undefined,
          lastUpdated: new Date(),
        },
      });
  
      await ServicoController.updateClienteRelevancia(clienteId, userId);
  
      return res.status(201).json({ message: "Serviço criado com sucesso!", novoServico });
    } catch (error) {
      console.error("Erro ao criar serviço:", error.message, error.stack); // Para imprimir todos os detalhes no console
  
      // Retorne detalhes completos do erro para o frontend (apenas em desenvolvimento, pois pode ser inseguro em produção)
      return res.status(500).json({
        message: "Erro interno no servidor.",
        error: error.message,  // Para enviar a mensagem completa do erro
        stack: error.stack,    // Para enviar o stack trace do erro (opcional)
      });
    }
  },
    // Atualização de um Serviço
    async updateServico(req, res) {
      const { id } = req.params;
      const { produtoNome, realizadoEm, horario, quantidade, valor, desconto, funcionario, clienteId } = req.body;
  
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: "Erro: ID do serviço é inválido." });
      }
  
      try {
        const servico = await prisma.servico.findUnique({ where: { id: Number(id) } });
  
        if (!servico) {
          return res.status(404).json({ message: "Serviço não encontrado." });
        }
  
        const realizadoEmAdjusted = moment.tz(realizadoEm, "America/Sao_Paulo").toISOString();
  
        const servicoAtualizado = await prisma.servico.update({
          where: { id: Number(id) },
          data: {
            produtoNome,
            realizadoEm: realizadoEmAdjusted,
            horario,
            quantidade,
            valor,
            desconto: desconto ? Number(desconto) : null,
            funcionario,
            cliente: { connect: { id: Number(clienteId) } },
            lastUpdated: new Date(),
          },
        });
  
        await ServicoController.updateClienteRelevancia(clienteId);
  
        return res.status(200).json({ message: "Serviço atualizado com sucesso!", servicoAtualizado });
      } catch (error) {
        console.log('Error :', error)
        return res.status(500).json({ message: "Erro interno no servidor." });
      }
    },
  
    // Atualização do status de realização do serviço
    async updateRealizado(req, res) {
      const { id } = req.params;
      const { realizado } = req.body;
  
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: "Erro: ID do serviço é inválido." });
      }
  
      try {
        const servico = await prisma.servico.findUnique({ where: { id: Number(id) } });
  
        if (!servico) {
          return res.status(404).json({ message: "Serviço não encontrado." });
        }
  
        const servicoAtualizado = await prisma.servico.update({
          where: { id: Number(id) },
          data: { realizado: Boolean(realizado) },
        });
  
        return res.status(200).json({ message: "Status atualizado com sucesso!", servicoAtualizado });
      } catch (error) {
        console.error("Erro ao atualizar status do serviço:", error);
        return res.status(500).json({ message: "Erro interno no servidor." });
      }
    },
  
    // Deleção de um Serviço
    async deleteServico(req, res) {
      const { id } = req.params;
  
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: "Erro: ID do serviço é inválido." });
      }
  
      try {
        const servico = await prisma.servico.findUnique({ where: { id: Number(id) } });
  
        if (!servico) {
          return res.status(404).json({ message: "Serviço não encontrado." });
        }
  
        await prisma.servico.delete({ where: { id: Number(id) } });
  
        return res.status(200).json({ message: "Serviço deletado com sucesso!" });
      } catch (error) {
        console.error("Erro ao deletar serviço:", error);
        return res.status(500).json({ message: "Erro interno no servidor." });
      }
    },
  
    // Listagem de todos os Serviços
    async findAllServico(req, res) {
      const { userId } = req.query;
  
      try {
        const servicos = await prisma.servico.findMany({
          where: userId ? { userId } : undefined,
          include: { servicoCatalogo: true, cliente: true },
        });
  
        return res.status(200).json(servicos);
      } catch (error) {
        console.error("Erro ao listar serviços:", error);
        return res.status(500).json({ message: "Erro interno no servidor." });
      }
    },
  
    // Busca de Serviços por Cliente
    async getServicosByClienteId(req, res) {
      const { id } = req.params;
  
      try {
        const servicos = await prisma.servico.findMany({
          where: { clienteId: Number(id) },
          include: { servicoCatalogo: true },
        });
  
        return res.status(200).json(servicos);
      } catch (error) {
        console.error("Erro ao listar serviços por cliente:", error);
        return res.status(500).json({ message: "Erro interno no servidor." });
      }
    },
  
    // Busca de um único Serviço por ID
    async getServicoById(req, res) {
      const { id } = req.params;
  
      try {
        const servico = await prisma.servico.findUnique({
          where: { id: Number(id) },
          include: { servicoCatalogo: true, cliente: true },
        });
  
        if (!servico) {
          return res.status(404).json({ message: "Serviço não encontrado." });
        }
  
        return res.status(200).json(servico);
      } catch (error) {
        console.error("Erro ao buscar serviço:", error);
        return res.status(500).json({ message: "Erro interno no servidor." });
      }
    },
  
    // Atualização da Relevância do Cliente
    async updateClienteRelevancia(clienteId, userId) {
      try {
        const mesAtual = getMesAtual();
  
        const cliente = await prisma.cliente.findUnique({ where: { id: Number(clienteId) } });
  
        if (!cliente || cliente.userId !== userId) return;
  
        if (!cliente.lastUpdated || moment(cliente.lastUpdated).format("YYYY-MM") !== mesAtual) {
          await prisma.cliente.update({
            where: { id: Number(clienteId) },
            data: { visitCount: 0, relevanceScore: 0, lastUpdated: new Date() },
          });
        }
  
        const totalServicosMensais = await prisma.servico.count({
          where: {
            clienteId: Number(clienteId),
            userId,
            realizadoEm: { gte: moment().startOf("month").toISOString(), lte: moment().endOf("month").toISOString() },
            realizado: true,
          },
        });
  
        if (totalServicosMensais > 0) {
          const relevanceScore = totalServicosMensais >= 10 ? 10 : totalServicosMensais >= 5 ? 5 : 0;
  
          await prisma.cliente.update({
            where: { id: Number(clienteId) },
            data: { relevanceScore, visitCount: totalServicosMensais },
          });
        }
      } catch (error) {
        console.error("Erro ao atualizar relevância do cliente:", error);
      }
    },


    async getTotalPorPeriodo(req, res) {
      try {
        const { startDate, endDate } = req.query;
    
        if (!startDate || !endDate) {
          return res.status(400).json({ error: "Datas de início e fim são obrigatórias." });
        }
    
        const totalPorPeriodo = await prisma.$queryRaw`
          SELECT 
            DATE_FORMAT(realizadoEm, '%Y-%m-%d') as data,  -- Formata a data para exibir dia, mês e ano
            COUNT(*) as totalServicos,                    -- Conta o total de serviços realizados
            CAST(SUM(valor * quantidade - desconto) AS DECIMAL(10, 2)) as totalValor  -- Soma total dos valores com desconto
          FROM 
            servico
          WHERE 
            realizadoEm BETWEEN ${startDate} AND ${endDate}  -- Filtra pelo período
            AND realizado = true                             -- Filtra apenas serviços confirmados
          GROUP BY 
            data
          ORDER BY 
            data;
        `;
    
        // Converte BigInt para Number se necessário
        const result = totalPorPeriodo.map(item => ({
          ...item,
          totalValor: Number(item.totalValor),
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

 
  
};

export default ServicoController;
