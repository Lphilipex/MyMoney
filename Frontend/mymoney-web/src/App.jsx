
import { useState, useEffect } from "react";
import "./App.css";
import Cadastro from "./Cadastro";
import Login from "./Login";
import AnaliseEconomica from "./AnaliseEconomica";


import {
  buscarResumoFinanceiro,
  listarReceitas,
  listarDespesas,
  listarCategorias
} from "./services/api";

import Receitas from "./Receitas";
import Despesas from "./Despesas";
import Cartoes from "./Cartoes";
import Relatorios from "./Relatorios";
import Categorias from "./Categorias";
import Perfil from "./Perfil";

function App() {
  const hoje = new Date();
  const [autenticado, setAutenticado] = useState(
    () => Boolean(sessionStorage.getItem("token"))
);

  const [pagina, setPagina] = useState("inicio");

  const [tela, setTela] = useState(
    sessionStorage.getItem("token") ? "inicio" : "login"
  );

  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());

  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [movimentacoes, setMovimentacoes] = useState([]);
  const [carregandoMovimentacoes, setCarregandoMovimentacoes] =
    useState(true);
  const [erroMovimentacoes, setErroMovimentacoes] = useState("");

  // Lançamentos selecionados para edição.
  const [receitaParaEditar, setReceitaParaEditar] = useState(null);
  const [despesaParaEditar, setDespesaParaEditar] = useState(null);

    function fazerLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("tipoToken");

    setAutenticado(false);
    setPagina("inicio");
    setTela("login");
  }


  // Busca o resumo financeiro do mês selecionado.
  useEffect(() => {
    if (
      tela !== "inicio" ||
      pagina !== "inicio" ||
      !sessionStorage.getItem("token")
    ) {
      return;
    }

    let ativo = true;

    async function carregarResumo() {
      setCarregando(true);
      setErro("");

      try {
        const dados = await buscarResumoFinanceiro(mes, ano);

        if (ativo) {
          setResumo(dados);
        }
      } catch (erroApi) {
        if (ativo) {
          setErro(
            erroApi.message || "Erro ao carregar o resumo financeiro."
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarResumo();

    return () => {
      ativo = false;
    };
  }, [tela, pagina, mes, ano]);

  // Busca as movimentações financeiras do backend.
  useEffect(() => {
    if (tela !== "inicio" || !sessionStorage.getItem("token")) {
      return;
    }

    let ativo = true;

    async function carregarMovimentacoes() {
      setCarregandoMovimentacoes(true);
      setErroMovimentacoes("");

      try {
        const [receitas, despesas, categorias] = await Promise.all([
          listarReceitas(),
          listarDespesas(),
          listarCategorias()
        ]);

        const listaReceitas = Array.isArray(receitas) ? receitas : [];
        const listaDespesas = Array.isArray(despesas) ? despesas : [];
        const listaCategorias = Array.isArray(categorias)
          ? categorias
          : [];

        // Relaciona o ID da categoria ao nome dela.
        const categoriaPorId = new Map(
          listaCategorias.map(categoria => [
            String(categoria.id),
            categoria.nome
          ])
        );

        // Junta receitas e despesas em uma única lista.
        const dados = [
          ...listaReceitas.map(receita => ({
            id: `receita-${receita.id}`,
            registro: receita,
            descricao: receita.descricao,
            data: receita.dataRecebimento,
            valor: Number(receita.valor || 0),
            tipo: "RECEITA",
            status: receita.status,
            categoria:
              categoriaPorId.get(String(receita.categoriaId)) ||
              "Sem categoria"
          })),

          ...listaDespesas.map(despesa => ({
            id: `despesa-${despesa.id}`,
            registro: despesa,
            descricao: despesa.descricao,
            data: despesa.dataDespesa,
            valor: Number(despesa.valor || 0),
            tipo: "DESPESA",
            status: despesa.status,
            categoria:
              categoriaPorId.get(String(despesa.categoriaId)) ||
              "Sem categoria"
          }))
        ];

        // Ordena da movimentação mais recente para a mais antiga.
        dados.sort((a, b) => {
          return String(b.data || "").localeCompare(
            String(a.data || "")
          );
        });

        if (ativo) {
          setMovimentacoes(dados.slice(0, 5));
        }
      } catch (erroApi) {
        if (ativo) {
          setErroMovimentacoes(
            erroApi.message ||
              "Não foi possível carregar as movimentações."
          );
        }
      } finally {
        if (ativo) {
          setCarregandoMovimentacoes(false);
        }
      }
    }

    carregarMovimentacoes();

    return () => {
      ativo = false;
    };
  }, [tela]);

  function formatarMoeda(valor) {
    return Number(valor ?? 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function formatarMes(mes, ano) {
    const texto = new Date(ano, mes - 1, 1).toLocaleDateString(
      "pt-BR",
      {
        month: "long",
        year: "numeric"
      }
    );

    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

    // Se não estiver autenticado, só permite login ou cadastro.
  if (!autenticado) {
    if (tela === "cadastro") {
      return (
        <div className="app">
          <Cadastro onVoltar={() => setTela("login")} />
        </div>
      );
    }

    return (
      <div className="app">
        <Login
          onLogin={() => {
            setAutenticado(true);
            setPagina("inicio");
            setTela("inicio");
          }}
          onCadastro={() => setTela("cadastro")}
        />
      </div>
    );
  }

  // Tela de cadastro de usuário.
  if (tela === "cadastro") {
    return (
      <div className="app">
        <Cadastro onVoltar={() => setTela("login")} />
      </div>
    );
  }

  // Valores retornados pelo backend.
  const saldo = resumo?.saldoMensal;
  const totalReceitas = resumo?.totalReceitasRecebidas;
  const totalDespesas = resumo?.despesas?.totalDespesas;
  const emAberto = resumo?.totalEmAberto;

  return (
    
<div className="app">
  <aside className="sidebar">

    <h1 className="logo">
      My<span>Money</span>
    </h1>

    <a
      className="sidebar-rodape"
      onClick={() => setPagina("perfil")}
    >
      <span className="avatar">U</span>

      <span className="sidebar-usuario">
        <strong>Meu perfil</strong>
        
      </span>
    </a>
    

    <p className="menu-titulo">MENU PRINCIPAL</p>


          <nav className="menu">
            
          
          <a
            href="#relatorios"
            className={`menu-item ${
              pagina === "relatorios" ? "ativo" : ""
            }`}
            onClick={event => {
              event.preventDefault();
              setPagina("relatorios");
            }}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-receipt" viewBox="0 0 16 16">
  <path d="M1.92.506a.5.5 0 0 1 .434.14L3 1.293l.646-.647a.5.5 0 0 1 .708 0L5 1.293l.646-.647a.5.5 0 0 1 .708 0L7 1.293l.646-.647a.5.5 0 0 1 .708 0L9 1.293l.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .801.13l.5 1A.5.5 0 0 1 15 2v12a.5.5 0 0 1-.053.224l-.5 1a.5.5 0 0 1-.8.13L13 14.707l-.646.647a.5.5 0 0 1-.708 0L11 14.707l-.646.647a.5.5 0 0 1-.708 0L9 14.707l-.646.647a.5.5 0 0 1-.708 0L7 14.707l-.646.647a.5.5 0 0 1-.708 0L5 14.707l-.646.647a.5.5 0 0 1-.708 0L3 14.707l-.646.647a.5.5 0 0 1-.801-.13l-.5-1A.5.5 0 0 1 1 14V2a.5.5 0 0 1 .053-.224l.5-1a.5.5 0 0 1 .367-.27m.217 1.338L2 2.118v11.764l.137.274.51-.51a.5.5 0 0 1 .707 0l.646.647.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.509.509.137-.274V2.118l-.137-.274-.51.51a.5.5 0 0 1-.707 0L12 1.707l-.646.647a.5.5 0 0 1-.708 0L10 1.707l-.646.647a.5.5 0 0 1-.708 0L8 1.707l-.646.647a.5.5 0 0 1-.708 0L6 1.707l-.646.647a.5.5 0 0 1-.708 0L4 1.707l-.646.647a.5.5 0 0 1-.708 0z"/>
  <path d="M3 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5m8-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5"/>
</svg>Relatórios
          </a>
          <a
            href="#analise-economica"
            className={`menu-item ${
              pagina === "analise-economica" ? "ativo" : ""
            }`}
            onClick={event => {
              event.preventDefault();
              setPagina("analise-economica");
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-graph-up-arrow" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M0 0h1v15h15v1H0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5"/>
</svg>Análise Econômica
          </a>


          <a
            href="#inicio"
            className={`menu-item ${
              pagina === "inicio" ? "ativo" : ""
            }`}
            onClick={event => {
              event.preventDefault();
              setPagina("inicio");
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pie-chart" viewBox="0 0 16 16">
  <path d="M7.5 1.018a7 7 0 0 0-4.79 11.566L7.5 7.793zm1 0V7.5h6.482A7 7 0 0 0 8.5 1.018M14.982 8.5H8.207l-4.79 4.79A7 7 0 0 0 14.982 8.5M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8"/>
</svg> Dashboard
          </a>

          <a
            href="#categorias"
            className={`menu-item ${
              pagina === "categorias" ? "ativo" : ""
            }`}
            onClick={event => {
              event.preventDefault();
              setPagina("categorias");
            }}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-ruled" viewBox="0 0 16 16">
  <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v4h10V2a1 1 0 0 0-1-1zm9 6H6v2h7zm0 3H6v2h7zm0 3H6v2h6a1 1 0 0 0 1-1zm-8 2v-2H3v1a1 1 0 0 0 1 1zm-2-3h2v-2H3zm0-3h2V7H3z"/>
</svg>Categorias
          </a>

          <a
            href="#receitas"
            className={`menu-item ${
              pagina === "receitas" ? "ativo" : ""
            }`}
            onClick={event => {
              event.preventDefault();
              setPagina("receitas");
            }}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-right" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/>
</svg>Receitas
          </a>

          <a
            href="#despesas"
            className={`menu-item ${
              pagina === "despesas" ? "ativo" : ""
            }`}
            onClick={event => {
              event.preventDefault();
              setPagina("despesas");
            }}
          >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-right" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M14 13.5a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1 0-1h4.793L2.146 2.854a.5.5 0 1 1 .708-.708L13 12.293V7.5a.5.5 0 0 1 1 0z"/>
</svg>Despesas
          </a>

          <a
            href="#cartoes"
            className={`menu-item ${
              pagina === "cartoes" ? "ativo" : ""
            }`}
            onClick={event => {
              event.preventDefault();
              setPagina("cartoes");
            }}
          >
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-credit-card-2-back" viewBox="0 0 16 16">
  <path d="M11 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5z"/>
  <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm13 2v5H1V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1m-1 9H2a1 1 0 0 1-1-1v-1h14v1a1 1 0 0 1-1 1"/>
</svg> Cartões
          </a>

        </nav>

               


<button
  type="button"
  className="botao-logout"
  onClick={fazerLogout}
>
  Sair da conta
</button>
</aside>

     
      
      

<main className="conteudo" id="inicio">

  {pagina === "receitas" ? (
    <Receitas
      receitaParaEditar={receitaParaEditar}
      aoConcluirEdicao={() => setReceitaParaEditar(null)}
    />
  ) : pagina === "despesas" ? (
    <Despesas
      despesaParaEditar={despesaParaEditar}
      aoConcluirEdicao={() => setDespesaParaEditar(null)}
    />
  ) : pagina === "cartoes" ? (
    <Cartoes />
  ) : pagina === "relatorios" ? (
    <Relatorios />
  ) : pagina === "categorias" ? (
    <Categorias />
  ) : pagina === "perfil" ? (
    <Perfil />
  ) : pagina === "analise-economica" ? (
    <AnaliseEconomica
      mes={mes}
      ano={ano}
      formatarMoeda={formatarMoeda}
    />
  ) : (
    <>
      <header className="cabecalho">
        
        <div>
          <h2>Visão geral</h2>
          <p>Acompanhe sua vida financeira.</p>
        </div>

        <div className="seletor-mes">
          <label htmlFor="mes-dashboard"> </label>
          <select
            id="mes-dashboard"
            value={`${mes}-${ano}`}
            onChange={event => {
              const [novoMes, novoAno] = event.target.value.split("-");
              setMes(Number(novoMes));
              setAno(Number(novoAno));
            }}
          >
            {Array.from({ length: 12 }, (_, indice) => {
              const numeroMes = indice + 1;

              return (
                <option
                  key={numeroMes}
                  value={`${numeroMes}-${ano}`}
                >
                  {formatarMes(numeroMes, ano)}
                </option>
              );
            })}
          </select>
        </div>
      </header>

      {erro && (
        <div className="mensagem-erro-dashboard">
          <p>{erro}</p>
          <button
            type="button"
            className="botao-secundario"
            onClick={() => {
              setErro("");
              setPagina("inicio");
              setMes(mes);
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      <section className="resumo">
        <article className="card">
          <div className="card-topo">
            <span>Saldo mensal</span>
            <span className="icone verde">R$</span>
          </div>
          <h3>{carregando ? "Carregando..." : formatarMoeda(saldo)}</h3>
          <p>Resultado financeiro do mês</p>
        </article>

        <article className="card">
          <div className="card-topo">
            <span>Receitas recebidas</span>
            <span className="icone verde">↗</span>
          </div>
          <h3>
            {carregando ? "Carregando..." : formatarMoeda(totalReceitas)}
          </h3>
          <p>Valores recebidos no mês</p>
        </article>

        <article className="card">
          <div className="card-topo">
            <span>Despesas registradas</span>
            <span className="icone vermelho">↘</span>
          </div>
          <h3>
            {carregando ? "Carregando..." : formatarMoeda(totalDespesas)}
          </h3>
          <p>Total de despesas do mês</p>
        </article>

        <article className="card">
          <div className="card-topo">
            <span>Total em aberto</span>
            <span className="icone amarelo">◷</span>
          </div>
          <h3>
            {carregando ? "Carregando..." : formatarMoeda(emAberto)}
          </h3>
          <p>Valores ainda pendentes</p>
        </article>
      </section>

      <section className="painel">
        <div className="painel-topo">
          <div>
            <h3>Movimentações recentes</h3>
            <p>Suas últimas receitas e despesas cadastradas.</p>
          </div>
        </div>

        {erroMovimentacoes && (
          <div className="mensagem-erro-dashboard">
            {erroMovimentacoes}
          </div>
        )}

        {carregandoMovimentacoes ? (
          <p>Carregando movimentações...</p>
        ) : movimentacoes.length === 0 ? (
          <p>Nenhuma movimentação cadastrada.</p>
        ) : (
          <div className="movimentacoes-lista">
            {movimentacoes.map(item => (
              <div className="movimentacao-item" key={item.id}>
                <div className="movimentacao-info">
                  <strong>{item.descricao || "Sem descrição"}</strong>
                  <span>{item.categoria}</span>
                  <small>
                    {item.data
                      ? new Date(`${item.data}T12:00:00`).toLocaleDateString(
                          "pt-BR"
                        )
                      : "Sem data"}
                    {" · "}
                    {item.status || "Sem status"}
                  </small>
                </div>

                <div>
                  <strong
                    className={`movimentacao-valor ${
                      item.tipo === "RECEITA" ? "receita" : "despesa"
                    }`}
                  >
                    {item.tipo === "RECEITA" ? "+" : "-"}
                    {formatarMoeda(item.valor)}
                  </strong>

                  <button
                    type="button"
                    className="botao-secundario"
                    onClick={() => {
                      if (item.tipo === "RECEITA") {
                        setReceitaParaEditar(item.registro);
                        setPagina("receitas");
                      } else {
                        setDespesaParaEditar(item.registro);
                        setPagina("despesas");
                      }
                    }}
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="rodape">
        MyMoney — Controle suas finanças com organização.
      </footer>

    </>
  )}
</main>
    </div>
  );
}

export default App;