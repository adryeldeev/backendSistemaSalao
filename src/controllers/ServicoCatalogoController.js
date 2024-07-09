import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export default {
  async createServicoCatalogo(req, res) {
    const { nome, preco } = req.body;

    try {
      const servicoCatalogo = await prisma.servicoCatalogo.create({
        data: {
          nome,
          preco,
        },
      });

      return res.json({
        error: false,
        message: 'Sucesso: Serviço cadastrado com sucesso!',
        servicoCatalogo,
      });
    } catch (error) {
      return res.json({ error: error.message });
    }
  },

  async findAll(req, res) {
    try {
      const servicoCatalogo = await prisma.servicoCatalogo.findMany();
      return res.json(servicoCatalogo);
    } catch (error) {
      return res.json({ error: error.message });
    }
  },

  async updateServicoCatalogo(req, res) {
    const { id } = req.params;
    const { nome, preco } = req.body;

    try {
      let servicoCatalogo = await prisma.servicoCatalogo.findUnique({ where: { id: Number(id) } });
      if (!servicoCatalogo) {
        return res.status(404).json({ message: 'Serviço no catálogo não encontrado' });
      }

      servicoCatalogo = await prisma.servicoCatalogo.update({
        where: { id: Number(id) },
        data: {
          nome,
          preco,
        }
      });

      return res.status(200).json({
        error: false,
        message: 'Sucesso: Serviço atualizado com sucesso!',
        servicoCatalogo,
      });
    } catch (error) {
      return res.json({ error: error.message });
    }
  },
  async deleteServicoCatalogo(req, res) {
    const { id } = req.params;
  
    try {
      const servicoCatalogo = await prisma.servicoCatalogo.delete({
        where: { id: Number(id) },
      });

      if(!servicoCatalogo){
        return res.status(404).json({ message: 'Serviço no catálogo não encontrado' });
      }

      return res.status(200).json({ message: 'Sucesso: Serviço deletado com sucesso!' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

};