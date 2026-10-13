
package com.mymoney.controllers;

import org.springframework.web.bind.annotation.RequestParam;

import com.mymoney.model.CompraCartao;
import com.mymoney.model.Parcela;
import com.mymoney.services.CompraCartaoService;
import com.mymoney.services.UsuarioService;
import com.mymoney.dto.UsuarioRespostaDTO;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.mymoney.dto.ResumoFinanceiroDTO;
import org.springframework.web.bind.annotation.GetMapping;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/compras-cartao")
public class CompraCartaoController {

    private final CompraCartaoService compraService;
    private final UsuarioService usuarioService;

    public CompraCartaoController(
            CompraCartaoService compraService,
            UsuarioService usuarioService) {

        this.compraService = compraService;
        this.usuarioService = usuarioService;
    }

    private Long obterUsuarioId(Authentication autenticacao) {
        UsuarioRespostaDTO usuario =
                usuarioService.buscarPorEmail(autenticacao.getName());

        return usuario.id();
    }

    @PostMapping
    public ResponseEntity<CompraCartao> cadastrar(
            @RequestBody CompraCartao compra,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        CompraCartao novaCompra =
                compraService.cadastrar(compra, usuarioId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(novaCompra);
    }
    

@GetMapping("/resumo")
public ResumoFinanceiroDTO resumoFinanceiro(
        Authentication autenticacao) {

    Long usuarioId = obterUsuarioId(autenticacao);

    return compraService.gerarResumoFinanceiro(usuarioId);
}
    @PatchMapping("/{compraId}/parcelas/{parcelaId}/pagar")
    public ResponseEntity<Parcela> marcarComoPaga(
            @PathVariable Long compraId,
            @PathVariable Long parcelaId,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        Parcela parcela = compraService.marcarComoPaga(
                compraId, parcelaId, usuarioId);

        return ResponseEntity.ok(parcela);
    }

    @GetMapping
    public ResponseEntity<List<CompraCartao>> listar(
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        return ResponseEntity.ok(
                compraService.listar(usuarioId));
    }

    @GetMapping("/{id}/parcelas")
    public ResponseEntity<List<Parcela>> listarParcelas(
            @PathVariable Long id,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        return ResponseEntity.ok(
                compraService.listarParcelas(id, usuarioId));
    }
    @GetMapping("/parcelas")
    public ResponseEntity<List<Parcela>> listarParcelasPorStatus(
            @RequestParam String status,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        List<Parcela> parcelas =
                compraService.listarParcelasPorStatus(usuarioId, status);

        return ResponseEntity.ok(parcelas);
    }
   
    @PatchMapping("/parcelas/atualizar-atrasadas")
    public ResponseEntity<String> atualizarParcelasAtrasadas(
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        compraService.atualizarParcelasAtrasadas(usuarioId);

        return ResponseEntity.ok("Parcelas atrasadas atualizadas com sucesso");
    }

@PutMapping("/{id}")
public ResponseEntity<?> atualizar(
        @PathVariable Long id,
        @RequestBody CompraCartao compra,
        Authentication autenticacao) {

    try {
        Long usuarioId = obterUsuarioId(autenticacao);

        CompraCartao compraAtualizada =
                compraService.atualizar(id, compra, usuarioId);

        return ResponseEntity.ok(compraAtualizada);

    } catch (IllegalArgumentException
            | IllegalStateException e) {

        return ResponseEntity
                .badRequest()
                .body(java.util.Map.of("erro", e.getMessage()));
    }
}

@DeleteMapping("/{id}")
public ResponseEntity<?> excluir(
        @PathVariable Long id,
        Authentication autenticacao) {

    try {
        Long usuarioId = obterUsuarioId(autenticacao);

        compraService.excluir(id, usuarioId);

        return ResponseEntity.noContent().build();

    } catch (IllegalArgumentException
            | IllegalStateException e) {

        return ResponseEntity
                .badRequest()
                .body(java.util.Map.of("erro", e.getMessage()));
    }
}

    

}
