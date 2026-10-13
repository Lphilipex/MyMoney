
package com.mymoney.controllers;

import com.mymoney.dto.CadastroUsuarioDTO;
import com.mymoney.dto.UsuarioRespostaDTO;
import com.mymoney.services.UsuarioService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.mymoney.dto.AlterarSenhaDTO;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioRespostaDTO cadastrar(
            @Valid @RequestBody CadastroUsuarioDTO dados) {

        return service.cadastrar(dados);
    }

    @GetMapping
    public UsuarioRespostaDTO buscarUsuarioLogado(
            Authentication autenticacao) {

        String email = autenticacao.getName();

        return service.buscarPorEmail(email);
    }


	@PutMapping
	public UsuarioRespostaDTO atualizarPerfil(
	        @jakarta.validation.Valid
	        @RequestBody com.mymoney.dto.AtualizarPerfilDTO dados,
	        Authentication autenticacao) {
	
	    return service.atualizarPerfil(
	        autenticacao.getName(),
	        dados
	    );
	}

	@PutMapping("/alterar-senha")
	public ResponseEntity<Void> alterarSenha(
	        @jakarta.validation.Valid
	        @RequestBody AlterarSenhaDTO dados,
	        Authentication autenticacao) {
	
	    service.alterarSenha(
	        autenticacao.getName(),
	        dados
	    );
	
	    return ResponseEntity.noContent().build();
	}



}

