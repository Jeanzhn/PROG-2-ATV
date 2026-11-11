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
        erro: "Dados incompletos",
        mensagem: "Os campos nome, email, senha e perfil são obrigatórios."
      });
    }

    if (!nomeCompletoValido(nome)) {
      return res.status(400).json({
        erro: "Nome inválido",
        mensagem: "Informe o nome completo (nome e sobrenome)."
      });
    }

    const emailNormalizado = String(email).trim().toLowerCase();
    if (!emailFormatoValido(emailNormalizado)) {
      return res.status(400).json({
        erro: "E-mail inválido",
        mensagem: "O endereço de e-mail informado não possui um formato válido."
      });
    }

    if (!senhaForteValida(String(senha))) {
      return res.status(400).json({
        erro: "Senha fraca",
        mensagem: "A senha deve ter no mínimo 8 caracteres e conter letras e números."
      });
    }

    if (!PERFIS_PERMITIDOS.includes(perfil)) {
      return res.status(400).json({
        erro: "Perfil desconhecido",
        mensagem: "O perfil deve ser: Administrador, Professor ou Aluno."
      });
    }

    const usuarioJaCadastrado = bancoDados.usuarios.some(
      u => u.email === emailNormalizado
    );
    if (usuarioJaCadastrado) {
      return res.status(409).json({
        erro: "Conflito de cadastro",
        mensagem: "Já existe um usuário registrado com este e-mail."
      });
    }

    if (
      (perfil === 'Administrador' || perfil === 'Professor') &&
      !emailNormalizado.endsWith('@academia.edu.br')
    ) {
      return res.status(400).json({
        erro: "Regra institucional violada",
        mensagem: `Usuários com perfil de ${perfil} devem utilizar o domínio @academia.edu.br.`
      });
    }

    if (perfil === 'Administrador') {
      const totalAdmins = bancoDados.usuarios.filter(
        u => u.perfil === 'Administrador'
      ).length;
      if (totalAdmins >= 2) {
        return res.status(403).json({
          erro: "Limite atingido",
          mensagem: "O sistema permite no máximo 2 Administradores ativos."
        });
      }
    }

    const prefixoMatricula =
      perfil === 'Administrador' ? 'ADM' : perfil === 'Professor' ? 'DOC' : 'ALU';
    const novoId = bancoDados.usuarios.length + 1;

    const novaConta: ContaUsuario = {
      id: novoId,
      matricula: `${prefixoMatricula}-2026${String(novoId).padStart(3, '0')}`,
      nome: nome.trim(),
      email: emailNormalizado,
      senhaCriptografada: gerarHashSenha(String(senha)),
      perfil,
      criadoEm: new Date()
    };

    bancoDados.usuarios.push(novaConta);

    return res.status(201).json({
      mensagem: "Cadastro realizado com sucesso!",
      dados: {
        id: novaConta.id,
        matricula: novaConta.matricula,
        nome: novaConta.nome,
        email: novaConta.email,
        perfil: novaConta.perfil
      }
    });
  }

  static autenticarUsuario(req: Request, res: Response): any {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        mensagem: "Informe o e-mail e a senha para realizar o login."
      });
    }

    const emailNormalizado = String(email).trim().toLowerCase();
    const hashRecebido = gerarHashSenha(String(senha));

    const conta = bancoDados.usuarios.find(
      u => u.email === emailNormalizado && u.senhaCriptografada === hashRecebido
    );

    if (!conta) {
      return res.status(401).json({
        mensagem: "E-mail ou senha incorretos."
      });
    }

    const token = gerarTokenSessao();
    bancoDados.sessoesAtivas.set(token, conta);

    return res.status(200).json({
      mensagem: "Autenticação concluída com sucesso.",
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