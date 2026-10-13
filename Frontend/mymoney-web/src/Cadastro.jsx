
import { useState } from "react";
import { cadastrarUsuario } from "./services/api";
import "./Cadastro.css";

function Cadastro({ onVoltar }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleCadastro(event) {
    event.preventDefault();

    setMensagem("");
    setTipoMensagem("");
    setCarregando(true);

    try {
      await cadastrarUsuario({
        nome,
        email,
        senha
      });

      setMensagem("Conta criada com sucesso!");
      setTipoMensagem("sucesso");

      setNome("");
      setEmail("");
      setSenha("");
    } catch (erro) {
      setMensagem(erro.message || "Não foi possível criar a conta.");
      setTipoMensagem("erro");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="cadastro-container">
      <div className="cadastro-card">
        <div className="cadastro-logo">M</div>

        <h1>MyMoney</h1>
        <p className="cadastro-subtitulo">
          Organize sua vida financeira.
        </p>

        <h2>Criar sua conta</h2>
        <p className="cadastro-descricao">
          Preencha os dados para começar.
        </p>

        <form onSubmit={handleCadastro}>
          <div className="cadastro-campo">
            <label htmlFor="cadastro-nome">Nome</label>
            <input
              id="cadastro-nome"
              type="text"
              placeholder="Digite seu nome"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div className="cadastro-campo">
            <label htmlFor="cadastro-email">E-mail</label>
            <input
              id="cadastro-email"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="cadastro-campo">
            <label htmlFor="cadastro-senha">Senha</label>
            <input
              id="cadastro-senha"
              type="password"
              placeholder="Crie uma senha"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <small>A senha deve ter pelo menos 8 caracteres.</small>
          </div>

          {mensagem && (
            <p
              className={`cadastro-mensagem ${tipoMensagem}`}
              role="status"
            >
              {mensagem}
            </p>
          )}

          <button type="submit" disabled={carregando}>
            {carregando ? "Cadastrando..." : "Criar conta"}
          </button>
        </form>

        <p className="cadastro-voltar">
          Já tem uma conta?
          {" "}
          <button type="button" onClick={onVoltar}>
            Voltar ao login
          </button>
        </p>
      </div>
    </div>
  );
}

export default Cadastro;
