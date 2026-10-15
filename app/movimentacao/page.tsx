'use client';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import Swal from 'sweetalert2';
import Link from 'next/link';
type ProdutoOpcao = {
id: number;
codigo: string;
descricao: string;
unidade: string;
quantidade: number;
};
type MovimentacaoRegistro = {
id: number;
data: string;
produtoCodigo: string;
produtoDescricao: string;
produtoUnidade: string;
tipo: 'ENTRADA' | 'SAIDA';
quantidade: number;
usuarioNome: string;
};
export default function MovimentacaoEstoque() {
const [produtos, setProdutos] = useState<ProdutoOpcao[]>([]);
const [movimentacoes, setMovimentacoes] = useState<MovimentacaoRegistro[]>([]);
const [produtoId, setProdutoId] = useState('');
const [tipo, setTipo] = useState('SAIDA');
const [quantidade, setQuantidade] = useState('');
const carregarDados = async () => {
const [produtosRes, movimentacoesRes] = await Promise.all([
api.get<ProdutoOpcao[]>('/produtos'),
api.get<MovimentacaoRegistro[]>('/movimentacoes')
]);
setProdutos(produtosRes.data);
setMovimentacoes(movimentacoesRes.data);
};
useEffect(() => {
let activo = true;
Promise.all([
api.get<ProdutoOpcao[]>('/produtos'),
api.get<MovimentacaoRegistro[]>('/movimentacoes')
]).then(([produtosRes, movimentacoesRes]) => {
if (!activo) return;
setProdutos(produtosRes.data);
setMovimentacoes(movimentacoesRes.data);
}).catch(() => {
Swal.fire('Erro!', 'Não foi possível carregar produtos e histórico de movimentações.', 'error');
});
return () => { activo = false; };
}, []);
const registrar = async (e: React.FormEvent) => {
e.preventDefault();
const user = JSON.parse(localStorage.getItem('userLogado') ||
'{}');
try {
const res = await api.post('/movimentacoes', { produtoId: Number(produtoId), tipo, quantidade: Number(quantidade), usuarioId: user.id });
if (res.data.estoqueAtual === 0 && tipo === 'SAIDA') {
await Swal.fire('Produto esgotado!', res.data.alerta, 'error');
} else if (res.data.alerta) {
await Swal.fire('Aviso: estoque baixo', res.data.alerta, 'warning');
} else {
await Swal.fire('Sucesso!', 'Movimentação registada.', 'success');
}
setQuantidade('');
await carregarDados();
} catch (error: any) {
Swal.fire('Erro!', error.response?.data?.erro || "Erro ao registar", 'error');
}
};
return (
	<div className="p-8 max-w-2xl mx-auto">
		<div className="flex justify-between items-center mb-6">
			<h1 className="text-2xl font-bold">Movimentações de Stock</h1>
			<Link href="/dashboard" className="text-blue-600 hover:underline">
				Voltar
			</Link>
		</div>
		<form onSubmit={registrar} className="bg-white p-6 rounded shadow border">
			<div className="mb-4">
				<label className="block mb-2 font-medium">Produto:</label>
				<select
					required
					value={produtoId}
					onChange={e => setProdutoId(e.target.value)}
					className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-emerald-500"
				>
					<option value="">Selecione um produto...</option>
					{produtos.map(p => (
						<option key={p.id} value={p.id}>
							{p.codigo} — {p.descricao} (Saldo: {p.quantidade} {p.unidade || 'un'})
						</option>
					))}
				</select>
			</div>
			<div className="grid grid-cols-2 gap-4 mb-6">
				<div>
					<label className="block mb-2 font-medium">Tipo:</label>
					<select
						value={tipo}
						onChange={e => setTipo(e.target.value)}
						className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-emerald-500"
					>
						<option value="ENTRADA">Entrada (+)</option>
						<option value="SAIDA">Saída (-)</option>
					</select>
				</div>
				<div>
					<label className="block mb-2 font-medium">Quantidade:</label>
					<input
						type="number"
						min="1"
						required
						value={quantidade}
						onChange={e => setQuantidade(e.target.value)}
						className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-emerald-500"
					/>
				</div>
			</div>
			<button
				type="submit"
				className="w-full bg-emerald-600 text-white p-3 rounded font-bold hover:bg-emerald-700"
			>
				Guardar Movimentação
			</button>
		</form>
		<section className="mt-10">
			<h2 className="mb-4 text-xl font-bold">Histórico de movimentações</h2>
			<div className="overflow-x-auto rounded border bg-white shadow">
				<table className="w-full min-w-[760px]">
					<thead className="border-b bg-slate-100">
						<tr>
							<th className="p-3 text-left">Data e hora</th>
							<th className="p-3 text-left">Produto</th>
							<th className="p-3 text-center">Tipo</th>
							<th className="p-3 text-center">Quantidade</th>
							<th className="p-3 text-left">Operador</th>
						</tr>
					</thead>
					<tbody className="divide-y">
						{movimentacoes.map(m => (
							<tr key={m.id}>
								<td className="p-3">{new Date(m.data).toLocaleString('pt-BR')}</td>
								<td className="p-3">{m.produtoCodigo} — {m.produtoDescricao}</td>
								<td className={`p-3 text-center font-medium ${m.tipo === 'ENTRADA' ? 'text-emerald-700' : 'text-rose-700'}`}>
									{m.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}
								</td>
								<td className="p-3 text-center">{m.quantidade} {m.produtoUnidade}</td>
								<td className="p-3">{m.usuarioNome}</td>
							</tr>
						))}
						{movimentacoes.length === 0 && (
							<tr><td colSpan={5} className="p-6 text-center text-slate-500">Ainda não há movimentações registadas.</td></tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	</div>
);
}