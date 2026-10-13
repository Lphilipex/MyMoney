
import { useEffect, useState } from "react";
import {
  listarReceitas,
  listarCategorias,
  cadastrarReceita,
  atualizarReceita,
  excluirReceita
} from "./services/api";
import "./Receitas.css";

function Receitas({ receitaParaEditar, aoConcluirEdicao }) {
  const [receitas, setReceitas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dataRecebimento, setDataRecebimento] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [status, setStatus] = useState("PREVISTA");
  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);

  async function carregarDados() {
    setCarregando(true);
    setMensagem("");

    try {
      const [dadosReceitas, dadosCategorias] = await Promise.all([
        listarReceitas(),
        listarCategorias()
      ]);

      setReceitas(Array.isArray(dadosReceitas) ? dadosReceitas : []);
      setCategorias(
        Array.isArray(dadosCategorias)
          ? dadosCategorias.filter(c => c.tipo === "RECEITA")
          : []
      );
    } catch (erro) {
      setMensagem(erro.message);
    } finally {
      setCarregando(false);
    }
  }

    
useEffect(() => {
  carregarDados();
}, []);

useEffect(() => {
  if (!receitaParaEditar) {
    return;
  }

  iniciarEdicao(receitaParaEditar);
}, [receitaParaEditar]);


  function limparFormulario() {
    setDescricao("");
    setValor("");
    setDataRecebimento("");
    setCategoriaId("");
    setStatus("PREVISTA");
    setEditandoId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagem("");

    const dados = {
      categoriaId: Number(categoriaId),
      descricao: descricao.trim(),
      valor: Number(valor),
      dataRecebimento,
      status
    };

    try {
      if (editandoId !== null) {
        await atualizarReceita(editandoId, dados);
        setMensagem("Receita atualizada com sucesso!");
      } else {
        await cadastrarReceita(dados);
        setMensagem("Receita cadastrada com sucesso!");
      }

      limparFormulario();
      await carregarDados();
    } catch (erro) {
      setMensagem(erro.message);
    }
  }

  function iniciarEdicao(receita) {
    setEditandoId(receita.id);
    setDescricao(receita.descricao);
    setValor(String(receita.valor));
    setDataRecebimento(receita.dataRecebimento);
    setCategoriaId(String(receita.categoriaId));
    setStatus(receita.status);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleExcluir(id) {
    const confirmar = window.confirm(
      "Deseja realmente excluir esta receita?"
    );

    if (!confirmar) return;

    try {
      await excluirReceita(id);
      setMensagem("Receita excluída com sucesso!");
      await carregarDados();
    } catch (erro) {
      setMensagem(erro.message);
    }
  }

  function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  return (
    <div className="receitas-pagina">
      <header className="receitas-cabecalho">
        <div>
          <h2>Receitas</h2>
          <p>Cadastre e acompanhe suas entradas financeiras.</p>
        </div>
        <strong>
          Total listado: {moeda(
            receitas.reduce((total, receita) => total + Number(receita.valor || 0), 0)
          )}
        </strong>
      </header>

      <section className="receitas-formulario">
        <h3>{editandoId !== null ? "Editar receita" : "Nova receita"}</h3>

        <form onSubmit={handleSubmit}>
          <div className="receitas-campo">
            <label htmlFor="descricao">Descrição</label>
            <input
              id="descricao"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Ex.: Salário"
              required
            />
          </div>

          <div className="receitas-campo">
            <label htmlFor="valor">Valor (R$)</label>
            <input
              id="valor"
              type="number"
              min="0.01"
              step="0.01"
              value={valor}
              onChange={e => setValor(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>

          <div className="receitas-campo">
            <label htmlFor="dataRecebimento">Data de recebimento</label>
            <input
              id="dataRecebimento"
              type="date"
              value={dataRecebimento}
              onChange={e => setDataRecebimento(e.target.value)}
              required
            />
          </div>

          <div className="receitas-campo">
            <label htmlFor="categoriaId">Categoria</label>
            <select
              id="categoriaId"
              value={categoriaId}
              onChange={e => setCategoriaId(e.target.value)}
              required
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="receitas-campo">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={e => setStatus(e.target.value)}
              required
            >
              <option value="PREVISTA">Prevista</option>
              <option value="RECEBIDA">Recebida</option>
            </select>
          </div>

          
<div className="receitas-acoes-formulario">
  <button type="submit">
    {editandoId !== null ? "Salvar alterações" : "Cadastrar receita"}
  </button>

  {editandoId !== null && (
    <button
      type="button"
      onClick={() => {
        limparFormulario();

        if (aoConcluirEdicao) {
          aoConcluirEdicao();
        }
      }}
    >
      Cancelar edição
    </button>
  )}
</div>

        </form>
      </section>

      {mensagem && <p className="receitas-mensagem" role="status">{mensagem}</p>}

      <section className="receitas-listagem">
        <h3>Receitas cadastradas</h3>

        {carregando ? (
          <p>Carregando receitas...</p>
        ) : receitas.length === 0 ? (
          <p>Nenhuma receita cadastrada.</p>
        ) : (
          <div className="receitas-tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {receitas.map(receita => (
                  <tr key={receita.id}>
                    <td>{receita.descricao}</td>
                    <td>
                      {categorias.find(c => c.id === receita.categoriaId)?.nome
                        || receita.categoriaId}
                    </td>
                    <td>{receita.dataRecebimento}</td>
                    <td>{moeda(receita.valor)}</td>
                    <td>{receita.status}</td>
                    <td className="receitas-acoes-tabela">
                      <button type="button" onClick={() => iniciarEdicao(receita)}>
                        Editar
                      </button>
                      <button type="button" className="receitas-excluir"
                        onClick={() => handleExcluir(receita.id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Receitas;
