
package com.mymoney.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mymoney.dto.AnaliseEconomicaDTO;
import com.mymoney.dto.UsuarioRespostaDTO;
import com.mymoney.services.AnaliseEconomicaService;
import com.mymoney.services.UsuarioService;

import org.springframework.security.core.Authentication;

import java.util.List;

import com.mymoney.dto.HistoricoEconomicoDTO;
import com.mymoney.dto.GastoCategoriaDTO;

@RestController
@RequestMapping("/analise-economica")
public class AnaliseEconomicaController {

    private final AnaliseEconomicaService analiseEconomicaService;
    private final UsuarioService usuarioService;

    public AnaliseEconomicaController(
            AnaliseEconomicaService analiseEconomicaService,
            UsuarioService usuarioService) {

        this.analiseEconomicaService = analiseEconomicaService;
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public AnaliseEconomicaDTO analisar(
            @RequestParam int mes,
            @RequestParam int ano,
            Authentication autenticacao) {

        UsuarioRespostaDTO usuario =
                usuarioService.buscarPorEmail(
                        autenticacao.getName());

        return analiseEconomicaService.analisar(
                usuario.id(), mes, ano);
    }
    @GetMapping("/historico")
    public List<HistoricoEconomicoDTO> buscarHistorico(
            @RequestParam int mes,
            @RequestParam int ano,
            Authentication autenticacao) {

        UsuarioRespostaDTO usuario =
            usuarioService.buscarPorEmail(autenticacao.getName());

        return analiseEconomicaService.buscarHistorico(
            usuario.id(), mes, ano
        );
    }

    @GetMapping("/categorias")
    public List<GastoCategoriaDTO> buscarGastosPorCategoria(
            @RequestParam int mes,
            @RequestParam int ano,
            Authentication autenticacao) {

        UsuarioRespostaDTO usuario =
            usuarioService.buscarPorEmail(autenticacao.getName());

        return analiseEconomicaService.buscarGastosPorCategoria(
            usuario.id(), mes, ano
        );
    }
}
