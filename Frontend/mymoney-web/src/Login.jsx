
import { useState } from "react";
import { loginUsuario } from "./services/api";
import "./Login.css";

function Login({ onLogin, onCadastro }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setMensagem("");
    setCarregando(true);

    try {
      const resultado = await loginUsuario({
        email: email,
        senha: senha
      });

      if (!resultado?.token) {
        throw new Error("A API não retornou o token de acesso.");
      }

      sessionStorage.setItem("token", resultado.token);
      sessionStorage.setItem("tipoToken", resultado.tipo || "Bearer");

      onLogin();
    } catch (erro) {
      setMensagem(erro.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-container">
        <div className="login-card">
        <h2>Entrar no MyMoney</h2>
        <p>Acesse sua conta para continuar.</p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <button type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {mensagem && (
          <p role="alert" style={{ color: "red" }}>
            {mensagem}
          </p>
        )}

        <p>
          Ainda não tem conta?
          {" "}
          <button type="button" onClick={onCadastro}>
            Criar conta
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
