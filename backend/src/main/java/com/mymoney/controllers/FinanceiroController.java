
package com.mymoney.controllers;

import com.mymoney.dto.ResumoFinanceiroIntegradoDTO;
import com.mymoney.services.FinanceiroService;
import com.mymoney.services.UsuarioService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/financeiro")
public class FinanceiroController {

    private final FinanceiroService financeiroService;
    private final UsuarioService usuarioService;

    public FinanceiroController(
            FinanceiroService financeiroService,
            UsuarioService usuarioService) {

        this.financeiroService = financeiroService;
        this.usuarioService = usuarioService;
    }

    private Long obterUsuarioId(Authentication autenticacao) {
        return usuarioService
                .buscarPorEmail(autenticacao.getName())
                .id();
    }

    @GetMapping("/resumo")
    public ResponseEntity<ResumoFinanceiroIntegradoDTO> resumoMensal(
            @RequestParam int mes,
            @RequestParam int ano,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        ResumoFinanceiroIntegradoDTO resumo =
                financeiroService.resumoMensal(
                        usuarioId, mes, ano
                );

        return ResponseEntity.ok(resumo);
    }
}
