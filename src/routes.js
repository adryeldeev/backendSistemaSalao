import { Router } from 'express';
import ClienteController from './controllers/ClienteController.js';
import ServicoController from './controllers/ServicoController.js';
import ServicoCatalogoController from './controllers/ServicoCatalogoController.js';

const router = Router();

// Rotas para Clientes
router.post('/createCliente', ClienteController.createCliente);
router.get('/clientes', ClienteController.findAll);
router.get('/clientes/:id', ClienteController.getClienteById);
router.put('/updateCliente/:id', ClienteController.updateCliente);
router.delete('/deleteCliente/:id', ClienteController.deleteCliente);
router.get('/clientes/relevantes', ClienteController.getClientesRelevantes);
      
// Rotas para Serviços
router.post('/criarServico', ServicoController.createServico);
router.get('/servicos', ServicoController.findAllServico);
router.get('/servico/:id', ServicoController.getServicoById);
router.get('/servico/cliente/:id', ServicoController.getServicosByClienteId);
router.put('/updateServico/:id', ServicoController.updateServico);
router.put('/confirmarServico/:id', ServicoController.updateRealizado);
router.delete('/deletarServico/:id', ServicoController.deleteServico);
router.get('/financas/total-por-mes', ServicoController.getTotalPorMes);
router.get('/financas/total-por-periodo', ServicoController.getTotalPorPeriodo);
router.put('/clientes-relevantes/:id', ServicoController.updateClienteRelevancia);

// Rotas para Catálogo de Serviços
router.post('/criarServico-catalogo', ServicoCatalogoController.createServicoCatalogo);
router.get('/servico-catalogo', ServicoCatalogoController.findAll);
router.put('/servicoCatalogoUpdate/:id', ServicoCatalogoController.updateServicoCatalogo);
router.delete('/servicoCatalogoDelete/:id', ServicoCatalogoController.deleteServicoCatalogo);

export { router };
