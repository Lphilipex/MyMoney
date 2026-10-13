package com.mymoney.controllers;

import java.util.List;

import com.mymoney.dto.ResumoDespesasMensalDTO;
import org.springframework.web.bind.annotation.RequestParam;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.mymoney.model.Despesa;
import com.mymoney.model.Usuario;
import com.mymoney.services.DespesaService;
import com.mymoney.services.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/despesas")
public class DespesaController {

    private final DespesaService despesaService;
    private final UsuarioService usuarioService;

    public DespesaController(
            DespesaService despesaService,
            UsuarioService usuarioService) {
        this.despesaService = despesaService;
        this.usuarioService = usuarioService;
    }

    // Obtém o ID do usuário autenticado
    private Long obterUsuarioId(Authentication autenticacao) {
        return usuarioService
            .buscarPorEmail(autenticacao.getName())
            .id();
    }


    // Cadastra uma despesa
    @PostMapping
    public ResponseEntity<Despesa> cadastrar(
            @Valid @RequestBody Despesa despesa,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        Despesa novaDespesa =
            despesaService.cadastrar(despesa, usuarioId);

        return ResponseEntity.status(HttpStatus.CREATED).body(novaDespesa);
    }

    // Lista as despesas do usuário
    @GetMapping
    public ResponseEntity<List<Despesa>> listar(
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        return ResponseEntity.ok(despesaService.listar(usuarioId));
    }

    // Busca uma despesa pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<Despesa> buscarPorId(
            @PathVariable Long id,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        return ResponseEntity.ok(
            despesaService.buscarPorId(id, usuarioId)
        );
    }

    // Filtra despesas pelo tipo
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Despesa>> listarPorTipo(
            @PathVariable String tipo,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        return ResponseEntity.ok(
            despesaService.listarPorTipo(usuarioId, tipo.toUpperCase())
        );
    }

    // Filtra despesas pelo status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Despesa>> listarPorStatus(
            @PathVariable String status,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        return ResponseEntity.ok(
            despesaService.listarPorStatus(usuarioId, status.toUpperCase())
        );
    }

    // Atualiza uma despesa
    @PutMapping("/{id}")
    public ResponseEntity<Despesa> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody Despesa dados,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        return ResponseEntity.ok(
            despesaService.atualizar(id, dados, usuarioId)
        );
    }

    // Exclui uma despesa
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        despesaService.excluir(id, usuarioId);

        return ResponseEntity.noContent().build();
    }

    // Marca uma despesa como paga
    @PatchMapping("/{id}/pagar")
    public ResponseEntity<Despesa> marcarComoPaga(
            @PathVariable Long id,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        return ResponseEntity.ok(
            despesaService.marcarComoPaga(id, usuarioId)
        );
    }

@GetMapping("/resumo")
public ResponseEntity<ResumoDespesasMensalDTO> resumoMensal(
        @RequestParam int mes,
        @RequestParam int ano,
        Authentication autenticacao) {

    Long usuarioId = obterUsuarioId(autenticacao);

    ResumoDespesasMensalDTO resumo =
            despesaService.resumoMensal(usuarioId, mes, ano);

    return ResponseEntity.ok(resumo);
}


    
}