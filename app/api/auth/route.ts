import { NextResponse } from 'next/server';
import { UsuarioService } from '@/src/services/UsuarioService';
import { UsuarioRepository } from '@/src/repositories/UsuarioRepository';

const service = new UsuarioService(new UsuarioRepository());

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: 'Corpo da requisição inválido.' }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== 'object' ||
    !('email' in body) ||
    typeof body.email !== 'string' ||
    !('senha' in body) ||
    typeof body.senha !== 'string'
  ) {
    return NextResponse.json({ erro: 'Informe e-mail e senha.' }, { status: 400 });
  }

  try {
    const usuario = await service.autenticar(body.email, body.senha);
    if (!usuario) {
      return NextResponse.json({ erro: 'E-mail ou senha incorretos.' }, { status: 401 });
    }
    return NextResponse.json(usuario, { status: 200 });
  } catch (e: unknown) {
    console.error('Falha ao autenticar usuário:', e);
    return NextResponse.json(
      { erro: 'Não foi possível verificar as credenciais. Tente novamente.' },
      { status: 500 },
    );
  }
}
