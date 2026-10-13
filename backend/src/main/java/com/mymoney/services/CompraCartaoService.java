
package com.mymoney.services;

import com.mymoney.model.Cartao;
import com.mymoney.model.CompraCartao;
import com.mymoney.model.Parcela;
import com.mymoney.repository.CartaoRepository;
import com.mymoney.repository.CompraCartaoRepository;
import com.mymoney.repository.ParcelaRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

import com.mymoney.dto.ResumoCartaoDTO;
import com.mymoney.dto.ResumoFinanceiroDTO;


import java.math.BigDecimal;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;


@Service
public class CompraCartaoService {

    private final CompraCartaoRepository compraRepository;
    private final ParcelaRepository parcelaRepository;
    private final CartaoRepository cartaoRepository;

    public CompraCartaoService(
            CompraCartaoRepository compraRepository,
            ParcelaRepository parcelaRepository,
            CartaoRepository cartaoRepository) {

        this.compraRepository = compraRepository;
        this.parcelaRepository = parcelaRepository;
        this.cartaoRepository = cartaoRepository;
    }

    @Transactional
    public CompraCartao cadastrar(CompraCartao compra, Long usuarioId) {

        if (compra.getCartaoId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Informe o cartão da compra");
        }

        Cartao cartao = cartaoRepository
                .findByIdAndUsuarioId(compra.getCartaoId(), usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Cartão não encontrado"));

        if (!Boolean.TRUE.equals(cartao.getAtivo())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "O cartão está inativo");
        }

        if (compra.getDescricao() == null
                || compra.getDescricao().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "A descrição é obrigatória");
        }

