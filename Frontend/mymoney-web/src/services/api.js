

const API_URL = "http://localhost:8080";

// Converte a resposta da API em um objeto JavaScript.
async function processarResposta(resposta) {
  const texto = await resposta.text();
  let resultado = null;

  if (texto) {
    try {
      resultado = JSON.parse(texto);
    } catch {
      resultado = { mensagem: texto };
    }
  }

  if (!resposta.ok) {
    throw new Error(
      resultado?.erro ||
      resultado?.mensagem ||
      `Erro na requisição. Código: ${resposta.status}`
    );
  }

  return resultado;
}

// Cadastra um novo usuário.
export async function cadastrarUsuario(dados) {
  const resposta = await fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(dados)
  });

  return processarResposta(resposta);
}

// Realiza o login.
export async function loginUsuario(dados) {
  const resposta = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(dados)
  });

  return processarResposta(resposta);
}

// Realiza requisições que precisam de autenticação.
async function requisicaoAutenticada(url) {
  const token = sessionStorage.getItem("token");
  const tipoToken = sessionStorage.getItem("tipoToken") || "Bearer";

  if (!token) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  const resposta = await fetch(`${API_URL}${url}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `${tipoToken} ${token}`
    }
  });

  return processarResposta(resposta);
}

// Busca o resumo financeiro de um mês e ano.


export async function buscarResumoFinanceiro(mes, ano) {
  return requisicaoAutenticada(
    `/financeiro/resumo?mes=${mes}&ano=${ano}`
  );
}

 // Lista as receitas do usuário.
export async function listarReceitas() {
  return requisicaoAutenticada("/receitas");
}

// Busca uma receita pelo ID.
export async function buscarReceitaPorId(id) {
  return requisicaoAutenticada(`/receitas/${id}`);
}

// Cadastra uma receita.
export async function cadastrarReceita(dados) {
  return requisicaoAutenticadaComBody("/receitas", "POST", dados);
}

// Atualiza uma receita.
export async function atualizarReceita(id, dados) {
  return requisicaoAutenticadaComBody(`/receitas/${id}`, "PUT", dados);
}

// Exclui uma receita.
export async function excluirReceita(id) {
  return requisicaoAutenticadaComBody(`/receitas/${id}`, "DELETE");
}


 // Lista as categorias.
export async function listarCategorias() {
  return requisicaoAutenticada("/categorias");
}

// Cadastra uma categoria.
export async function cadastrarCategoria(dados) {
  return requisicaoAutenticadaComBody("/categorias", "POST", dados);
}

// Atualiza uma categoria.
export async function atualizarCategoria(id, dados) {
  return requisicaoAutenticadaComBody(`/categorias/${id}`, "PUT", dados);
}

// Exclui uma categoria.
export async function excluirCategoria(id) {
  return requisicaoAutenticadaComBody(`/categorias/${id}`, "DELETE");
}



async function requisicaoAutenticadaComBody(url, metodo, dados) {
  const token = sessionStorage.getItem("token");
  const tipoToken = sessionStorage.getItem("tipoToken") || "Bearer";

  if (!token) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  const opcoes = {
    method: metodo,
    headers: {
      "Accept": "application/json",
      "Authorization": `${tipoToken} ${token}`
    }
  };

  if (dados) {
    opcoes.headers["Content-Type"] = "application/json";
    opcoes.body = JSON.stringify(dados);
  }

  const resposta = await fetch(`http://localhost:8080${url}`, opcoes);
  return processarResposta(resposta);
}

export async function listarDespesas() {
  return requisicaoAutenticada("/despesas");
}

export async function cadastrarDespesa(dados) {
  return requisicaoAutenticadaComBody("/despesas", "POST", dados);
}

export async function atualizarDespesa(id, dados) {
  return requisicaoAutenticadaComBody(`/despesas/${id}`, "PUT", dados);
}

export async function excluirDespesa(id) {
  return requisicaoAutenticadaComBody(`/despesas/${id}`, "DELETE");
}

export async function marcarDespesaComoPaga(id) {
  return requisicaoAutenticadaComBody(`/despesas/${id}/pagar`, "PATCH");
}

export async function listarDespesasPorTipo(tipo) {
  return requisicaoAutenticada(`/despesas/tipo/${tipo}`);
}

export async function listarDespesasPorStatus(status) {
  return requisicaoAutenticada(`/despesas/status/${status}`);
}

export async function buscarResumoDespesas() {
  return requisicaoAutenticada("/despesas/resumo");
}

export async function listarCartoes() {
  return requisicaoAutenticada("/cartoes");
}

export async function cadastrarCartao(dados) {
  return requisicaoAutenticadaComBody("/cartoes", "POST", dados);
}

export async function atualizarCartao(id, dados) {
  return requisicaoAutenticadaComBody(`/cartoes/${id}`, "PUT", dados);
}

export async function excluirCartao(id) {
  return requisicaoAutenticadaComBody(`/cartoes/${id}`, "DELETE");
}

export async function listarComprasCartao() {
  return requisicaoAutenticada("/compras-cartao");
}

export async function cadastrarCompraCartao(dados) {
  return requisicaoAutenticadaComBody(
    "/compras-cartao",
    "POST",
    dados
  );
}

export async function buscarResumoCartao() {
  return requisicaoAutenticada("/compras-cartao/resumo");
}

export async function listarParcelasCompra(id) {
  return requisicaoAutenticada(`/compras-cartao/${id}/parcelas`);
}

export async function pagarParcela(compraId, parcelaId) {
  return requisicaoAutenticadaComBody(
    `/compras-cartao/${compraId}/parcelas/${parcelaId}/pagar`,
    "PATCH"
  );
}

export async function atualizarParcelasAtrasadas() {
  return requisicaoAutenticadaComBody(
    "/compras-cartao/parcelas/atualizar-atrasadas",
    "PATCH"
  );
}

/* ANÁLISE ECONÔMICA */

// Busca a análise econômica de um mês.
export async function buscarAnaliseEconomica(mes, ano) {
  return requisicaoAutenticada(
    `/analise-economica?mes=${mes}&ano=${ano}`
  );
}

// Consulta a meta de economia do usuário.
export async function buscarMetaEconomia() {
  return requisicaoAutenticada("/analise-economica/meta");
}

// Cadastra ou atualiza a meta de economia.
export async function salvarMetaEconomia(percentual) {
  return requisicaoAutenticadaComBody(
    "/analise-economica/meta",
    "PUT",
    { percentual: Number(percentual) }
  );
}

export async function atualizarCompraCartao(id, dados) {
  return requisicaoAutenticadaComBody(
    `/compras-cartao/${id}`,
    "PUT",
    dados
  );
}

export async function excluirCompraCartao(id) {
  return requisicaoAutenticadaComBody(
    `/compras-cartao/${id}`,
    "DELETE"
  );
}


export async function buscarHistoricoEconomico(mes, ano) {
  return requisicaoAutenticada(
    `/analise-economica/historico?mes=${mes}&ano=${ano}`
  );
}

export async function buscarGastosPorCategoria(mes, ano) {
  return requisicaoAutenticada(
    `/analise-economica/categorias?mes=${mes}&ano=${ano}`
  );
}


export async function buscarPerfilUsuario() {
  return requisicaoAutenticada("/usuarios");
}

export async function atualizarPerfilUsuario(dados) {
  return requisicaoAutenticadaComBody(
    "/usuarios",
    "PUT",
    dados
  );
}

export async function alterarSenhaUsuario(dados) {
  return requisicaoAutenticadaComBody(
    "/usuarios/alterar-senha",
    "PUT",
    dados
  );
}

/* INVESTIMENTOS */

// Lista os investimentos cadastrados.
export async function listarInvestimentos() {
  return requisicaoAutenticada("/investimentos");
}











