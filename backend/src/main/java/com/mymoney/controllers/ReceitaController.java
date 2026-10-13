
package com.mymoney.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.mymoney.dto.UsuarioRespostaDTO;
import com.mymoney.model.Receita;
import com.mymoney.services.ReceitaService;
import com.mymoney.services.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/receitas")
public class ReceitaController {

    private final ReceitaService receitaService;
    private final UsuarioService usuarioService;

    public ReceitaController(
            ReceitaService receitaService,
            UsuarioService usuarioService) {

        this.receitaService = receitaService;
        this.usuarioService = usuarioService;
    }

    private Long obterUsuarioId(Authentication autenticacao) {
        UsuarioRespostaDTO usuario =
                usuarioService.buscarPorEmail(autenticacao.getName());

        return usuario.id();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Receita cadastrar(
            @Valid @RequestBody Receita receita,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        return receitaService.cadastrar(receita, usuarioId);
    }

    @GetMapping
    public List<Receita> listar(Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        return receitaService.listar(usuarioId);
    }

    @GetMapping("/{id}")
    public Receita buscarPorId(
            @PathVariable Long id,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        return receitaService.buscarPorId(id, usuarioId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(
            @PathVariable Long id,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        receitaService.excluir(id, usuarioId);
    }

@PutMapping("/{id}")
public Receita atualizar(
        @PathVariable Long id,
        @Valid @RequestBody Receita dados,
        Authentication autenticacao) {

    Long usuarioId = obterUsuarioId(autenticacao);

    return receitaService.atualizar(id, dados, usuarioId);
}
}


