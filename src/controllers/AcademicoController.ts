
import { Request, Response } from 'express';
import { bancoDados } from '../repositories/memoriaRepository';

export class AcademicoController {
  static relatorioGeralSistema(req: Request, res: Response): any {
    const resumoPerfis = {
      administradores: bancoDados.usuarios.filter(u => u.perfil === 'Administrador').length,
      professores: bancoDados.usuarios.filter(u => u.perfil === 'Professor').length,
      alunos: bancoDados.usuarios.filter(u => u.perfil === 'Aluno').length
    };

    const listaUsuarios = bancoDados.usuarios.map(u => ({
      id: u.id,
      matricula: u.matricula,
      nome: u.nome,
      email: u.email,
      perfil: u.perfil,
      criadoEm: u.criadoEm
    }));

    return res.json({
      painel: "Gestão Administrativa",
      solicitante: req.usuario?.nome,
      estatisticas: resumoPerfis,
      usuariosCadastrados: listaUsuarios
    });
  }

  static lancarNotaAluno(req: Request, res: Response): any {
    const { emailAluno, disciplina, nota } = req.body;

    if (!emailAluno || !disciplina || nota === undefined) {
      return res.status(400).json({
        mensagem: "Informe emailAluno, disciplina e nota."
      });
    }

    const notaNumerica = Number(nota);
    if (isNaN(notaNumerica) || notaNumerica < 0 || notaNumerica > 10) {
      return res.status(400).json({
        mensagem: "A nota deve ser um valor numérico entre 0 e 10."
      });
    }

    const novoRegistro = {
      id: bancoDados.avaliacoes.length + 1,
      emailAluno: String(emailAluno).toLowerCase(),
      disciplina,
      nota: notaNumerica,
      professorResponsavel: req.usuario!.nome
    };

    bancoDados.avaliacoes.push(novoRegistro);

    return res.status(201).json({
      mensagem: "Nota registrada no diário de classe com sucesso.",
      avaliacao: novoRegistro
    });
  }

  static consultarDiarioClasse(req: Request, res: Response): any {
    return res.json({
      setor: "Coordenação e Docência",
      acessadoPor: `${req.usuario?.nome} (${req.usuario?.perfil})`,
      totalAvaliacoesLancadas: bancoDados.avaliacoes.length,
      registros: bancoDados.avaliacoes
    });
  }

  static consultarBoletimPessoal(req: Request, res: Response): any {
    const emailLogado = req.usuario!.email;
    const minhasNotas = bancoDados.avaliacoes.filter(
      av => av.emailAluno === emailLogado
    );

    return res.json({
      portal: "Área do Aluno",
      aluno: req.usuario?.nome,
      matricula: req.usuario?.matricula,
      boletim: minhasNotas.length > 0
        ? minhasNotas
        : "Nenhuma avaliação lançada para sua matrícula até o momento."
    });
  }
}