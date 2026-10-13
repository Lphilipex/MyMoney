
package com.mymoney.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mymoney.dto.MetaEconomiaRequestDTO;
import com.mymoney.dto.UsuarioRespostaDTO;
import com.mymoney.model.MetaEconomia;
import com.mymoney.services.MetaEconomiaService;
import com.mymoney.services.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/analise-economica/meta")
public class MetaEconomiaController {

    private final MetaEconomiaService metaEconomiaService;
    private final UsuarioService usuarioService;

    public MetaEconomiaController(
            MetaEconomiaService metaEconomiaService,
            UsuarioService usuarioService) {

        this.metaEconomiaService = metaEconomiaService;
        this.usuarioService = usuarioService;
    }

    private Long obterUsuarioId(Authentication autenticacao) {
        UsuarioRespostaDTO usuario =
                usuarioService.buscarPorEmail(autenticacao.getName());

        return usuario.id();
    }

    @GetMapping
    public ResponseEntity<MetaEconomia> consultarMeta(
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        MetaEconomia meta =
                metaEconomiaService.consultar(usuarioId);

        if (meta == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(meta);
    }

    @PutMapping
    public ResponseEntity<MetaEconomia> salvarMeta(
            @Valid @RequestBody MetaEconomiaRequestDTO dados,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        MetaEconomia meta = metaEconomiaService.salvar(
                dados.percentual(),
                usuarioId
        );

        return ResponseEntity.ok(meta);
    }
}
