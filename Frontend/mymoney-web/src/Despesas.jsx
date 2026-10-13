
import { useEffect, useState } from "react";
import {
  listarDespesas,
  listarCategorias,
  cadastrarDespesa,
  atualizarDespesa,
  excluirDespesa,
  marcarDespesaComoPaga
} from "./services/api";
import "./Despesas.css";

function Despesas({ despesaParaEditar, aoConcluirEdicao }) {
  const [despesas, setDespesas] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [tipoDespesa, setTipoDespesa] = useState("FIXA");
  const [dataDespesa, setDataDespesa] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [status, setStatus] = useState("PENDENTE");
  const [recorrente, setRecorrente] = useState(false);
  const [observacao, setObservacao] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("TODAS");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);

  async function carregarDados() {
    setCarregando(true);

    try {
      const [dadosDespesas, dadosCategorias] = await Promise.all([
        listarDespesas(),
        listarCategorias()
      ]);

      setDespesas(
        Array.isArray(dadosDespesas) ? dadosDespesas : []
      );

      setCategorias(
        Array.isArray(dadosCategorias)
          ? dadosCategorias.filter(c => c.tipo === "DESPESA")
          : []
      );

      setMensagem("");
    } catch (erro) {
      setMensagem(erro.message || "Erro ao carregar despesas.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
  carregarDados();
}, []);

useEffect(() => {
  if (!despesaParaEditar) {
    return;
  }

  iniciarEdicao(despesaParaEditar);
}, [despesaParaEditar]);


  function limparFormulario() {
    setDescricao("");
    setValor("");
    setCategoriaId("");
    setTipoDespesa("FIXA");
    setDataDespesa("");
    setDataVencimento("");
    setStatus("PENDENTE");
    setRecorrente(false);
    setObservacao("");
    setEditandoId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMensagem("");

    const dados = {
      categoriaId: Number(categoriaId),
      descricao: descricao.trim(),
      valor: Number(valor),
      tipoDespesa,
      dataDespesa,
      dataVencimento,
      status,
      recorrente,
      observacao: observacao.trim()
    };

    try {
      if (editandoId !== null) {
        await atualizarDespesa(editandoId, dados);
        setMensagem("Despesa atualizada com sucesso!");
      } else {
        await cadastrarDespesa(dados);
        setMensagem("Despesa cadastrada com sucesso!");
      }

      limparFormulario();
      await carregarDados();
    } catch (erro) {
      setMensagem(erro.message || "Não foi possível salvar a despesa.");
    }
  }

  function iniciarEdicao(despesa) {
    setEditandoId(despesa.id);
    setDescricao(despesa.descricao || "");
    setValor(String(despesa.valor ?? ""));
    setCategoriaId(String(despesa.categoriaId ?? ""));
    setTipoDespesa(despesa.tipoDespesa || "FIXA");
    setDataDespesa(despesa.dataDespesa || "");
    setDataVencimento(despesa.dataVencimento || "");
    setStatus(despesa.status || "PENDENTE");
    setRecorrente(Boolean(despesa.recorrente));
    setObservacao(despesa.observacao || "");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleExcluir(id) {
    if (!window.confirm("Deseja realmente excluir esta despesa?")) {
      return;
    }

    try {
      await excluirDespesa(id);
      setMensagem("Despesa excluída com sucesso.");
      await carregarDados();
    } catch (erro) {
      setMensagem(erro.message || "Não foi possível excluir a despesa.");
    }
  }

  async function handlePagar(id) {
    if (!window.confirm("Confirmar o pagamento desta despesa?")) {
      return;
    }

    try {
      await marcarDespesaComoPaga(id);
      setMensagem("Despesa marcada como paga.");
      await carregarDados();
    } catch (erro) {
      setMensagem(erro.message || "Não foi possível marcar como paga.");
    }
  }

  function moeda(numero) {
    return Number(numero || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  const despesasFiltradas = despesas.filter(despesa =>
    filtroTipo === "TODAS" || despesa.tipoDespesa === filtroTipo
  );

  const totalDespesas = despesasFiltradas.reduce(
    (total, despesa) => total + Number(despesa.valor || 0),
    0
  );

  return (
    <div className="despesas-pagina">
      <header className="despesas-cabecalho">
        <div>
          <h2>Despesas</h2>
          <p>Organize suas contas e acompanhe os pagamentos.</p>
        </div>

        <div className="despesas-total">
          <span>Total listado</span>
          <strong>{moeda(totalDespesas)}</strong>
        </div>
      </header>

      <section className="despesas-formulario">
        <h3>{editandoId !== null ? "Editar despesa" : "Nova despesa"}</h3>

        <form onSubmit={handleSubmit}>
          <div className="despesas-campo">
            <label htmlFor="despesa-descricao">Descrição</label>
            <input
              id="despesa-descricao"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Ex.: Conta de energia"
              required
            />
          </div>

          <div className="despesas-campo">
            <label htmlFor="despesa-valor">Valor (R$)</label>
            <input
              id="despesa-valor"
              type="number"
              min="0.01"
              step="0.01"
              value={valor}
              onChange={e => setValor(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>

          <div className="despesas-campo">
            <label htmlFor="despesa-categoria">Categoria</label>
            <select
              id="despesa-categoria"
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

          <div className="despesas-campo">
            <label htmlFor="despesa-tipo">Tipo de despesa</label>
            <select
              id="despesa-tipo"
              value={tipoDespesa}
              onChange={e => setTipoDespesa(e.target.value)}
              required
            >
              <option value="FIXA">Fixa</option>
              <option value="VARIADA">Variada</option>
              <option value="EMERGENCIA">Emergência</option>
            </select>
          </div>

          <div className="despesas-campo">
            <label htmlFor="despesa-data">Data da despesa</label>
            <input
              id="despesa-data"
              type="date"
              value={dataDespesa}
              onChange={e => setDataDespesa(e.target.value)}
              required
            />
          </div>

          <div className="despesas-campo">
            <label htmlFor="despesa-vencimento">Data de vencimento</label>
            <input
              id="despesa-vencimento"
              type="date"
              value={dataVencimento}
              onChange={e => setDataVencimento(e.target.value)}
              required
            />
          </div>

          <div className="despesas-campo">
            <label htmlFor="despesa-status">Status</label>
            <select
              id="despesa-status"
              value={status}
              onChange={e => setStatus(e.target.value)}
              required
            >
              <option value="PENDENTE">Pendente</option>
              <option value="PAGA">Paga</option>
            </select>
          </div>

          <label className="despesas-recorrente">
            <input
              type="checkbox"
              checked={recorrente}
              onChange={e => setRecorrente(e.target.checked)}
            />
            Despesa recorrente
          </label>

          <div className="despesas-campo despesas-observacao">
            <label htmlFor="despesa-observacao">Observação</label>
            <textarea
              id="despesa-observacao"
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              placeholder="Informações adicionais (opcional)"
              rows="3"
            />
          </div>

          <div className="despesas-acoes-formulario">
            <button type="submit">
              {editandoId !== null ? "Salvar alterações" : "Cadastrar despesa"}
            </button>

            
{editandoId !== null && (
  <button
    type="button"
    className="despesas-cancelar"
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

      {mensagem && (
        <p className="despesas-mensagem" role="status">{mensagem}</p>
      )}

      <section className="despesas-listagem">
        <div className="despesas-listagem-topo">
          <h3>Despesas cadastradas</h3>

          <select
            aria-label="Filtrar despesas por tipo"
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
          >
            <option value="TODAS">Todos os tipos</option>
            <option value="FIXA">Fixas</option>
            <option value="VARIADA">Variadas</option>
            <option value="EMERGENCIA">Emergências</option>
          </select>
        </div>

        {carregando ? (
          <p>Carregando despesas...</p>
        ) : despesasFiltradas.length === 0 ? (
          <p>Nenhuma despesa encontrada.</p>
        ) : (
          <div className="despesas-tabela-container">
            <table>
              <thead>
               
<tr>
  <th>Descrição</th>
  <th>Categoria</th>
  <th>Tipo</th>
  <th>Vencimento</th>
  <th>Valor</th>
  <th>Status</th>
  <th>Ações</th>
</tr>

              </thead>

              <tbody>
                {despesasFiltradas.map(despesa => (
                  
<tr key={despesa.id}>
  <td>{despesa.descricao}</td>
  <td>
    {categorias.find(
      categoria =>
        String(categoria.id) === String(despesa.categoriaId)
    )?.nome || "Categoria não encontrada"}
  </td>
  <td>{despesa.tipoDespesa}</td>

                    <td>{despesa.dataVencimento}</td>
                    <td>{moeda(despesa.valor)}</td>
                    <td>{despesa.status}</td>
                    <td className="despesas-acoes-tabela">
                      <button
                        type="button"
                        onClick={() => iniciarEdicao(despesa)}
                      >
                        Editar
                      </button>

                      {despesa.status !== "PAGA" && (
                        <button
                          type="button"
                          onClick={() => handlePagar(despesa.id)}
                        >
                          Pagar
                        </button>
                      )}

                      <button
                        type="button"
                        className="despesas-excluir"
                        onClick={() => handleExcluir(despesa.id)}
                      >
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

export default Despesas;
