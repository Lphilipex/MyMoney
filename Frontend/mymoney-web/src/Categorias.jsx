
import { useEffect, useState } from "react";
import {
  listarCategorias,
  cadastrarCategoria,
  atualizarCategoria,
  excluirCategoria
} from "./services/api";

import "./Categorias.css";

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("DESPESA");
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [filtro, setFiltro] = useState("TODAS");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarCategorias() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarCategorias();
      setCategorias(dados);
    } catch (error) {
      setErro(error.message || "Erro ao carregar categorias.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarCategorias();
  }, []);

  function limparFormulario() {
    setNome("");
    setTipo("DESPESA");
    setCategoriaEditando(null);
    setErro("");
    setMensagem("");
  }

  function editarCategoria(categoria) {
    setCategoriaEditando(categoria);
    setNome(categoria.nome);
    setTipo(categoria.tipo);
    setErro("");
    setMensagem("");
  }

  async function salvarCategoria(event) {
    event.preventDefault();

    if (!nome.trim()) {
      setErro("Informe o nome da categoria.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");
      setMensagem("");

      const dados = {
        nome: nome.trim(),
        tipo: tipo
      };

      if (categoriaEditando) {
        await atualizarCategoria(categoriaEditando.id, dados);
        setMensagem("Categoria atualizada com sucesso!");
      } else {
        await cadastrarCategoria(dados);
        setMensagem("Categoria cadastrada com sucesso!");
      }

      limparFormulario();
      await carregarCategorias();
    } catch (error) {
      setErro(error.message || "Não foi possível salvar a categoria.");
    } finally {
      setSalvando(false);
    }
  }

  async function removerCategoria(categoria) {
    const confirmar = window.confirm(
      `Deseja excluir a categoria "${categoria.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setErro("");
      setMensagem("");

      await excluirCategoria(categoria.id);

      setMensagem("Categoria excluída com sucesso.");
      await carregarCategorias();

      if (categoriaEditando?.id === categoria.id) {
        limparFormulario();
      }
    } catch (error) {
      setErro(
        error.message ||
        "Não foi possível excluir a categoria. Verifique se ela está vinculada a registros."
      );
    }
  }

  const categoriasFiltradas = categorias.filter((categoria) => {
    return filtro === "TODAS" || categoria.tipo === filtro;
  });

  return (
    <div className="categorias-container">
      <div className="categorias-cabecalho">
        <div>
          <h1>Categorias</h1>
          <p>Organize suas receitas e despesas.</p>
        </div>
      </div>

      {erro && <div className="categorias-alerta erro">{erro}</div>}
      {mensagem && (
        <div className="categorias-alerta sucesso">{mensagem}</div>
      )}

      <div className="categorias-layout">
        <section className="categorias-formulario">
          <h2>
            {categoriaEditando ? "Editar categoria" : "Nova categoria"}
          </h2>

          <form onSubmit={salvarCategoria}>
            <label htmlFor="nomeCategoria">Nome da categoria</label>

            <input
              id="nomeCategoria"
              type="text"
              placeholder="Ex.: Alimentação"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              maxLength={100}
              required
            />

            <label htmlFor="tipoCategoria">Tipo</label>

            <select
              id="tipoCategoria"
              value={tipo}
              onChange={(event) => setTipo(event.target.value)}
            >
              <option value="RECEITA">Receita</option>
              <option value="DESPESA">Despesa</option>
            </select>

            <div className="categorias-botoes-formulario">
              <button type="submit" disabled={salvando}>
                {salvando
                  ? "Salvando..."
                  : categoriaEditando
                    ? "Salvar alterações"
                    : "Cadastrar categoria"}
              </button>

              {categoriaEditando && (
                <button
                  type="button"
                  className="botao-cancelar"
                  onClick={limparFormulario}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="categorias-listagem">
          <div className="categorias-listagem-cabecalho">
            <h2>Minhas categorias</h2>

            <select
              aria-label="Filtrar categorias"
              value={filtro}
              onChange={(event) => setFiltro(event.target.value)}
            >
              <option value="TODAS">Todas</option>
              <option value="RECEITA">Receitas</option>
              <option value="DESPESA">Despesas</option>
            </select>
          </div>

          {carregando ? (
            <p>Carregando categorias...</p>
          ) : categoriasFiltradas.length === 0 ? (
            <p className="categorias-vazio">
              Nenhuma categoria encontrada.
            </p>
          ) : (
            <div className="categorias-lista">
              {categoriasFiltradas.map((categoria) => (
                <div className="categoria-item" key={categoria.id}>
                  <div className="categoria-informacoes">
                    <strong>{categoria.nome}</strong>

                    <span
                      className={`categoria-tipo ${
                        categoria.tipo === "RECEITA"
                          ? "tipo-receita"
                          : "tipo-despesa"
                      }`}
                    >
                      {categoria.tipo === "RECEITA" ? "Receita" : "Despesa"}
                    </span>
                  </div>

                  <div className="categoria-acoes">
                    <button
                      type="button"
                      className="botao-editar"
                      onClick={() => editarCategoria(categoria)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="botao-excluir"
                      onClick={() => removerCategoria(categoria)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Categorias;
