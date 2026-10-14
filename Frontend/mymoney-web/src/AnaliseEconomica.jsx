
import { useEffect, useState } from "react";


import {
  buscarAnaliseEconomica,
  buscarMetaEconomia,
  salvarMetaEconomia,
  buscarHistoricoEconomico,
  buscarGastosPorCategoria,
  listarInvestimentos
} from "./services/api";



import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";



import "./AnaliseEconomica.css";

const CORES_GRAFICO = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#64748b"
];

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

function AnaliseEconomica({ mes, ano, formatarMoeda }) {
  const [analise, setAnalise] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [gastosCategoria, setGastosCategoria] = useState([]);

  const [percentual, setPercentual] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [erroGraficos, setErroGraficos] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregando(true);
      setErro("");
      setErroGraficos("");
      setMensagem("");

      try {
        const resultado = await buscarAnaliseEconomica(mes, ano);

        if (ativo) {
          setAnalise(resultado);
        }
      } catch (erroApi) {
        if (ativo) {
          setErro(
            erroApi.message ||
              "Não foi possível carregar a análise econômica."
          );
        }

        if (ativo) {
          setCarregando(false);
        }

        return;
      }

      const resultados = await Promise.allSettled([
        buscarMetaEconomia(),
        buscarHistoricoEconomico(mes, ano),
        buscarGastosPorCategoria(mes, ano)
      ]);

      if (!ativo) {
        return;
      }

      const [resultadoMeta, resultadoHistorico, resultadoCategorias] =
        resultados;

      if (resultadoMeta.status === "fulfilled") {
        setPercentual(String(resultadoMeta.value.percentual ?? ""));
      } else {
        setPercentual("");
      }

      let houveErroGrafico = false;

      if (resultadoHistorico.status === "fulfilled") {
        setHistorico(
          Array.isArray(resultadoHistorico.value)
            ? resultadoHistorico.value
            : []
        );
      } else {
        setHistorico([]);
        houveErroGrafico = true;
      }

      if (resultadoCategorias.status === "fulfilled") {
        setGastosCategoria(
          Array.isArray(resultadoCategorias.value)
            ? resultadoCategorias.value
            : []
        );
      } else {
        setGastosCategoria([]);
        houveErroGrafico = true;
      }

      if (houveErroGrafico) {
        setErroGraficos(
          "Não foi possível carregar um ou mais gráficos. Confira os endpoints do backend."
        );
      }

      setCarregando(false);
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, [mes, ano]);

  async function handleSalvarMeta(event) {
    event.preventDefault();

    const valorMeta = Number(percentual);

    if (
      percentual.trim() === "" ||
      !Number.isFinite(valorMeta) ||
      valorMeta < 0 ||
      valorMeta > 100
    ) {
      setErro("Informe uma meta entre 0% e 100%.");
      return;
    }

    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
      await salvarMetaEconomia(valorMeta);

      const resultado = await buscarAnaliseEconomica(mes, ano);

      setAnalise(resultado);
      setMensagem("Meta de economia salva com sucesso.");
    } catch (erroApi) {
      setErro(erroApi.message || "Não foi possível salvar a meta.");
    } finally {
      setSalvando(false);
    }
  }

  const valor = numero => Number(numero ?? 0);

  const economiaAtual = valor(analise?.economiaRealizada);
  const economiaAnterior = valor(
    analise?.economiaRealizadaMesAnterior
  );

  const diferencaMes = economiaAtual - economiaAnterior;

  const historicoFormatado = historico.map(item => ({
    ...item,
    mesNome: `${MESES[valor(item.mes) - 1] ?? ""}/${String(item.ano).slice(-2)}`,
    receitaRecebida: valor(item.receitaRecebida),
    despesasPagas: valor(item.despesasPagas),
    economiaRealizada: valor(item.economiaRealizada)
  }));

 
