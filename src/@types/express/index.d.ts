export {};

export type PerfilUsuario = 'Administrador' | 'Professor' | 'Aluno';

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: number;
        matricula: string;
        nome: string;
        email: string;
        perfil: PerfilUsuario;
      };
    }
  }
}