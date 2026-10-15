import prisma from '@/src/lib/prisma';
import { MovimentacaoEntity } from '../entities/MovimentacaoEntity';
import { MovimentacaoProps } from '../interfaces';
export class MovimentacaoRepository {
async listarTodos(): Promise<MovimentacaoEntity[]> {
const movs = await prisma.movimentacao.findMany({
orderBy: { data_movimentacao: 'desc' },
include: {
produto: { select: { codigo: true, descricao: true, unidade: true } },
usuario: { select: { nome: true } }
}
});
return movs.map(m => new MovimentacaoEntity({
id: m.id,
produtoId: m.produto_id,
usuarioId: m.usuario_id,
tipo: m.tipo,
quantidade: m.quantidade,
data: m.data_movimentacao,
produtoCodigo: m.produto.codigo,
produtoDescricao: m.produto.descricao,
produtoUnidade: m.produto.unidade,
usuarioNome: m.usuario.nome
}));
}
async buscarPorId(id: number): Promise<MovimentacaoEntity | null> {
const m = await prisma.movimentacao.findUnique({ where: { id }
});
return m ? new MovimentacaoEntity({
id: m.id,
produtoId: m.produto_id,
usuarioId: m.usuario_id,
tipo: m.tipo,quantidade: m.quantidade,
data: m.data_movimentacao
}) : null;
}
async criar(props: MovimentacaoProps): Promise<MovimentacaoEntity>
{
const m = await prisma.movimentacao.create({
data: {
produto_id: props.produtoId,
usuario_id: props.usuarioId,
tipo: props.tipo,
quantidade: props.quantidade
}
});
return new MovimentacaoEntity({
id: m.id,
produtoId: m.produto_id,
usuarioId: m.usuario_id,
tipo: m.tipo,
quantidade: m.quantidade,
data: m.data_movimentacao
});
}
async excluir(id: number): Promise<void> {
await prisma.movimentacao.delete({ where: { id } });
}
}