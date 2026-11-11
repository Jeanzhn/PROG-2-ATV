import { Request, Response, NextFunction } from 'express';
import { bancoDados } from '../repositories/memoriaRepository';

export function autenticar(req: Request, res: Response, next: NextFunction): any {
  const authHeader = req.headers.authorization;
  const emailLegado = req.headers['x-user-email'] as string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
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

  return res.status(401).json({
    mensagem: "Token de autenticação não fornecido. Envie o header Authorization."
  });
}