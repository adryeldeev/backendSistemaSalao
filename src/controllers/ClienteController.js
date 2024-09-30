import pkg from '@prisma/client';
import moment from 'moment-timezone';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export default {
  async createCliente(req, res) {
    const { nome, sobrenome, celular, dataCadastro, horario } = req.body;
  
    if (!nome || !sobrenome || !celular || !dataCadastro || !horario) {
      return res.status(400).json({
        error: true,
        message: "Erro: Todos os campos são obrigatórios!"
      });
    }
  
    try {
      let clienteExistente = await prisma.cliente.findFirst({
        where: { celular: celular }
      });
  
      if (clienteExistente) {
        return res.status(400).json({
          error: true,
          message: "Erro: Cliente já existe!"
        });
      }
      
      const realizadoEmAdjusted = moment.tz(dataCadastro, 'America/Sao_Paulo').toISOString();
      
      const cliente = await prisma.cliente.create({
        data: {
          nome,
          sobrenome,
          celular,
          dataCadastro: new Date(realizadoEmAdjusted),
          horario,
          visitCount: 0, 
          relevanceScore: 0.0,
          frequencia: 0,
          relevante:0
        }
      });
  
      return res.status(201).json({
        error: false,
        message: "Sucesso: Cliente cadastrado com sucesso!",
        cliente
      });
  
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  
 
 
  async findAll(req, res) {
    try {
      const clientes = await prisma.cliente.findMany({
        select: {
          id: true,
          nome: true,
          sobrenome: true,
          celular: true,
          dataCadastro: true,
          horario: true,
          relevanceScore: true,
          relevante: true,
      }});
      return res.status(200).json(clientes);
    } catch (error) {
      return res.status(500).json({ message: error.message });
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
},
  async getClienteById(req, res) {
    const { id } = req.params;
    
    try {

      const cliente = await prisma.cliente.findUnique({
        where: { id: Number(id) }
      });
      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado' });
      }
      return res.status(200).json(cliente);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async updateCliente(req, res) {
    const { id } = req.params;
    const { nome, sobrenome, celular, dataCadastro, horario, visitCount, relevanceScore } = req.body;
  
    try {
      let cliente = await prisma.cliente.findUnique({ where: { id: Number(id) } });
      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado' });
      }
  
      const realizadoEmAdjusted = moment.tz(dataCadastro, 'America/Sao_Paulo').toISOString();
  
      cliente = await prisma.cliente.update({
        where: { id: Number(id) },
        data: {
          nome,
          sobrenome,
          celular,
          dataCadastro: new Date(realizadoEmAdjusted),
          horario,
          visitCount: visitCount || cliente.visitCount,
          relevanceScore: relevanceScore || cliente.relevanceScore,
          frequencia: frequencia !== undefined ? frequencia : cliente.frequencia, 
          relevante: relevante !== undefined ? relevante : cliente.relevante 
        
        }
      });
  
      return res.status(200).json({
        error: false,
        message: "Sucesso: Cliente atualizado com sucesso!",
        cliente
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async deleteCliente(req, res) {
    const { id } = req.params;
    try {
      
      let cliente = await prisma.cliente.findUnique({ where: { id: Number(id) } });

      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado' });
      }

      await prisma.cliente.delete({ where: { id: Number(id) } });

      return res.status(200).json({
        error: false,
        message: "Sucesso: Cliente deletado com sucesso!"
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
 
  async atualizarRelevancia(clienteId, novoScore) {
    const clienteAtualizado = await prisma.cliente.update({
      where: { id: clienteId },
      data: {
        relevanceScore: novoScore,
        relevante: novoScore > 5 
      }
    });
    return clienteAtualizado;
  }
};