const categoriasFormatadas = gastosCategoria.map((item) => ({
  ...item,
  totalPago: Number(item.totalPago ?? 0),
  totalPendente: Number(item.totalPendente ?? 0)
}));


 const totalCategorias = categoriasFormatadas.reduce(
  (total, item) => total + item.totalPago + item.totalPendente,
  0
);

  const metaConfigurada = analise?.percentualMeta != null;
  const valorMeta = valor(analise?.economiaProjetada);
  const metaAtingida = economiaAtual >= valorMeta;

  if (carregando) {
    return (
      <section className="analise-economica">
        <p>Carregando análise econômica...</p>
      </section>
    );
  }

  if (erro && !analise) {
    return (
      <section className="analise-economica">
        <h2>Análise Econômica</h2>
        <p className="analise-erro" role="alert">
          {erro}
        </p>
      </section>
    );
  }

  return (
    <section className="analise-economica">
      <header className="analise-cabecalho">
        <div>
          <h2>Análise Econômica</h2>
          <p>
            Entenda seus gastos, acompanhe sua economia e compare
            seus resultados.
          </p>
        </div>
      </header>

      {erro && (
        <p className="analise-erro" role="alert">
          {erro}
        </p>
      )}

      {mensagem && (
        <p className="analise-sucesso" role="status">
          {mensagem}
        </p>
      )}

      <form className="meta-formulario" onSubmit={handleSalvarMeta}>
        <div>
          <label htmlFor="meta-percentual">
            Meta de economia (%)
          </label>
          <p>
            Defina quanto da sua receita recebida deseja economizar.
          </p>
        </div>

        <input
          id="meta-percentual"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={percentual}
          onChange={event => setPercentual(event.target.value)}
          placeholder="Ex.: 20"
          required
        />

        <button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar meta"}
        </button>
      </form>

      <div className="analise-grade">
        <article className="analise-card">
          <span>Receitas recebidas</span>
          <h3>{formatarMoeda(analise.receitaRecebida)}</h3>
          <p>Entradas confirmadas no mês</p>
        </article>

        <article className="analise-card">
          <span>Despesas pagas</span>
          <h3>{formatarMoeda(analise.despesasPagas)}</h3>
          <p>Despesas marcadas como pagas</p>
        </article>

        <article className="analise-card">
          <span>Valor da meta de economia</span>
          <h3>{formatarMoeda(analise.economiaProjetada)}</h3>
          <p>
            Meta:{" "}
            {metaConfigurada
              ? `${analise.percentualMeta}% da receita`
              : "Não configurada"}
          </p>
        </article>

        <article className="analise-card">
          <span>Economia realizada</span>
          <h3>{formatarMoeda(analise.economiaRealizada)}</h3>
          <p>
            Percentual economizado:{" "}
            {valor(analise.percentualEconomizado).toLocaleString(
              "pt-BR",
              { maximumFractionDigits: 2 }
            )}%
          </p>
        </article>

        <article className="analise-card">
          <span>Diferença da meta</span>
          <h3>{formatarMoeda(analise.diferencaMeta)}</h3>
          <p>
            {!metaConfigurada
              ? "Configure uma meta para acompanhar seu objetivo."
              : valor(analise.diferencaMeta) >= 0
                ? "Você atingiu ou superou a meta."
                : "Você está abaixo da meta."}
          </p>
        </article>

        <article className="analise-card">
          <span>Comparação com o mês anterior</span>
          <h3 className={diferencaMes >= 0 ? "valor-positivo" : "valor-negativo"}>
            {diferencaMes > 0 ? "+" : ""}
            {formatarMoeda(diferencaMes)}
          </h3>
          <p>
            Economia no mês anterior:{" "}
            {formatarMoeda(economiaAnterior)}
          </p>
        </article>
      </div>

      <div className="analise-graficos">
        <article className="analise-grafico-card">
          <div className="grafico-cabecalho">
            <h3>Evolução financeira</h3>
            <p>Últimos 12 meses</p>
          </div>

          {historicoFormatado.length > 0 ? (
            <div className="grafico-area">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={historicoFormatado}
                  margin={{ top: 10, right: 15, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mesNome" tick={{ fontSize: 12 }} />
                  <YAxis
                    width={75}
                    tick={{ fontSize: 11 }}
                    tickFormatter={numero =>
                      numero.toLocaleString("pt-BR", {
                        notation: "compact",
                        maximumFractionDigits: 1
                      })
                    }
                  />
                  <Tooltip
                    formatter={numero => formatarMoeda(numero)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="receitaRecebida"
                    name="Receitas"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="despesasPagas"
                    name="Despesas"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="economiaRealizada"
                    name="Economia"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="grafico-vazio">
              Não há histórico disponível para exibir.
            </p>
          )}
        </article>

        <article className="analise-grafico-card">
          <div className="grafico-cabecalho">
            <h3>Gastos por categoria</h3>
            <p>Despesas pagas no mês selecionado</p>
          </div>

          
{categoriasFormatadas.length > 0 ? (
  <ResponsiveContainer width="100%" height={320}>
    <BarChart
      data={categoriasFormatadas}
      margin={{ top: 10, right: 10, left: 10, bottom: 35 }}
    >
      <CartesianGrid strokeDasharray="3 3" />

      <XAxis
        dataKey="categoria"
        angle={-25}
        textAnchor="end"
        interval={0}
        height={70}
      />

      <YAxis />

      <Tooltip
        formatter={(valor) =>
          Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
          })
        }
      />

      <Legend />

      <Bar
        dataKey="totalPago"
        name="Despesas pagas"
        fill="#16a34a"
      />

      <Bar
        dataKey="totalPendente"
        name="Despesas pendentes"
        fill="#f59e0b"
      />
    </BarChart>
  </ResponsiveContainer>
) : (
  <p>Não existem despesas nesta categoria para o mês selecionado.</p>
)}

        </article>
      </div>

      {erroGraficos && (
        <p className="analise-aviso" role="status">
          {erroGraficos}
        </p>
      )}

      {metaConfigurada && (
        <article className="analise-meta-resumo">
          <div>
            <h3>Acompanhamento da meta</h3>
            <p>
              Objetivo de economia de {analise.percentualMeta}% da receita recebida.
            </p>
          </div>

          <div className="meta-progresso">
            <div className="meta-progresso-texto">
              <span>Meta mensal</span>
              <strong>{formatarMoeda(valorMeta)}</strong>
            </div>

            <div
              className="meta-barra"
              role="progressbar"
              aria-label="Progresso da meta de economia"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={
                valorMeta > 0
                  ? Math.min(
                      100,
                      Math.max(0, (economiaAtual / valorMeta) * 100)
                    )
                  : metaAtingida ? 100 : 0
              }
            >
              <div
                className={`meta-barra-preenchimento ${
                  metaAtingida ? "meta-atingida" : ""
                }`}
                style={{
                  width:
                    valorMeta > 0
                      ? `${Math.min(
                          100,
                          Math.max(0, (economiaAtual / valorMeta) * 100)
                        )}%`
                      : metaAtingida ? "100%" : "0%"
                }}
              />
            </div>

            <p>
              Resultado atual: {formatarMoeda(economiaAtual)}
            </p>
          </div>
        </article>
      )}
    </section>
  );
}

export default AnaliseEconomica;
