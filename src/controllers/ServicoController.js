import moment from 'moment-timezone';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export default {
  async createServico(req, res) {
    const { produtoNome, realizadoEm, quantidade, valor, desconto, funcionario, clienteId } = req.body;

    try {
      const cliente = await prisma.cliente.findUnique({
        where: { id: Number(clienteId) }
      });

      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado' });
      }

      let servicoCatalogo = await prisma.servicoCatalogo.findFirst({
        where: { nome: produtoNome }
      });

      if (!servicoCatalogo) {
        return res.status(404).json({ message: 'Serviço no catálogo não encontrado' });
      }

      // Ajustando a data para o fuso horário America/Sao_Paulo
      const realizadoEmAdjusted = moment.tz(realizadoEm, 'America/Sao_Paulo').toISOString();

      const novoServico = await prisma.servico.create({
        data: {
          produtoNome: servicoCatalogo.nome,
          realizadoEm: realizadoEmAdjusted,
          quantidade,
          valor,
          desconto: desconto !== undefined ? Number(desconto) : undefined,
          funcionario,
          cliente: { connect: { id: Number(clienteId) } },
          servicoCatalogo: { connect: { id: servicoCatalogo.id } }
        }
      });

      return res.status(201).json(novoServico);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async findAllServico(req, res) {
    try {
      const servicos = await prisma.servico.findMany();
      return res.status(200).json(servicos);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async getServicoById(req, res) {
    const { id } = req.params;
    try {
      const servico = await prisma.servico.findUnique({
        where: { id: Number(id) }
      });
      if (!servico) {
        return res.status(404).json({ message: 'Serviço não encontrado' });
      }
      return res.status(200).json(servico);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async updateServico(req, res) {
    const { id } = req.params;
    const { produtoNome, realizadoEm, quantidade, valor, desconto, funcionario, clienteId } = req.body;
  
    try {
      let servico = await prisma.servico.findUnique({ where: { id: Number(id) } });
      if (!servico) {
        return res.status(404).json({ message: 'Serviço não encontrado' });
      }
  
      // Verifica se o cliente existe
      const cliente = await prisma.cliente.findUnique({
        where: { id: Number(clienteId) }
      });
  
      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado' });
      }
  
      // Busca pelo serviço no catálogo pelo nome do produto
      let servicoCatalogo = await prisma.servicoCatalogo.findFirst({
        where: {
          nome: servico.produtoNome // Utiliza o nome do produto do serviço existente
        }
      });
  
      if (!servicoCatalogo) {
        return res.status(404).json({ message: 'Serviço no catálogo não encontrado' });
      }
  
      // Ajusta a data para o fuso horário America/Sao_Paulo
      const realizadoEmAdjusted = moment.tz(realizadoEm, 'America/Sao_Paulo').toISOString();
  
      // Atualiza o serviço com os novos dados
      servico = await prisma.servico.update({
        where: { id: Number(id) },
        data: {
          realizadoEm: realizadoEmAdjusted, // Usa a data ajustada
          quantidade,
          valor,
          desconto: desconto !== undefined ? Number(desconto) : undefined,
          funcionario,
          cliente: { connect: { id: Number(clienteId) } }, // Conectar ao cliente existente
          servicoCatalogo: { connect: { id: servicoCatalogo.id } } // Conectar ao servicoCatalogo encontrado
        }
      });
  
      return res.status(200).json(servico);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async deleteServico(req, res) {
    const { id } = req.params;
    try {
      let servico = await prisma.servico.findUnique({ where: { id: Number(id) } });
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
    const { month } = req.query; // Captura o parâmetro de mês da query string, se existir
  
    try {
      let totalPorMes;
  
      if (month) {
        totalPorMes = await prisma.$queryRaw`
          SELECT 
            DATE_FORMAT(realizadoEm, '%Y-%m') as mes,
            clienteId,
            COUNT(*) as totalServicos,
            CAST(SUM(valor * quantidade - desconto) AS DECIMAL(10, 2)) as totalValor,
            CAST(SUM(valor * quantidade) AS DECIMAL(10, 2)) as totalVendas
          FROM 
            servicos
          WHERE 
            DATE_FORMAT(realizadoEm, '%Y-%m') = ${month}
          GROUP BY 
            mes, clienteId
          ORDER BY 
            mes;
        `;
      } else {
        totalPorMes = await prisma.$queryRaw`
          SELECT 
            DATE_FORMAT(realizadoEm, '%Y-%m') as mes,
            clienteId,
            COUNT(*) as totalServicos,
            CAST(SUM(valor * quantidade - desconto) AS DECIMAL(10, 2)) as totalValor,
            CAST(SUM(valor * quantidade) AS DECIMAL(10, 2)) as totalVendas
          FROM 
            servicos
          GROUP BY 
            mes, clienteId
          ORDER BY 
            mes;
        `;
      }
  
      // Converter BigInt para Number antes de enviar a resposta JSON
      const formattedData = totalPorMes.map(data => ({
        mes: data.mes,
        clienteId: data.clienteId,
        totalServicos: Number(data.totalServicos),
        totalValor: Number(data.totalValor),
        totalVendas: Number(data.totalVendas)
      }));
  
      return res.status(200).json(formattedData);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
 // Backend (Node.js / Express)

// Exemplo usando Prisma para consulta SQL segura
async getTotalPorPeriodo(req, res) {
  const { startDate, endDate } = req.query;

  try {
    const totalPorPeriodo = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(realizadoEm, '%Y-%m-%d') as data,
        clienteId,
        COUNT(*) as totalServicos,
        CAST(SUM(valor * quantidade - desconto) AS DECIMAL(10, 2)) as totalValor,
        CAST(SUM(valor * quantidade) AS DECIMAL(10, 2)) as totalVendas
      FROM 
        servicos
      WHERE 
        realizadoEm BETWEEN ${startDate} AND ${endDate}
      GROUP BY 
        data, clienteId
      ORDER BY 
        data;
    `;

    const formattedData = totalPorPeriodo.map(data => ({
      data: data.data,
      clienteId: data.clienteId,
      totalServicos: Number(data.totalServicos),
      totalValor: Number(data.totalValor),
      totalVendas: Number(data.totalVendas)
    }));

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({ message: error.message });
  }
},


  

  async getServicosByClienteId(req, res) {
    const { id } = req.params;
    try {
      const servicos = await prisma.servico.findMany({
        where: { clienteId: Number(id) },
      });
      if (!servicos || servicos.length === 0) {
        return res.status(404).json({ message: 'Nenhum serviço encontrado para este cliente' });
      }

      // Ajustando as datas para o fuso horário America/Sao_Paulo ao retornar
      const servicosAdjusted = servicos.map(servico => {
        servico.realizadoEm = moment.tz(servico.realizadoEm, 'America/Sao_Paulo').format();
        return servico;
      });

      return res.status(200).json(servicosAdjusted);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};
