
import { useEffect, useState } from "react";
import {
  buscarPerfilUsuario,
  atualizarPerfilUsuario,
  alterarSenhaUsuario
} from "./services/api";
import "./Perfil.css";

function Perfil() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [mensagemSenha, setMensagemSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [emailOriginal, setEmailOriginal] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const usuario = await buscarPerfilUsuario();

        setNome(usuario.nome ?? "");
        setEmail(usuario.email ?? "");
        setEmailOriginal(usuario.email ?? "");
      } catch (erroApi) {
        setErro(
          erroApi.message || "Não foi possível carregar o perfil."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarPerfil();
  }, []);

  async function handleSalvar(event) {
    event.preventDefault();

    setErro("");
    setMensagem("");

    if (!nome.trim() || !email.trim()) {
      setErro("Preencha o nome e o e-mail.");
      return;
    }

    setSalvando(true);

    try {
      const usuario = await atualizarPerfilUsuario({
        nome: nome.trim(),
        email: email.trim()
      });

      setNome(usuario.nome ?? nome.trim());
      setEmail(usuario.email ?? email.trim());
      setEmailOriginal(usuario.email ?? email.trim());

      if (
        (usuario.email ?? email.trim()).toLowerCase() !==
        emailOriginal.toLowerCase()
      ) {
        setMensagem(
          "Perfil atualizado. Como o e-mail mudou, saia da conta e entre novamente com o novo e-mail."
        );
      } else {
        setMensagem("Perfil atualizado com sucesso!");
      }
    } catch (erroApi) {
      setErro(
        erroApi.message || "Não foi possível atualizar o perfil."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <section className="perfil-pagina">
        <p>Carregando perfil...</p>
      </section>
    );
  }
  
async function handleAlterarSenha(event) {
  event.preventDefault();

  setErroSenha("");
  setMensagemSenha("");

  if (novaSenha.length < 8 || novaSenha.length > 72) {
    setErroSenha("A nova senha deve ter entre 8 e 72 caracteres.");
    return;
  }

  if (novaSenha !== confirmarSenha) {
    setErroSenha("A confirmação não corresponde à nova senha.");
    return;
  }

  setSalvandoSenha(true);

  try {
    await alterarSenhaUsuario({
      senhaAtual,
      novaSenha,
      confirmarSenha
    });

    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    setMensagemSenha("Senha alterada com sucesso!");
  } catch (erroApi) {
    setErroSenha(
      erroApi.message || "Não foi possível alterar a senha."
    );
  } finally {
    setSalvandoSenha(false);
  }
}



  return (
    <section className="perfil-pagina">
      
<header className="perfil-cabecalho">
  <div>
    <h2>Meu perfil</h2>
    <p>Gerencie suas informações pessoais.</p>
  </div>
</header>


      {erro && (
        <p className="perfil-mensagem perfil-erro" role="alert">
          {erro}
        </p>
      )}

      {mensagem && (
        <p className="perfil-mensagem perfil-sucesso" role="status">
          {mensagem}
        </p>
      )}

      <form className="perfil-formulario" onSubmit={handleSalvar}>
        <h3>Dados pessoais</h3>

<div className="perfil-campo">
  <label htmlFor="perfil-nome">Nome completo</label>
  <input
    id="perfil-nome"
    type="text"
    value={nome}
    onChange={(event) => setNome(event.target.value)}
    maxLength={100}
    required
  />
</div>

<div className="perfil-campo">
  <label htmlFor="perfil-email">E-mail</label>
  <input
    id="perfil-email"
    type="email"
    value={email}
    readOnly
  />
  <small>O e-mail cadastrado não pode ser alterado.</small>
</div>


        <button
          type="submit"
          className="perfil-botao"
          disabled={salvando}
        >
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>

      
<article className="perfil-seguranca">
  <h3>Segurança da conta</h3>
  <p>Altere sua senha para manter sua conta protegida.</p>

  {erroSenha && (
    <p className="perfil-mensagem perfil-erro" role="alert">
      {erroSenha}
    </p>
  )}

  {mensagemSenha && (
    <p className="perfil-mensagem perfil-sucesso" role="status">
      {mensagemSenha}
    </p>
  )}

  <form onSubmit={handleAlterarSenha}>
    <div className="perfil-campo">
      <label htmlFor="senha-atual">Senha atual</label>
      <input
        id="senha-atual"
        type="password"
        autoComplete="current-password"
        value={senhaAtual}
        onChange={(event) => setSenhaAtual(event.target.value)}
        required
      />
    </div>

    <div className="perfil-campo">
      <label htmlFor="nova-senha">Nova senha</label>
      <input
        id="nova-senha"
        type="password"
        autoComplete="new-password"
        value={novaSenha}
        onChange={(event) => setNovaSenha(event.target.value)}
        minLength={8}
        maxLength={72}
        required
      />
    </div>

    <div className="perfil-campo">
      <label htmlFor="confirmar-senha">Confirmar nova senha</label>
      <input
        id="confirmar-senha"
        type="password"
        autoComplete="new-password"
        value={confirmarSenha}
        onChange={(event) => setConfirmarSenha(event.target.value)}
        minLength={8}
        maxLength={72}
        required
      />
    </div>

    <button
      type="submit"
      className="perfil-botao"
      disabled={salvandoSenha}
    >
      {salvandoSenha ? "Alterando senha..." : "Alterar senha"}
    </button>
  </form>
</article>

    </section>
  );
}

export default Perfil;