        if (compra.getValorTotal() == null
                || compra.getValorTotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "O valor deve ser maior que zero");
        }

        if (compra.getQuantidadeParcelas() == null
                || compra.getQuantidadeParcelas() < 1
                || compra.getQuantidadeParcelas() > 120) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A quantidade de parcelas deve ser de 1 a 120");
        }

        if (compra.getDataCompra() == null) {
            compra.setDataCompra(LocalDate.now());
        }

        // O usuário é definido pelo token, nunca pelo JSON enviado.
        compra.setUsuarioId(usuarioId);

        CompraCartao compraSalva = compraRepository.save(compra);

        gerarParcelas(compraSalva, cartao);

        return compraSalva;
    }
  
    @Transactional
    public Parcela marcarComoPaga(Long compraId, Long parcelaId, Long usuarioId) {

        // Verifica se a compra pertence ao usuário
        compraRepository.findByIdAndUsuarioId(compraId, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Compra não encontrada"));

        // Busca a parcela dentro da compra
        Parcela parcela = parcelaRepository.findByIdAndCompraId(parcelaId, compraId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Parcela não encontrada"));

        // Impede pagar novamente uma parcela já paga
        if ("PAGA".equals(parcela.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Esta parcela já está paga");
        }

        parcela.setStatus("PAGA");
        parcela.setDataPagamento(LocalDate.now());

        return parcelaRepository.save(parcela);
    }
    
   
    @Transactional
    public void atualizarParcelasAtrasadas(Long usuarioId) {

        List<CompraCartao> compras = compraRepository.findByUsuarioId(usuarioId);

        LocalDate hoje = LocalDate.now();

        for (CompraCartao compra : compras) {

            List<Parcela> parcelas =
                    parcelaRepository.findByCompraIdOrderByNumeroAsc(compra.getId());

            for (Parcela parcela : parcelas) {

                if (!"PAGA".equals(parcela.getStatus())
                        && parcela.getDataVencimento().isBefore(hoje)) {

                    parcela.setStatus("ATRASADA");
                    parcelaRepository.save(parcela);

                } else if ("ATRASADA".equals(parcela.getStatus())
                        && !parcela.getDataVencimento().isBefore(hoje)) {

                    parcela.setStatus("PENDENTE");
                    parcelaRepository.save(parcela);

                }
            }
        }
    }
    

 


    private void gerarParcelas(CompraCartao compra, Cartao cartao) {

        int quantidade = compra.getQuantidadeParcelas();

        BigDecimal valorTotal = compra.getValorTotal()
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal valorParcela = valorTotal.divide(
                BigDecimal.valueOf(quantidade),
                2,
                RoundingMode.DOWN
        );

        BigDecimal somaParcelas = BigDecimal.ZERO;
        LocalDate primeiroVencimento =
                calcularPrimeiroVencimento(compra, cartao);

        List<Parcela> parcelas = new ArrayList<>();

        for (int i = 1; i <= quantidade; i++) {

            Parcela parcela = new Parcela();

            parcela.setCompraId(compra.getId());
            parcela.setNumero(i);

            BigDecimal valor;

            if (i == quantidade) {
                // A última parcela corrige a diferença de centavos.
                valor = valorTotal.subtract(somaParcelas);
            } else {
                valor = valorParcela;
                somaParcelas = somaParcelas.add(valor);
            }

            parcela.setValor(valor);

            parcela.setDataVencimento(
                    primeiroVencimento.plusMonths(i - 1)
            );

            parcela.setStatus("PENDENTE");

            parcelas.add(parcela);
        }

        parcelaRepository.saveAll(parcelas);
    }

    private LocalDate calcularPrimeiroVencimento(
            CompraCartao compra, Cartao cartao) {

        LocalDate dataCompra = compra.getDataCompra();

        Short diaFechamento = cartao.getDiaFechamento();
        Short diaVencimento = cartao.getDiaVencimento();

        if (diaVencimento == null) {
            return dataCompra.plusMonths(1);
        }

        YearMonth mesCompra = YearMonth.from(dataCompra);

        LocalDate vencimento = mesCompra.atDay(
                Math.min(diaVencimento, mesCompra.lengthOfMonth())
        );

        boolean antesOuNoFechamento =
                diaFechamento != null
                && dataCompra.getDayOfMonth() <= diaFechamento;

        if (antesOuNoFechamento && !vencimento.isBefore(dataCompra)) {
            return vencimento;
        }

        YearMonth proximoMes = mesCompra.plusMonths(1);

        return proximoMes.atDay(
                Math.min(diaVencimento, proximoMes.lengthOfMonth())
        );
    }

    public List<CompraCartao> listar(Long usuarioId) {
        return compraRepository.findByUsuarioId(usuarioId);
    }

    public List<Parcela> listarParcelas(
            Long compraId, Long usuarioId) {

        compraRepository.findByIdAndUsuarioId(compraId, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Compra não encontrada"));

        return parcelaRepository
                .findByCompraIdOrderByNumeroAsc(compraId);
    }
    public List<Parcela> listarParcelasPorStatus(
            Long usuarioId, String status) {

        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe o status da parcela");
        }

        String statusNormalizado = status.toUpperCase();

        if (!List.of("PENDENTE", "PAGA", "ATRASADA")
                .contains(statusNormalizado)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status inválido. Use PENDENTE, PAGA ou ATRASADA");
        }

        List<CompraCartao> compras =
                compraRepository.findByUsuarioId(usuarioId);

        List<Long> comprasIds = new ArrayList<>();

        for (CompraCartao compra : compras) {
            comprasIds.add(compra.getId());
        }

        if (comprasIds.isEmpty()) {
            return new ArrayList<>();
        }

        return parcelaRepository.findByCompraIdInAndStatus(
                comprasIds, statusNormalizado);
    }

public ResumoFinanceiroDTO gerarResumoFinanceiro(Long usuarioId) {

    List<Cartao> cartoes = cartaoRepository.findByUsuarioId(usuarioId);

    BigDecimal totalComprasGeral = BigDecimal.ZERO;
    BigDecimal totalPendenteGeral = BigDecimal.ZERO;
    BigDecimal totalPagoGeral = BigDecimal.ZERO;
    BigDecimal totalAtrasadoGeral = BigDecimal.ZERO;

    List<ResumoCartaoDTO> resumoCartoes = new ArrayList<>();

    for (Cartao cartao : cartoes) {

        BigDecimal totalCompras = BigDecimal.ZERO;
        BigDecimal totalPendente = BigDecimal.ZERO;
        BigDecimal totalPago = BigDecimal.ZERO;
        BigDecimal totalAtrasado = BigDecimal.ZERO;

        List<CompraCartao> compras =
                compraRepository.findByCartaoIdAndUsuarioId(
                        cartao.getId(), usuarioId
                );

        for (CompraCartao compra : compras) {

            // Soma o valor total de cada compra apenas uma vez.
            totalCompras = totalCompras.add(compra.getValorTotal());

            List<Parcela> parcelas =
                    parcelaRepository.findByCompraIdOrderByNumeroAsc(
                            compra.getId()
                    );

            for (Parcela parcela : parcelas) {

                if (parcela.getValor() == null
                        || parcela.getStatus() == null) {
                    continue;
                }

                String status = parcela.getStatus().toUpperCase();

                if (status.equals("PENDENTE")) {
                    totalPendente =
                            totalPendente.add(parcela.getValor());

                } else if (status.equals("PAGA")) {
                    totalPago = totalPago.add(parcela.getValor());

                } else if (status.equals("ATRASADA")) {
                    totalAtrasado =
                            totalAtrasado.add(parcela.getValor());
                }
            }
        }

        ResumoCartaoDTO resumoCartao = new ResumoCartaoDTO(
                cartao.getId(),
                cartao.getNome(),
                totalCompras,
                totalPendente,
                totalPago,
                totalAtrasado
        );

        resumoCartoes.add(resumoCartao);

        totalComprasGeral = totalComprasGeral.add(totalCompras);
        totalPendenteGeral = totalPendenteGeral.add(totalPendente);
        totalPagoGeral = totalPagoGeral.add(totalPago);
        totalAtrasadoGeral = totalAtrasadoGeral.add(totalAtrasado);
    }

    return new ResumoFinanceiroDTO(
            totalComprasGeral,
            totalPendenteGeral,
            totalPagoGeral,
            totalAtrasadoGeral,
            resumoCartoes
    );
}

@Transactional
public CompraCartao atualizar(
        Long id,
        CompraCartao dados,
        Long usuarioId) {

    CompraCartao compra = compraRepository
            .findByIdAndUsuarioId(id, usuarioId)
            .orElseThrow(() ->
                    new IllegalArgumentException(
                            "Compra não encontrada."));

    // Valida os dados recebidos.
    if (dados.getCartaoId() == null) {
        throw new IllegalArgumentException(
                "Selecione um cartão.");
    }

    if (dados.getDescricao() == null
            || dados.getDescricao().isBlank()) {
        throw new IllegalArgumentException(
                "Informe a descrição da compra.");
    }

    if (dados.getValorTotal() == null
            || dados.getValorTotal().compareTo(BigDecimal.ZERO) <= 0) {
        throw new IllegalArgumentException(
                "O valor deve ser maior que zero.");
    }

    if (dados.getQuantidadeParcelas() == null
            || dados.getQuantidadeParcelas() < 1
            || dados.getQuantidadeParcelas() > 120) {
        throw new IllegalArgumentException(
                "A quantidade de parcelas deve estar entre 1 e 120.");
    }

    if (dados.getDataCompra() == null) {
        throw new IllegalArgumentException(
                "Informe a data da compra.");
    }

    // Confere se o cartão pertence ao usuário.
    Cartao cartao = cartaoRepository
            .findByIdAndUsuarioId(
                    dados.getCartaoId(), usuarioId)
            .orElseThrow(() ->
                    new IllegalArgumentException(
                            "Cartão não encontrado."));

    if (!cartao.getAtivo()) {
        throw new IllegalArgumentException(
                "Não é possível usar um cartão inativo.");
    }

    List<Parcela> parcelas =
            parcelaRepository.findByCompraIdOrderByNumeroAsc(id);

    boolean possuiParcelaPaga = parcelas.stream()
            .anyMatch(p -> "PAGA".equalsIgnoreCase(p.getStatus()));

    // Se houver pagamento, não altera valores nem estrutura.
    if (possuiParcelaPaga) {
        boolean alterouEstrutura =
                !compra.getCartaoId().equals(dados.getCartaoId())
                || !compra.getDataCompra().equals(dados.getDataCompra())
                || !compra.getQuantidadeParcelas()
                        .equals(dados.getQuantidadeParcelas())
                || compra.getValorTotal().compareTo(
                        dados.getValorTotal()) != 0;

        if (alterouEstrutura) {
            throw new IllegalStateException(
                    "Esta compra possui parcelas pagas. "
                    + "Altere apenas a descrição, categoria "
                    + "ou observação.");
        }
    }

    // Atualiza os dados da compra.
    compra.setDescricao(dados.getDescricao().trim());
    compra.setCategoriaId(dados.getCategoriaId());
    compra.setObservacao(dados.getObservacao());

    if (!possuiParcelaPaga) {
        compra.setCartaoId(dados.getCartaoId());
        compra.setDataCompra(dados.getDataCompra());
        compra.setValorTotal(dados.getValorTotal());
        compra.setQuantidadeParcelas(
                dados.getQuantidadeParcelas());

        // Recria as parcelas somente se nenhuma estiver paga.
        parcelaRepository.deleteAll(parcelas);
        parcelaRepository.flush();
    }

    return compraRepository.save(compra);
}

@Transactional
public void excluir(Long id, Long usuarioId) {

    CompraCartao compra = compraRepository
            .findByIdAndUsuarioId(id, usuarioId)
            .orElseThrow(() ->
                    new IllegalArgumentException(
                            "Compra não encontrada."));

    List<Parcela> parcelas =
            parcelaRepository.findByCompraIdOrderByNumeroAsc(id);

    boolean possuiParcelaPaga = parcelas.stream()
            .anyMatch(p -> "PAGA".equalsIgnoreCase(p.getStatus()));

    if (possuiParcelaPaga) {
        throw new IllegalStateException(
                "Não é possível excluir uma compra "
                + "que possui parcelas pagas.");
    }

    // Exclui primeiro as parcelas e depois a compra.
    parcelaRepository.deleteAll(parcelas);
    parcelaRepository.flush();

    compraRepository.delete(compra);
}



}

   
    

