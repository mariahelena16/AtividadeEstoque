'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../lib/api';
import Swal from 'sweetalert2';
type ProdutoLista = {
id: number;
codigo: string;
descricao: string;
unidade: string;
quantidade: number;
estoqueMinimo: number;
};
export default function ListaProdutos() {
const [produtos, setProdutos] = useState<ProdutoLista[]>([]);
const [busca, setBusca] = useState('');
const carregar = async () => {
const res = await api.get<ProdutoLista[]>('/produtos');
setProdutos(res.data);
};
useEffect(() => { carregar(); }, []);
const excluir = async (id: number) => {
const confirmacao = await Swal.fire({ title: 'Confirmar exclusão?', icon: 'warning', showCancelButton: true });
if (confirmacao.isConfirmed) {
await api.delete(`/produtos/${id}`);
Swal.fire('Eliminado!', 'Produto removido com sucesso.', 'success');
carregar();
}
};
const filtrados = produtos.filter(p => p.descricao.toLowerCase().includes(busca.toLowerCase()));
return (
<div className="p-8 max-w-5xl mx-auto">
<div className="flex justify-between mb-6 items-center">
<h1 className="text-2xl font-bold">Catálogo de Produtos
</h1>
<Link href="/dashboard" className="text-slate-500 hove
r:underline">Voltar ao Menu</Link>
</div>
<div className="flex gap-4 mb-6">
<input type="text" placeholder="Pesquisar produto..." value={busca} onChange={e => setBusca(e.target.value)} className="w-full
p-2 border rounded outline-none focus:ring-2 focus:ring-blue-400"/>
<Link href="/produtos/form" className="bg-blue-600 text
-white px-4 py-2 rounded whitespace-nowrap">+ Novo Produto</Link>
</div>
<table className="w-full bg-white shadow rounded border ove
rflow-hidden">
<thead className="bg-slate-100 border-b">
<tr><th className="p-3 text-left">Código</th><th className="p-3 text-left">Descrição</th><th className="p-3 text-center">Saldo</th><th className="p-3 text-center">Mínimo</th><th className="p-3 text-center">Estado</th><th className="p-3 text-center">Ações</th></tr>
</thead>
<tbody className="divide-y">
{filtrados.map(p => (
<tr key={p.id}>
<td className="p-3">{p.codigo}</td>
<td className="p-3 font-medium">{p.descricao}</td>
<td className="p-3 text-center">{p.quantidade} {p.unidade || 'un'}</td>
<td className="p-3 text-center">{p.estoqueMinimo} {p.unidade || 'un'}</td>
<td className="p-3 text-center">
{p.quantidade === 0 ? (
<span className="rounded bg-red-100 px-2 py-1 text-sm font-medium text-red-700">Esgotado</span>
) : p.quantidade <= p.estoqueMinimo ? (
<span className="rounded bg-amber-100 px-2 py-1 text-sm font-medium text-amber-700">Estoque baixo</span>
) : (
<span className="rounded bg-emerald-100 px-2 py-1 text-sm font-medium text-emerald-700">Normal</span>
)}
</td>
<td className="p-3 text-center space-x-4">
<Link href={`/produtos/form?id=${p.id}
`} className="text-blue-500 font-medium">Editar</Link>
<button onClick={() => excluir(p.id)} className="text-red-500 font-medium">Eliminar</button>
</td>
</tr>
))}
</tbody>
</table>
</div>
);
}