import { useEffect, useState } from "react";

import {
  listarCartoes,
  cadastrarCartao,
  atualizarCartao,
  excluirCartao,
  listarComprasCartao,
  cadastrarCompraCartao,
  atualizarCompraCartao,
  excluirCompraCartao,
  buscarResumoCartao,
  listarCategorias,
  listarParcelasCompra,
  pagarParcela,
  atualizarParcelasAtrasadas
} from "./services/api";

import "./Cartoes.css";

const cartaoInicial = {
  nome: "",
  banco: "",
  limite: "",
  diaFechamento: "",
  diaVencimento: "",
  ativo: true
};

const compraInicial = {
  cartaoId: "",
  categoriaId: "",
  descricao: "",
  valorTotal: "",
  quantidadeParcelas: "1",
  dataCompra: new Date().toLocaleDateString("en-CA"),
  observacao: ""
};

function Cartoes() {
  const [cartoes, setCartoes] = useState([]);
  const [compras, setCompras] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [resumo, setResumo] = useState(null);

  const [compraSelecionada, setCompraSelecionada] = useState(null);
  const [parcelas, setParcelas] = useState([]);
  const [carregandoParcelas, setCarregandoParcelas] = useState(false);
  const [pagandoParcelaId, setPagandoParcelaId] = useState(null);

  const [filtroCartao, setFiltroCartao] = useState("todos");
  const [formCartao, setFormCartao] = useState(cartaoInicial);
  const [formCompra, setFormCompra] = useState(compraInicial);
  const [cartaoEditando, setCartaoEditando] = useState(null);
  const [compraEditando, setCompraEditando] = useState(null);

  const [mostrarCartao, setMostrarCartao] = useState(false);
  const [mostrarCompra, setMostrarCompra] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const [listaCartoes, listaCompras, dadosResumo, listaCategorias] =
        await Promise.all([
          listarCartoes(),
          listarComprasCartao(),
          buscarResumoCartao(),
          listarCategorias()
        ]);

      setCartoes(Array.isArray(listaCartoes) ? listaCartoes : []);
      setCompras(Array.isArray(listaCompras) ? listaCompras : []);
      setResumo(dadosResumo);
      setCategorias(
        (Array.isArray(listaCategorias) ? listaCategorias : []).filter(
          (categoria) => categoria.tipo === "DESPESA"
        )
      );
    } catch (e) {
      setErro(e.message || "Não foi possível carregar os cartões.");
    } finally {
      setCarregando(false);
    }
  }

  function alterarCartao(event) {
    const { name, value, type, checked } = event.target;

    setFormCartao({
      ...formCartao,
      [name]: type === "checkbox" ? checked : value
    });
  }

  function alterarCompra(event) {
    const { name, value } = event.target;

    setFormCompra({
      ...formCompra,
      [name]: value
    });
  }

  function editarCartao(cartao) {
    setCartaoEditando(cartao.id);
    setFormCartao({
      nome: cartao.nome ?? "",
      banco: cartao.banco ?? "",
      limite: String(cartao.limite ?? ""),
      diaFechamento: String(cartao.diaFechamento ?? ""),
      diaVencimento: String(cartao.diaVencimento ?? ""),
      ativo: Boolean(cartao.ativo)
    });
    setMostrarCartao(true);
    setErro("");
    setMensagem("");
  }

  function cancelarEdicaoCartao() {
    setFormCartao(cartaoInicial);
    setCartaoEditando(null);
    setMostrarCartao(false);
    setErro("");
  }

  function editarCompra(compra) {
    setCompraEditando(compra.id);
    setFormCompra({
      cartaoId: String(compra.cartaoId ?? ""),
      categoriaId: compra.categoriaId ? String(compra.categoriaId) : "",
      descricao: compra.descricao ?? "",
      valorTotal: String(compra.valorTotal ?? ""),
      quantidadeParcelas: String(compra.quantidadeParcelas ?? 1),
      dataCompra: compra.dataCompra ?? "",
      observacao: compra.observacao ?? ""
    });
    setMostrarCompra(true);
    setErro("");
    setMensagem("");
  }

  function cancelarEdicaoCompra() {
    setCompraEditando(null);
    setFormCompra(compraInicial);
    setMostrarCompra(false);
    setErro("");
  }

  async function salvarCartao(event) {
    event.preventDefault();
    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
      const dados = {
        nome: formCartao.nome.trim(),
        banco: formCartao.banco.trim(),
        limite: Number(formCartao.limite),
        diaFechamento: Number(formCartao.diaFechamento),
        diaVencimento: Number(formCartao.diaVencimento),
        ativo: formCartao.ativo
      };

      if (cartaoEditando !== null) {
        await atualizarCartao(cartaoEditando, dados);
      } else {
        await cadastrarCartao(dados);
      }

      setFormCartao(cartaoInicial);
      setCartaoEditando(null);
      setMostrarCartao(false);
      setMensagem("Cartão salvo com sucesso.");
      await carregarDados();
    } catch (e) {
      setErro(e.message || "Não foi possível salvar o cartão.");
    } finally {
      setSalvando(false);
    }
  }

  async function removerCartao(cartao) {
    const confirmou = window.confirm(
      `Deseja excluir o cartão "${cartao.nome}"?`
    );

    if (!confirmou) return;

    setErro("");
    setMensagem("");

    try {
      await excluirCartao(cartao.id);

      if (String(filtroCartao) === String(cartao.id)) {
        setFiltroCartao("todos");
      }

      setMensagem("Cartão excluído com sucesso.");
      await carregarDados();
    } catch (e) {
      setErro(e.message || "Não foi possível excluir o cartão.");
    }
  }

  async function salvarCompra(event) {
    event.preventDefault();
    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
      const dados = {
        cartaoId: Number(formCompra.cartaoId),
        categoriaId: formCompra.categoriaId
          ? Number(formCompra.categoriaId)
          : null,
        descricao: formCompra.descricao.trim(),
        valorTotal: Number(formCompra.valorTotal),
        quantidadeParcelas: Number(formCompra.quantidadeParcelas),
        dataCompra: formCompra.dataCompra,
        observacao: formCompra.observacao.trim()
      };

      const compraIdSalva = compraEditando;

      if (compraEditando !== null) {
        await atualizarCompraCartao(compraEditando, dados);
      } else {
        await cadastrarCompraCartao(dados);
      }

      setCompraEditando(null);
      setFormCompra(compraInicial);
      setMostrarCompra(false);

      await carregarDados();

      if (compraSelecionada) {
        const idParaAtualizar = compraIdSalva ?? compraSelecionada.id;
        const listaAtualizada = await listarComprasCartao();
        const compraAtualizada = listaAtualizada.find(
          (item) => String(item.id) === String(idParaAtualizar)
        );

        if (compraAtualizada) {
          setCompraSelecionada(compraAtualizada);
          const parcelasAtualizadas = await listarParcelasCompra(
            compraAtualizada.id
          );
          setParcelas(
            Array.isArray(parcelasAtualizadas) ? parcelasAtualizadas : []
          );
        }
      }

      setMensagem(
        compraIdSalva !== null
          ? "Compra atualizada com sucesso."
          : "Compra cadastrada com sucesso."
      );
    } catch (e) {
      setErro(e.message || "Não foi possível salvar a compra.");
    } finally {
      setSalvando(false);
    }
  }

  async function removerCompra(compra) {
    const confirmou = window.confirm(
      `Deseja excluir a compra "${compra.descricao}"? Esta ação não poderá ser desfeita.`
    );

    if (!confirmou) return;

    setErro("");
    setMensagem("");

    try {
      await excluirCompraCartao(compra.id);

      if (
        compraSelecionada &&
        String(compraSelecionada.id) === String(compra.id)
      ) {
        setCompraSelecionada(null);
        setParcelas([]);
      }

      if (String(compraEditando) === String(compra.id)) {
        setCompraEditando(null);
        setFormCompra(compraInicial);
        setMostrarCompra(false);
      }

      await carregarDados();
      setMensagem("Compra excluída com sucesso.");
    } catch (e) {
      setErro(e.message || "Não foi possível excluir a compra.");
    }
  }

  const comprasFiltradas =
    filtroCartao === "todos"
      ? compras
      : compras.filter(
          (compra) => String(compra.cartaoId) === String(filtroCartao)
        );

  function nomeCartao(id) {
    const cartao = cartoes.find(
      (item) => String(item.id) === String(id)
    );
    return cartao?.nome || "Cartão não identificado";
  }

  function moeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function formatarData(data) {
    if (!data) return "—";
    return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");
  }

  async function abrirParcelas(compra) {
    setCompraSelecionada(compra);
    setParcelas([]);
    setCarregandoParcelas(true);
    setErro("");
    setMensagem("");

    try {
      const dados = await listarParcelasCompra(compra.id);
      setParcelas(Array.isArray(dados) ? dados : []);
    } catch (e) {
      setErro(e.message || "Não foi possível carregar as parcelas.");
    } finally {
      setCarregandoParcelas(false);
    }
  }

  async function confirmarPagamento(parcela) {
    if (!compraSelecionada) return;

    const confirmou = window.confirm(
      `Deseja marcar a parcela ${parcela.numero} como paga?`
    );
    if (!confirmou) return;

    setPagandoParcelaId(parcela.id);
    setErro("");
    setMensagem("");

    try {
      await pagarParcela(compraSelecionada.id, parcela.id);

      const [parcelasAtualizadas, resumoAtualizado, comprasAtualizadas] =
        await Promise.all([
          listarParcelasCompra(compraSelecionada.id),
          buscarResumoCartao(),
          listarComprasCartao()
        ]);

      setParcelas(
        Array.isArray(parcelasAtualizadas) ? parcelasAtualizadas : []
      );
      setResumo(resumoAtualizado);
      setCompras(Array.isArray(comprasAtualizadas) ? comprasAtualizadas : []);
      setMensagem("Parcela marcada como paga com sucesso.");
    } catch (e) {
      setErro(e.message || "Não foi possível pagar a parcela.");
    } finally {
      setPagandoParcelaId(null);
    }
  }

  async function atualizarAtrasos() {
    setErro("");
    setMensagem("");

    try {
      await atualizarParcelasAtrasadas();

      if (compraSelecionada) {
        const dados = await listarParcelasCompra(compraSelecionada.id);
        setParcelas(Array.isArray(dados) ? dados : []);
      }

      const resumoAtualizado = await buscarResumoCartao();
      setResumo(resumoAtualizado);
      setMensagem("Atualização das parcelas atrasadas concluída.");
    } catch (e) {
      setErro(e.message || "Não foi possível atualizar os atrasos.");
    }
  }

  if (carregando) {
    return <div className="cartoes-container">Carregando cartões...</div>;
  }

  return (
    <section className="cartoes-container">
      <header className="cartoes-topo">
        <div>
          <h1>Cartões de crédito</h1>
          <p>Gerencie seus cartões e acompanhe suas compras parceladas.</p>
        </div>

        <div className="cartoes-acoes">
          <button
            type="button"
            className="botao-secundario"
            onClick={() => {
              setCartaoEditando(null);
              setFormCartao(cartaoInicial);
              setMostrarCartao(true);
              setErro("");
              setMensagem("");
            }}
          >
            + Novo cartão
          </button>

          <button
            type="button"
            className="botao-principal"
            onClick={() => {
              setCompraEditando(null);
              setFormCompra({
                ...compraInicial,
                cartaoId: filtroCartao !== "todos" ? filtroCartao : ""
              });
              setMostrarCompra(true);
              setErro("");
              setMensagem("");
            }}
            disabled={cartoes.filter((cartao) => cartao.ativo).length === 0}
          >
            + Nova compra
          </button>
        </div>
      </header>

      {erro && <div className="cartoes-alerta erro">{erro}</div>}
      {mensagem && <div className="cartoes-alerta sucesso">{mensagem}</div>}

      <div className="cartoes-resumo">
        <article className="resumo-cartao">
          <span>Total de compras</span>
          <strong>{moeda(resumo?.totalCompras)}</strong>
        </article>
        <article className="resumo-cartao">
          <span>Pendente</span>
          <strong>{moeda(resumo?.totalPendente)}</strong>
        </article>
        <article className="resumo-cartao">
          <span>Pago</span>
          <strong>{moeda(resumo?.totalPago)}</strong>
        </article>
        <article className="resumo-cartao">
          <span>Atrasado</span>
          <strong>{moeda(resumo?.totalAtrasado)}</strong>
        </article>
      </div>

      <section className="cartoes-secao">
        <h2>Meus cartões</h2>

        {cartoes.length === 0 ? (
          <p className="cartoes-vazio">
            Nenhum cartão cadastrado. Clique em “Novo cartão” para começar.
          </p>
        ) : (
          <div className="cartoes-grade">
            {cartoes.map((cartao) => (
              <article className="cartao-item" key={cartao.id}>
                <div className="cartao-item-topo">
                  <div>
                    <span className="cartao-banco">{cartao.banco}</span>
                    <h3>{cartao.nome}</h3>
                  </div>
                  <span
                    className={`cartao-status ${
                      cartao.ativo ? "ativo" : "inativo"
                    }`}
                  >
                    {cartao.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>

                <div className="cartao-limite">
                  <span>Limite cadastrado</span>
                  <strong>{moeda(cartao.limite)}</strong>
                </div>

                <p className="cartao-dias">
                  Fecha dia {cartao.diaFechamento} · Vence dia{" "}
                  {cartao.diaVencimento}
                </p>

                <div className="cartao-botoes">
                  <button
                    type="button"
                    className="botao-secundario"
                    onClick={() => editarCartao(cartao)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="botao-texto"
                    onClick={() => setFiltroCartao(String(cartao.id))}
                  >
                    Ver compras
                  </button>
                  <button
                    type="button"
                    className="botao-perigo"
                    onClick={() => removerCartao(cartao)}
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {mostrarCartao && (
        <section className="cartoes-secao">
          <h2>{cartaoEditando !== null ? "Editar cartão" : "Cadastrar cartão"}</h2>

          <form className="cartoes-formulario" onSubmit={salvarCartao}>
            <label>
              Nome do cartão
              <input
                name="nome"
                value={formCartao.nome}
                onChange={alterarCartao}
                placeholder="Ex.: Cartão principal"
                required
              />
            </label>

            <label>
              Banco
              <input
                name="banco"
                value={formCartao.banco}
                onChange={alterarCartao}
                placeholder="Ex.: Banco do Brasil"
                required
              />
            </label>

            <label>
              Limite do cartão (R$)
              <input
                name="limite"
                type="number"
                min="0.01"
                step="0.01"
                value={formCartao.limite}
                onChange={alterarCartao}
                required
              />
            </label>

            <label>
              Dia de fechamento
              <input
                name="diaFechamento"
                type="number"
                min="1"
                max="31"
                value={formCartao.diaFechamento}
                onChange={alterarCartao}
                required
              />
            </label>

            <label>
              Dia de vencimento
              <input
                name="diaVencimento"
                type="number"
                min="1"
                max="31"
                value={formCartao.diaVencimento}
                onChange={alterarCartao}
                required
              />
            </label>

            {cartaoEditando !== null && (
              <label className="cartoes-checkbox">
                <input
                  type="checkbox"
                  name="ativo"
                  checked={formCartao.ativo}
                  onChange={alterarCartao}
                />
                Cartão ativo
              </label>
            )}

            <div className="cartoes-form-acoes">
              <button
                type="button"
                className="botao-secundario"
                onClick={cancelarEdicaoCartao}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="botao-principal"
                disabled={salvando}
              >
                {salvando ? "Salvando..." : "Salvar cartão"}
              </button>
            </div>
          </form>
        </section>
      )}

      {mostrarCompra && (
        <section className="cartoes-secao">
          <h2>
            {compraEditando !== null ? "Editar compra" : "Registrar compra"}
          </h2>

          <form className="cartoes-formulario" onSubmit={salvarCompra}>
            <label>
              Cartão
              <select
                name="cartaoId"
                value={formCompra.cartaoId}
                onChange={alterarCompra}
                required
              >
                <option value="">Selecione um cartão</option>
                {cartoes
                  .filter((cartao) => cartao.ativo)
                  .map((cartao) => (
                    <option key={cartao.id} value={cartao.id}>
                      {cartao.nome} — {cartao.banco}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Descrição da compra
              <input
                name="descricao"
                value={formCompra.descricao}
                onChange={alterarCompra}
                placeholder="Ex.: Compra no supermercado"
                required
              />
            </label>

            <label>
              Categoria
              <select
                name="categoriaId"
                value={formCompra.categoriaId}
                onChange={alterarCompra}
              >
                <option value="">Sem categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Valor total (R$)
              <input
                name="valorTotal"
                type="number"
                min="0.01"
                step="0.01"
                value={formCompra.valorTotal}
                onChange={alterarCompra}
                required
              />
            </label>

            <label>
              Quantidade de parcelas
              <input
                name="quantidadeParcelas"
                type="number"
                min="1"
                max="120"
                value={formCompra.quantidadeParcelas}
                onChange={alterarCompra}
                required
              />
            </label>

            <label>
              Data da compra
              <input
                name="dataCompra"
                type="date"
                value={formCompra.dataCompra}
                onChange={alterarCompra}
                required
              />
            </label>

            <label className="cartoes-campo-completo">
              Observação
              <textarea
                name="observacao"
                value={formCompra.observacao}
                onChange={alterarCompra}
                placeholder="Informações adicionais (opcional)"
                rows="3"
              />
            </label>

            {Number(formCompra.valorTotal) > 0 &&
              Number(formCompra.quantidadeParcelas) > 0 && (
                <p className="cartoes-parcela-estimada">
                  Valor estimado por parcela:{" "}
                  <strong>
                    {moeda(
                      Number(formCompra.valorTotal) /
                        Number(formCompra.quantidadeParcelas)
                    )}
                  </strong>
                  <br />
                  <small>
                    O valor final de cada parcela pode variar por arredondamento.
                  </small>
                </p>
              )}

            <div className="cartoes-form-acoes">
              <button
                type="button"
                className="botao-secundario"
                onClick={cancelarEdicaoCompra}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="botao-principal"
                disabled={
                  salvando ||
                  cartoes.filter((cartao) => cartao.ativo).length === 0
                }
              >
                {salvando
                  ? "Salvando..."
                  : compraEditando !== null
                    ? "Salvar alterações"
                    : "Cadastrar compra"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="cartoes-secao">
        <div className="cartoes-lista-topo">
          <div>
            <h2>Compras registradas</h2>
            <p>
              Consulte as compras de todos os cartões ou de um cartão específico.
            </p>
          </div>

          <select
            aria-label="Filtrar compras por cartão"
            value={filtroCartao}
            onChange={(event) => setFiltroCartao(event.target.value)}
          >
            <option value="todos">Todos os cartões</option>
            {cartoes.map((cartao) => (
              <option key={cartao.id} value={cartao.id}>
                {cartao.nome}
              </option>
            ))}
          </select>
        </div>

        {comprasFiltradas.length === 0 ? (
          <p className="cartoes-vazio">
            Nenhuma compra encontrada para essa seleção.
          </p>
        ) : (
          <div className="cartoes-tabela-container">
            <table className="cartoes-tabela">
              <thead>
                <tr>
                  <th>Compra</th>
                  <th>Cartão</th>
                  <th>Data</th>
                  <th>Parcelas</th>
                  <th>Valor total</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {comprasFiltradas.map((compra) => (
                  <tr key={compra.id}>
                    <td>
                      <strong>{compra.descricao}</strong>
                      {compra.observacao && <small>{compra.observacao}</small>}
                    </td>
                    <td>{nomeCartao(compra.cartaoId)}</td>
                    <td>{formatarData(compra.dataCompra)}</td>
                    <td>{compra.quantidadeParcelas ?? "—"}</td>
                    <td>{moeda(compra.valorTotal)}</td>
                    <td>
                      <div className="cartoes-acoes">
                        <button
                          type="button"
                          className="botao-secundario"
                          onClick={() => abrirParcelas(compra)}
                        >
                          Ver parcelas
                        </button>
                        <button
                          type="button"
                          className="botao-secundario"
                          onClick={() => editarCompra(compra)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="botao-perigo"
                          onClick={() => removerCompra(compra)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {compraSelecionada && (
        <div className="parcelas-painel">
          <div className="parcelas-topo">
            <div>
              <h2>Parcelas da compra</h2>
              <p>{compraSelecionada.descricao}</p>
            </div>

            <div className="cartoes-acoes">
              <button
                type="button"
                className="botao-secundario"
                onClick={atualizarAtrasos}
              >
                Atualizar atrasos
              </button>
              <button
                type="button"
                className="botao-texto"
                onClick={() => {
                  setCompraSelecionada(null);
                  setParcelas([]);
                }}
              >
                Fechar
              </button>
            </div>
          </div>

          {carregandoParcelas ? (
            <p>Carregando parcelas...</p>
          ) : parcelas.length === 0 ? (
            <p className="cartoes-vazio">
              Nenhuma parcela encontrada para esta compra.
            </p>
          ) : (
            <div className="cartoes-tabela-container">
              <table className="cartoes-tabela">
                <thead>
                  <tr>
                    <th>Parcela</th>
                    <th>Valor</th>
                    <th>Vencimento</th>
                    <th>Status</th>
                    <th>Pagamento</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {parcelas.map((parcela) => {
                    const status = String(parcela.status || "").toUpperCase();

                    return (
                      <tr key={parcela.id}>
                        <td>{parcela.numero}</td>
                        <td>{moeda(parcela.valor)}</td>
                        <td>{formatarData(parcela.dataVencimento)}</td>
                        <td>
                          <span
                            className={`parcela-status ${
                              status === "PAGA"
                                ? "paga"
                                : status === "ATRASADA"
                                  ? "atrasada"
                                  : "pendente"
                            }`}
                          >
                            {parcela.status || "Pendente"}
                          </span>
                        </td>
                        <td>{formatarData(parcela.dataPagamento)}</td>
                        <td>
                          {status !== "PAGA" ? (
                            <button
                              type="button"
                              className="botao-principal"
                              disabled={pagandoParcelaId === parcela.id}
                              onClick={() => confirmarPagamento(parcela)}
                            >
                              {pagandoParcelaId === parcela.id
                                ? "Pagando..."
                                : "Marcar como paga"}
                            </button>
                          ) : (
                            <span>Pagamento realizado</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default Cartoes;
