import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export default {
  async createCliente(req, res) {
    const { nome, sobrenome, celular, dataCadastro, horario } = req.body;

    // Validar se todos os campos obrigatórios estão presentes
    if (!nome || !sobrenome || !celular || !dataCadastro || !horario) {
      return res.status(400).json({
        error: true,
        message: "Erro: Todos os campos são obrigatórios!"
      });
    }

    try {
      // Verificar se o cliente já existe pelo número de celular
      let clienteExistente = await prisma.cliente.findFirst({
        where: { celular: celular }
      });

      if (clienteExistente) {
        return res.status(400).json({
          error: true,
          message: "Erro: Cliente já existe!"
        });
      }

      // Criar o cliente no banco de dados
      const cliente = await prisma.cliente.create({
        data: {
          nome,
          sobrenome,
          celular,
          dataCadastro: new Date(dataCadastro), // Converte automaticamente para ISO-8601
          horario,
        }
      });

      return res.status(201).json({
        error: false,
        message: "Sucesso: Cliente cadastrado com sucesso!",
        cliente
      });

    } catch (error) {
      // Tratar erros do Prisma ou outros erros internos
      return res.status(500).json({ message: error.message });
    }
  },

  async findAll(req, res) {
    try {
      const clientes = await prisma.cliente.findMany();
      return res.status(200).json(clientes);
    } catch (error) {
      return res.status(500).json({ message: error.message });
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
    const { nome, sobrenome, celular, dataCadastro, horario } = req.body;

    try {
      // Verificar se o cliente existe pelo ID
      let cliente = await prisma.cliente.findUnique({ where: { id: Number(id) } });
      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado' });
      }

      // Atualizar os dados do cliente
      cliente = await prisma.cliente.update({
        where: { id: Number(id) },
        data: {
          nome,
          sobrenome,
          celular,
          dataCadastro: new Date(dataCadastro), // Converte automaticamente para ISO-8601
          horario,
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
      // Verificar se o cliente existe pelo ID
      let cliente = await prisma.cliente.findUnique({ where: { id: Number(id) } });

      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado' });
      }

      // Deletar o cliente do banco de dados
      await prisma.cliente.delete({ where: { id: Number(id) } });

      return res.status(200).json({
        error: false,
        message: "Sucesso: Cliente deletado com sucesso!"
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};
