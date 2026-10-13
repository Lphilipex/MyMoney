
package com.mymoney.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.mymoney.model.Cartao;
import com.mymoney.model.Usuario;
import com.mymoney.services.CartaoService;
import com.mymoney.services.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/cartoes")
public class CartaoController {

    private final CartaoService cartaoService;
    private final UsuarioService usuarioService;

    public CartaoController(
            CartaoService cartaoService,
            UsuarioService usuarioService) {

        this.cartaoService = cartaoService;
        this.usuarioService = usuarioService;
    }

    // Obtém o ID do usuário autenticado
    private Long obterUsuarioId(Authentication autenticacao) {
        return usuarioService
                .buscarPorEmail(autenticacao.getName())
                .id();
    }
    

    // Cadastra um cartão
    @PostMapping
    public ResponseEntity<Cartao> cadastrar(
            @Valid @RequestBody Cartao cartao,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        Cartao novoCartao = cartaoService.cadastrar(
                cartao,
                usuarioId
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(novoCartao);
    }

    // Lista os cartões do usuário autenticado
    @GetMapping
    public ResponseEntity<List<Cartao>> listar(
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        return ResponseEntity.ok(
                cartaoService.listar(usuarioId)
        );
    }

    // Busca um cartão pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<Cartao> buscarPorId(
            @PathVariable Long id,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        return ResponseEntity.ok(
                cartaoService.buscarPorId(id, usuarioId)
        );
    }

    // Atualiza um cartão
    @PutMapping("/{id}")
    public ResponseEntity<Cartao> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody Cartao dados,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        return ResponseEntity.ok(
                cartaoService.atualizar(id, dados, usuarioId)
        );
    }

    // Exclui um cartão
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        cartaoService.excluir(id, usuarioId);

        return ResponseEntity.noContent().build();
    }
}