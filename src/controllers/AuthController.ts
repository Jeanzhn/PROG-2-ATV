import { Request, Response } from 'express';
import { bancoDados, ContaUsuario } from '../repositories/memoriaRepository';
import { PerfilUsuario } from '../@types/express';
import {
  emailFormatoValido,
  gerarHashSenha,
  gerarTokenSessao,
  nomeCompletoValido,
  senhaForteValida
} from '../utils/seguranca';

const PERFIS_PERMITIDOS: PerfilUsuario[] = ['Administrador', 'Professor', 'Aluno'];

export class AuthController {
  static registrarUsuario(req: Request, res: Response): any {
    const { nome, email, senha, perfil } = req.body;

    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({
        mensagem: "Os campos nome, email, senha e perfil são obrigatórios."
      });
    }

    if (!nomeCompletoValido(nome)) {
      return res.status(400).json({
        mensagem: "Informe o nome completo (nome e sobrenome)."
      });
    }

    const emailNormalizado = String(email).trim().toLowerCase();
    if (!emailFormatoValido(emailNormalizado)) {
      return res.status(400).json({
        mensagem: "Formato de e-mail inválido."
      });
    }

    if (!senhaForteValida(String(senha))) {
      return res.status(400).json({
        mensagem: "A senha deve ter pelo menos 8 caracteres, contendo letras e números."
      });
    }

    if (!PERFIS_PERMITIDOS.includes(perfil)) {
      return res.status(400).json({
        mensagem: "Perfil inválido. Escolha Administrador, Professor ou Aluno."
      });
    }

    const emailEmUso = bancoDados.usuarios.some(u => u.email === emailNormalizado);
    if (emailEmUso) {
      return res.status(409).json({
        mensagem: "Este e-mail já está cadastrado no sistema."
      });
    }

    if (
      (perfil === 'Administrador' || perfil === 'Professor') &&
      !emailNormalizado.endsWith('@academia.edu.br')
    ) {
      return res.status(400).json({
        mensagem: `Para o perfil ${perfil}, utilize um e-mail institucional (@academia.edu.br).`
      });
    }

    if (perfil === 'Administrador') {
      const qtdAdmins = bancoDados.usuarios.filter(u => u.perfil === 'Administrador').length;
      if (qtdAdmins >= 2) {
        return res.status(403).json({
          mensagem: "Regra de negócio: limite máximo de 2 Administradores atingido."
        });
      }
    }

    const sigla = perfil === 'Administrador' ? 'ADM' : perfil === 'Professor' ? 'PROF' : 'ALU';
    const id = bancoDados.usuarios.length + 1;

    const novoUsuario: ContaUsuario = {
      id,
      matricula: `${sigla}-2026${String(id).padStart(3, '0')}`,
      nome: nome.trim(),
      email: emailNormalizado,
      senhaCriptografada: gerarHashSenha(String(senha)),
      perfil,
      criadoEm: new Date()
    };

    bancoDados.usuarios.push(novoUsuario);

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      usuario: {
        id: novoUsuario.id,
        matricula: novoUsuario.matricula,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        perfil: novoUsuario.perfil
      }
    });
  }

  static autenticarUsuario(req: Request, res: Response): any {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        mensagem: "Preencha e-mail e senha para entrar."
      });
    }

    const emailNormalizado = String(email).trim().toLowerCase();
    const senhaHash = gerarHashSenha(String(senha));

    const conta = bancoDados.usuarios.find(
      u => u.email === emailNormalizado && u.senhaCriptografada === senhaHash
    );

    if (!conta) {
      return res.status(401).json({
        mensagem: "E-mail ou senha inválidos."
      });
    }

    const token = gerarTokenSessao();
    bancoDados.sessoesAtivas.set(token, conta);

    return res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id: conta.id,
        matricula: conta.matricula,
        nome: conta.nome,
        email: conta.email,
        perfil: conta.perfil
      }
    });
  }
}