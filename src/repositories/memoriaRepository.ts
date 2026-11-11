import { PerfilUsuario } from '../@types/express';

export interface ContaUsuario {
  id: number;
  matricula: string;
  nome: string;
  email: string;
  senhaCriptografada: string;
  perfil: PerfilUsuario;
  criadoEm: Date;
}

export interface AvaliacaoAluno {
  id: number;
  emailAluno: string;
  disciplina: string;
  nota: number;
  professorResponsavel: string;
}

export const bancoDados = {
  usuarios: [] as ContaUsuario[],
  sessoesAtivas: new Map<string, ContaUsuario>(), // Mapeia Token -> Usuário
  avaliacoes: [
    {
      id: 1,
      emailAluno: 'aluno@email.com',
      disciplina: 'Engenharia de Software',
      nota: 8.5,
      professorResponsavel: 'Prof. Carlos'
    }
  ] as AvaliacaoAluno[]
};