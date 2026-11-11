import { Request, Response, NextFunction } from 'express';
import { bancoDados } from '../repositories/memoriaRepository';

export function autenticar(req: Request, res: Response, next: NextFunction): any {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      mensagem: "Usuário não autenticado. Token não informado."
    });
  }

  const token = authHeader.split(' ')[1];
  const usuarioAutenticado = bancoDados.sessoesAtivas.get(token);

  if (!usuarioAutenticado) {
    return res.status(401).json({
      mensagem: "Sessão inválida ou expirada. Faça login novamente."
    });
  }

  req.usuario = {
    id: usuarioAutenticado.id,
    matricula: usuarioAutenticado.matricula,
    nome: usuarioAutenticado.nome,
    email: usuarioAutenticado.email,
    perfil: usuarioAutenticado.perfil
  };

  return next();
}