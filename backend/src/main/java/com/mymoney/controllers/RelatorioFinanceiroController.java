
package com.mymoney.controllers;

import com.mymoney.dto.RelatorioCategoriasMensalDTO;
import com.mymoney.services.RelatorioFinanceiroService;
import com.mymoney.services.UsuarioService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/relatorios")
public class RelatorioFinanceiroController {

    private final RelatorioFinanceiroService relatorioService;
    private final UsuarioService usuarioService;

    public RelatorioFinanceiroController(
            RelatorioFinanceiroService relatorioService,
            UsuarioService usuarioService) {

        this.relatorioService = relatorioService;
        this.usuarioService = usuarioService;
    }

    @GetMapping("/categorias")
    public ResponseEntity<RelatorioCategoriasMensalDTO>
            relatorioPorCategoria(
                    @RequestParam int mes,
                    @RequestParam int ano,
                    Authentication autenticacao) {

        Long usuarioId = usuarioService
                .buscarPorEmail(autenticacao.getName())
                .id();

        RelatorioCategoriasMensalDTO relatorio =
                relatorioService.relatorioPorCategoria(
                        usuarioId, mes, ano
                );

        return ResponseEntity.ok(relatorio);
    }
}
