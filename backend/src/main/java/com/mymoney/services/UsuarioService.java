
package com.mymoney.services;

import com.mymoney.model.Usuario;


import com.mymoney.dto.CadastroUsuarioDTO;
import com.mymoney.dto.UsuarioRespostaDTO;
import com.mymoney.model.Usuario;
import com.mymoney.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.mymoney.dto.AlterarSenhaDTO;




import java.util.Locale;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository repository,
            PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public UsuarioRespostaDTO cadastrar(CadastroUsuarioDTO dados) {

        String email = dados.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (repository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este e-mail já está cadastrado"
            );
        }

        Usuario usuario = new Usuario();

        usuario.setNome(dados.nome().trim());
        usuario.setEmail(email);
        usuario.setSenhaHash(
                passwordEncoder.encode(dados.senha())
        );

        Usuario usuarioSalvo = repository.save(usuario);

        return UsuarioRespostaDTO.deUsuario(usuarioSalvo);
    }
    public java.util.List<UsuarioRespostaDTO> listarTodos() {
        return repository.findAll()
                .stream()
                .map(UsuarioRespostaDTO::deUsuario)
                .toList();
    }

    public UsuarioRespostaDTO buscarPorId(Long id) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuário não encontrado"
                ));

        return UsuarioRespostaDTO.deUsuario(usuario);
    }
    public UsuarioRespostaDTO buscarPorEmail(String email) {

        Usuario usuario = repository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuário não encontrado"
                ));

        return UsuarioRespostaDTO.deUsuario(usuario);
    }


public UsuarioRespostaDTO atualizarPerfil(
        String emailAtual,
        com.mymoney.dto.AtualizarPerfilDTO dados) {

    Usuario usuario = repository.findByEmail(emailAtual)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Usuário não encontrado"
        ));

    String novoNome = dados.nome().trim();

    if (novoNome.isEmpty()) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "O nome é obrigatório"
        );
    }

    usuario.setNome(novoNome);

    Usuario usuarioSalvo = repository.save(usuario);

    return UsuarioRespostaDTO.deUsuario(usuarioSalvo);
}

public void alterarSenha(String emailAtual, AlterarSenhaDTO dados) {

    Usuario usuario = repository.findByEmail(emailAtual)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Usuário não encontrado"
        ));

    if (!passwordEncoder.matches(
            dados.senhaAtual(),
            usuario.getSenhaHash())) {

        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "A senha atual está incorreta"
        );
    }

    if (!dados.novaSenha().equals(dados.confirmarSenha())) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "A confirmação não corresponde à nova senha"
        );
    }

    if (passwordEncoder.matches(
            dados.novaSenha(),
            usuario.getSenhaHash())) {

        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "A nova senha deve ser diferente da senha atual"
        );
    }

    usuario.setSenhaHash(
        passwordEncoder.encode(dados.novaSenha())
    );

    repository.save(usuario);
}




}