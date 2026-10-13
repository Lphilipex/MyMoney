
package com.mymoney.services;

import com.mymoney.dto.ResumoDespesasMensalDTO;
import com.mymoney.dto.ResumoFinanceiroIntegradoDTO;
import com.mymoney.model.CompraCartao;
import com.mymoney.model.Parcela;
import com.mymoney.model.Receita;
import com.mymoney.repository.CompraCartaoRepository;
import com.mymoney.repository.ParcelaRepository;
import com.mymoney.repository.ReceitaRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class FinanceiroService {

    private final DespesaService despesaService;
    private final CompraCartaoRepository compraRepository;
    private final ParcelaRepository parcelaRepository;
    private final ReceitaRepository receitaRepository;

    public FinanceiroService(
            DespesaService despesaService,
            CompraCartaoRepository compraRepository,
            ParcelaRepository parcelaRepository,
            ReceitaRepository receitaRepository) {

        this.despesaService = despesaService;
        this.compraRepository = compraRepository;
        this.parcelaRepository = parcelaRepository;
        this.receitaRepository = receitaRepository;
    }

    public ResumoFinanceiroIntegradoDTO resumoMensal(
            Long usuarioId, int mes, int ano) {

        if (mes < 1 || mes > 12 || ano < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe um mês entre 1 e 12 e um ano válido"
            );
        }

        YearMonth periodo = YearMonth.of(ano, mes);

        LocalDate inicio = periodo.atDay(1);
        LocalDate fim = periodo.atEndOfMonth();

        ResumoDespesasMensalDTO despesas =
                despesaService.resumoMensal(usuarioId, mes, ano);

        // Busca as receitas do usuário no mês selecionado.
        List<Receita> receitas =
                receitaRepository
                        .findByUsuarioIdAndDataRecebimentoBetween(
                                usuarioId, inicio, fim
                        );

        BigDecimal totalReceitas = BigDecimal.ZERO;
        BigDecimal totalReceitasRecebidas = BigDecimal.ZERO;
        BigDecimal totalReceitasPrevistas = BigDecimal.ZERO;

        for (Receita receita : receitas) {

            BigDecimal valor = receita.getValor();

            if (valor == null) {
                continue;
            }

            // Soma todas as receitas previstas e recebidas.
            totalReceitas = totalReceitas.add(valor);

            String status = receita.getStatus();

            if ("RECEBIDA".equalsIgnoreCase(status)) {
                totalReceitasRecebidas =
                        totalReceitasRecebidas.add(valor);

            } else if ("PREVISTA".equalsIgnoreCase(status)) {
                totalReceitasPrevistas =
                        totalReceitasPrevistas.add(valor);
            }
        }

        List<CompraCartao> compras =
                compraRepository.findByUsuarioId(usuarioId);

        BigDecimal totalParcelas = BigDecimal.ZERO;
        BigDecimal parcelasPendentes = BigDecimal.ZERO;
        BigDecimal parcelasPagas = BigDecimal.ZERO;
        BigDecimal parcelasAtrasadas = BigDecimal.ZERO;

        for (CompraCartao compra : compras) {

            List<Parcela> parcelas =
                    parcelaRepository.findByCompraIdOrderByNumeroAsc(
                            compra.getId()
                    );

            for (Parcela parcela : parcelas) {

                LocalDate vencimento = parcela.getDataVencimento();

                if (vencimento == null
                        || vencimento.isBefore(inicio)
                        || vencimento.isAfter(fim)) {
                    continue;
                }

                BigDecimal valor = parcela.getValor();

                if (valor == null) {
                    continue;
                }

                totalParcelas = totalParcelas.add(valor);

                String status = parcela.getStatus();

                if ("PENDENTE".equalsIgnoreCase(status)) {
                    parcelasPendentes =
                            parcelasPendentes.add(valor);

                } else if ("PAGA".equalsIgnoreCase(status)) {
                    parcelasPagas =
                            parcelasPagas.add(valor);

                } else if ("ATRASADA".equalsIgnoreCase(status)) {
                    parcelasAtrasadas =
                            parcelasAtrasadas.add(valor);
                }
            }
        }

        // Despesas comuns mais parcelas dos cartões.
        BigDecimal totalCompromissos =
                despesas.totalDespesas().add(totalParcelas);

        // Despesas comuns ainda em aberto.
        BigDecimal despesasEmAberto =
                despesas.totalPendentes()
                        .add(despesas.totalAtrasadas());

        // Tudo que ainda falta pagar, incluindo cartões.
        BigDecimal totalEmAberto =
                despesasEmAberto
                        .add(parcelasPendentes)
                        .add(parcelasAtrasadas);

        // Saldo previsto: receitas do mês menos compromissos.
        BigDecimal saldoMensal =
                totalReceitas.subtract(totalCompromissos);

        return new ResumoFinanceiroIntegradoDTO(
                mes,
                ano,
                despesas,
                totalReceitas,
                totalReceitasRecebidas,
                totalReceitasPrevistas,
                totalParcelas,
                parcelasPendentes,
                parcelasPagas,
                parcelasAtrasadas,
                totalCompromissos,
                totalEmAberto,
                saldoMensal
        );
    }
}
