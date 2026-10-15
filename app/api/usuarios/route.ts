import { NextResponse } from 'next/server';
import { UsuarioService } from '@/src/services/UsuarioService';
import { UsuarioRepository } from '@/src/repositories/UsuarioRepository';
const service = new UsuarioService(new UsuarioRepository());
export async function GET() {
  try {
    const usuarios = await service.listar();
    return NextResponse.json(usuarios, { status: 200 });
  } catch (e: unknown) {
    const erro = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ erro }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const novoUsuario = await service.cadastrar(body);
    return NextResponse.json(novoUsuario, { status: 201 });
  } catch (e: unknown) {
    const erro = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ erro }, { status: 400 });
  }
}