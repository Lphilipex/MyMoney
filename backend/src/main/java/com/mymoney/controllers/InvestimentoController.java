
package com.mymoney.controllers;

import com.mymoney.model.Investimento;
import com.mymoney.model.Usuario;
import com.mymoney.repository.InvestimentoRepository;
import com.mymoney.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/investimentos")
@CrossOrigin(origins = "*")
public class InvestimentoController {

    private final InvestimentoRepository repository;
    private final UsuarioRepository usuarioRepository;

    public InvestimentoController(
            InvestimentoRepository repository,
            UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
    }

    // Identifica o usuário autenticado pelo token JWT
    private Long obterUsuarioId(Authentication autenticacao) {

        if (autenticacao == null
                || !autenticacao.isAuthenticated()
                || autenticacao.getName() == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Usuário não autenticado."
            );
        }

        Usuario usuario = usuarioRepository
                .findByEmail(autenticacao.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Usuário autenticado não encontrado."
                ));

        return usuario.getId();
    }

    // Listar somente os investimentos do usuário autenticado
    @GetMapping
    public List<Investimento> listar(
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        return repository
                .findAllByUsuarioIdOrderByDataMovimentacaoDesc(
                        usuarioId
                );
    }

    // Buscar investimento pertencente ao usuário autenticado
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(
            @PathVariable Long id,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        return repository.findByIdAndUsuarioId(id, usuarioId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Cadastrar investimento para o usuário autenticado
    @PostMapping
    public ResponseEntity<?> cadastrar(
            @RequestBody Investimento investimento,
            Authentication autenticacao) {

        if (investimento.getNome() == null
                || investimento.getNome().isBlank()
                || investimento.getTipo() == null
                || investimento.getTipo().isBlank()
                || investimento.getOperacao() == null
                || investimento.getValor() == null
                || investimento.getValor().compareTo(
                        BigDecimal.ZERO) <= 0
                || investimento.getDataMovimentacao() == null) {

            return ResponseEntity.badRequest().body(
                    Map.of("erro",
                            "Preencha os campos obrigatórios "
                                    + "com valores válidos.")
            );
        }

        String operacao = investimento.getOperacao()
                .trim().toUpperCase();

        if (!operacao.equals("APORTE")
                && !operacao.equals("RETIRADA")) {

            return ResponseEntity.badRequest().body(
                    Map.of("erro",
                            "A operação deve ser APORTE ou RETIRADA.")
            );
        }

        investimento.setUsuarioId(obterUsuarioId(autenticacao));
        investimento.setNome(investimento.getNome().trim());
        investimento.setTipo(
                investimento.getTipo().trim().toUpperCase());
        investimento.setOperacao(operacao);

        Investimento salvo = repository.save(investimento);

        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    // Atualizar somente um investimento do usuário autenticado
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(
            @PathVariable Long id,
            @RequestBody Investimento dados,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        return repository.findByIdAndUsuarioId(id, usuarioId)
                .<ResponseEntity<?>>map(investimento -> {

                    if (dados.getNome() == null
                            || dados.getNome().isBlank()
                            || dados.getTipo() == null
                            || dados.getTipo().isBlank()
                            || dados.getOperacao() == null
                            || dados.getValor() == null
                            || dados.getValor().compareTo(
                                    BigDecimal.ZERO) <= 0
                            || dados.getDataMovimentacao() == null) {

                        return ResponseEntity.badRequest().body(
                                Map.of("erro",
                                        "Verifique os dados enviados.")
                        );
                    }

                    String operacao = dados.getOperacao()
                            .trim().toUpperCase();

                    if (!operacao.equals("APORTE")
                            && !operacao.equals("RETIRADA")) {

                        return ResponseEntity.badRequest().body(
                                Map.of("erro", "Operação inválida.")
                        );
                    }

                    investimento.setNome(dados.getNome().trim());
                    investimento.setTipo(
                            dados.getTipo().trim().toUpperCase());
                    investimento.setOperacao(operacao);
                    investimento.setValor(dados.getValor());
                    investimento.setDataMovimentacao(
                            dados.getDataMovimentacao());
                    investimento.setInstituicao(
                            dados.getInstituicao());
                    investimento.setObservacao(
                            dados.getObservacao());

                    // Não altera o proprietário do registro
                    investimento.setUsuarioId(usuarioId);

                    return ResponseEntity.ok(
                            repository.save(investimento)
                    );
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Excluir somente um investimento do usuário autenticado
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id,
            Authentication autenticacao) {

        Long usuarioId = obterUsuarioId(autenticacao);

        return repository.findByIdAndUsuarioId(id, usuarioId)
                .map(investimento -> {
                    repository.delete(investimento);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() ->
                        ResponseEntity.notFound().build());
    }
}


