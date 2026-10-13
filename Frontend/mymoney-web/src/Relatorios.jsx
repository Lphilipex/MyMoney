
import { useEffect, useState } from "react";
import {
  listarReceitas,
  listarDespesas
} from "./services/api";
import "./Relatorios.css";

const nomesMeses = [
  "Janeiro", "Fevereiro", "Março", "Abril",
  "Maio", "Junho", "Julho", "Agosto",
  "Setembro", "Outubro", "Novembro", "Dezembro"
];

function Relatorios() {
  const hoje = new Date();

  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());

  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setErro("");

        const [listaReceitas, listaDespesas] = await Promise.all([
          listarReceitas(),
          listarDespesas()
        ]);

        setReceitas(Array.isArray(listaReceitas) ? listaReceitas : []);
        setDespesas(Array.isArray(listaDespesas) ? listaDespesas : []);
      } catch (error) {
        setErro(error.message || "Não foi possível carregar os relatórios.");
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  function pertenceAoPeriodo(data) {
    if (!data) return false;

    const dataRegistro = new Date(`${data}T12:00:00`);

    return (
      !Number.isNaN(dataRegistro.getTime()) &&
      dataRegistro.getMonth() + 1 === Number(mes) &&
      dataRegistro.getFullYear() === Number(ano)
    );
  }

  const receitasDoMes = receitas.filter((receita) =>
    pertenceAoPeriodo(receita.dataRecebimento)
  );

  const despesasDoMes = despesas.filter((despesa) =>
    pertenceAoPeriodo(despesa.dataDespesa)
  );

  const totalRecebido = receitasDoMes
    .filter((receita) => receita.status === "RECEBIDA")
    .reduce((total, receita) => total + Number(receita.valor || 0), 0);

  const totalPrevisto = receitasDoMes
    .filter((receita) => receita.status === "PREVISTA")
    .reduce((total, receita) => total + Number(receita.valor || 0), 0);

  const despesasPagas = despesasDoMes.filter(
    (despesa) => despesa.status === "PAGA"
  );

  const despesasPendentes = despesasDoMes.filter(
    (despesa) => despesa.status === "PENDENTE"
  );

  const despesasAtrasadas = despesasDoMes.filter(
    (despesa) => despesa.status === "ATRASADA"
  );

  function somarValores(lista) {
    return lista.reduce(
      (total, item) => total + Number(item.valor || 0),
      0
    );
  }

  const totalPago = somarValores(despesasPagas);
  const totalPendente = somarValores(despesasPendentes);
  const totalAtrasado = somarValores(despesasAtrasadas);
  const saldoRealizado = totalRecebido - totalPago;

  const tiposDespesa = [
    { tipo: "FIXA", nome: "Despesas fixas" },
    { tipo: "VARIADA", nome: "Despesas variadas" },
    { tipo: "EMERGENCIA", nome: "Despesas de emergência" }
  ];

  const totalDespesas = somarValores(despesasDoMes);

  const formatarMoeda = (valor) =>
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

  if (carregando) {
    return <div className="relatorios"><p>Carregando relatórios...</p></div>;
  }

  if (erro) {
    return (
      <div className="relatorios">
        <h2>Relatórios financeiros</h2>
        <p className="relatorio-erro">{erro}</p>
      </div>
    );
  }

  return (
    <main className="relatorios">
      <div className="relatorios-cabecalho">
        <div>
          <h1>Relatórios financeiros</h1>
          <p>Acompanhe suas receitas, despesas e seu saldo.</p>
        </div>

        <div className="relatorios-filtros">
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            aria-label="Mês do relatório"
          >
            {nomesMeses.map((nome, indice) => (
              <option key={nome} value={indice + 1}>
                {nome}
              </option>
            ))}
          </select>

          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            aria-label="Ano do relatório"
          >
            {Array.from(
              { length: 6 },
              (_, indice) => hoje.getFullYear() - 5 + indice
            ).map((valorAno) => (
              <option key={valorAno} value={valorAno}>
                {valorAno}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="relatorios-indicadores">
        <article className="relatorio-card">
          <span>Receitas recebidas</span>
          <strong className="valor-positivo">
            {formatarMoeda(totalRecebido)}
          </strong>
        </article>

        <article className="relatorio-card">
          <span>Despesas pagas</span>
          <strong>{formatarMoeda(totalPago)}</strong>
        </article>

        <article className="relatorio-card">
          <span>Saldo realizado</span>
          <strong className={saldoRealizado >= 0 ? "valor-positivo" : "valor-negativo"}>
            {formatarMoeda(saldoRealizado)}
          </strong>
        </article>

        <article className="relatorio-card">
          <span>Receitas previstas</span>
          <strong>{formatarMoeda(totalPrevisto)}</strong>
        </article>
      </section>

      <section className="relatorio-painel">
        <h2>Despesas por tipo</h2>

        {tiposDespesa.map((item) => {
          const lista = despesasDoMes.filter(
            (despesa) => despesa.tipoDespesa === item.tipo
          );

          const valor = somarValores(lista);
          const percentual =
            totalDespesas > 0 ? (valor / totalDespesas) * 100 : 0;

          return (
            <div className="relatorio-tipo" key={item.tipo}>
              <div className="relatorio-tipo-info">
                <span>{item.nome}</span>
                <strong>{formatarMoeda(valor)}</strong>
              </div>

              <div className="relatorio-barra-fundo">
                <div
                  className="relatorio-barra"
                  style={{ width: `${percentual}%` }}
                />
              </div>

              <small>{percentual.toFixed(1)}% das despesas</small>
            </div>
          );
        })}
      </section>

      <section className="relatorio-painel">
        <h2>Situação das despesas</h2>

        <div className="relatorio-status">
          <div>
            <span>Pagas</span>
            <strong>{formatarMoeda(totalPago)}</strong>
            <small>{despesasPagas.length} lançamento(s)</small>
          </div>

          <div>
            <span>Pendentes</span>
            <strong>{formatarMoeda(totalPendente)}</strong>
            <small>{despesasPendentes.length} lançamento(s)</small>
          </div>

          <div>
            <span>Atrasadas</span>
            <strong>{formatarMoeda(totalAtrasado)}</strong>
            <small>{despesasAtrasadas.length} lançamento(s)</small>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Relatorios;
