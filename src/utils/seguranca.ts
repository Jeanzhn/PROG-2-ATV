import crypto from 'crypto';

export function gerarHashSenha(senha: string): string {
  return crypto.createHash('sha256').update(senha).digest('hex');
}

export function gerarTokenSessao(): string {
  return crypto.randomBytes(24).toString('hex');
}

export function emailFormatoValido(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function senhaForteValida(senha: string): boolean {
  // Mínimo 8 caracteres, ao menos uma letra e um número
  const temLetra = /[a-zA-Z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  return senha.length >= 8 && temLetra && temNumero;
}

export function nomeCompletoValido(nome: string): boolean {
  const partes = nome.trim().split(/\s+/);
  return partes.length >= 2 && partes.every(p => p.length >= 2);
}