import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AcademicoController } from '../controllers/AcademicoController';
import { autenticar } from '../middlewares/autenticar';
import { verificarPermissao } from '../middlewares/verificarPermissao';

const rotas = Router();

// --- ATIVIDADE 1: Rotas Públicas de Cadastro e Autenticação ---
rotas.post('/usuarios/cadastrar', AuthController.registrarUsuario);
rotas.post('/login', AuthController.autenticarUsuario);

// --- ATIVIDADE 2: Rotas Protegidas por Perfil ---

// 1. Acesso exclusivo do Administrador
rotas.get(
  '/admin/dashboard',
  autenticar,
  verificarPermissao('Administrador'),
  AcademicoController.relatorioGeralSistema
);

rotas.post(
  '/professor/avaliacoes',
  autenticar,
  verificarPermissao('Professor'),
  AcademicoController.lancarNotaAluno
);

rotas.get(
  '/professor/turmas',
  autenticar,
  verificarPermissao('Professor', 'Administrador'),
  AcademicoController.consultarDiarioClasse
);

rotas.get(
  '/aluno/boletim',
  autenticar,
  verificarPermissao('Aluno'),
  AcademicoController.consultarBoletimPessoal
);

export default rotas;