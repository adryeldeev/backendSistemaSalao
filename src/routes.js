import { Router } from 'express';
import { authenticate } from './middlewares/auth.js';
import ClienteController from './controllers/ClienteController.js';
import ServicoController from './controllers/ServicoController.js';
import ServicoCatalogoController from './controllers/ServicoCatalogoController.js';
import UserController from './controllers/UserController.js';
import ResetPassowrdController from './controllers/ResetPassowrdController.js';

const router = Router();

// Rotas para Usuários
router.post('/createUser',UserController.createUser)
router.post('/login', UserController.loginUser)
router.get('/validation', UserController.validateToken)
router.get('/user/:id',authenticate, UserController.getUserById)


// Rota para solicitar a recuperação de senha (enviar o link de recuperação)
router.post('/reset-password-reset', ResetPassowrdController.requestPasswordReset)

// Rota para redefinir a senha (validar o token e atualizar a senha)
router.post('/reset-passsword', ResetPassowrdController.resetPassword)

// Rotas para Clientes
router.post('/createCliente',authenticate, ClienteController.createCliente);
router.get('/clientes',authenticate, ClienteController.findAll);
router.get('/clientes/:id', authenticate, ClienteController.getClienteById);
router.put('/updateCliente/:id',authenticate, ClienteController.updateCliente);
router.delete('/deleteCliente/:id',authenticate, ClienteController.deleteCliente);
router.get('/clientes/relevantes', authenticate, ClienteController.getClientesRelevantes);
      
// Rotas para Serviços
router.post('/criarServico', authenticate, ServicoController.createServico);
router.get('/servicos',authenticate, ServicoController.findAllServico);
router.get('/servico/:id', authenticate, ServicoController.getServicoById);
router.get('/servico/cliente/:id',authenticate, ServicoController.getServicosByClienteId);
router.put('/updateServico/:id',authenticate, ServicoController.updateServico);
router.put('/confirmarServico/:id', authenticate, ServicoController.updateRealizado);
router.delete('/deletarServico/:id',authenticate, ServicoController.deleteServico);
router.get('/financas/total-por-periodo', authenticate, ServicoController.getTotalPorPeriodo);
router.put('/clientes-relevantes/:id', authenticate, ServicoController.updateClienteRelevancia);

// Rotas para Catálogo de Serviços
router.post('/criarServico-catalogo',authenticate,  ServicoCatalogoController.createServicoCatalogo);
router.get('/servico-catalogo', authenticate, ServicoCatalogoController.findAll);
router.put('/servicoCatalogoUpdate/:id',authenticate,  ServicoCatalogoController.updateServicoCatalogo);
router.delete('/servicoCatalogoDelete/:id', authenticate, ServicoCatalogoController.deleteServicoCatalogo);

export { router };
