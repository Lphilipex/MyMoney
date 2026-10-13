
package com.mymoney.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.mymoney.dto.AnaliseEconomicaDTO;
import com.mymoney.model.Despesa;
import com.mymoney.model.MetaEconomia;
import com.mymoney.model.Receita;
import com.mymoney.repository.DespesaRepository;
import com.mymoney.repository.ReceitaRepository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

import com.mymoney.dto.HistoricoEconomicoDTO;
import com.mymoney.dto.GastoCategoriaDTO;
import com.mymoney.model.Categoria;
import com.mymoney.repository.CategoriaRepository;

import java.util.HashMap;
import java.util.Comparator;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;



@Service
public class AnaliseEconomicaService {

    private final ReceitaRepository receitaRepository;
    private final DespesaRepository despesaRepository;
    private final MetaEconomiaService metaEconomiaService;

    public AnaliseEconomicaService(
            ReceitaRepository receitaRepository,
            DespesaRepository despesaRepository,
            MetaEconomiaService metaEconomiaService,
            CategoriaRepository categoriaRepository) {

        this.receitaRepository = receitaRepository;
        this.despesaRepository = despesaRepository;
        this.metaEconomiaService = metaEconomiaService;
        this.categoriaRepository = categoriaRepository;
    }

    public AnaliseEconomicaDTO analisar(
            Long usuarioId, int mes, int ano) {

        if (mes < 1 || mes > 12 || ano < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe um mês e ano válidos"
            );
        }

        YearMonth periodo = YearMonth.of(ano, mes);
        YearMonth periodoAnterior = periodo.minusMonths(1);

        MetaEconomia meta = metaEconomiaService.consultar(usuarioId);

        BigDecimal percentualMeta = meta == null
                ? null
                : meta.getPercentual();

        BigDecimal receitaAtual = somarReceitas(
                usuarioId, periodo);

        BigDecimal despesasAtual = somarDespesasPagas(
                usuarioId, periodo);

        BigDecimal economiaAtual = receitaAtual.subtract(
                despesasAtual);

        BigDecimal economiaProjetada = percentualMeta == null
                ? BigDecimal.ZERO
                : receitaAtual.multiply(percentualMeta)
                    .divide(new BigDecimal("100"), 2,
                            RoundingMode.HALF_UP);

        BigDecimal diferencaMeta = economiaAtual.subtract(
                economiaProjetada);

        BigDecimal percentualEconomizado =
                calcularPercentual(economiaAtual, receitaAtual);

        BigDecimal receitaAnterior = somarReceitas(
                usuarioId, periodoAnterior);

        BigDecimal despesasAnterior = somarDespesasPagas(
                usuarioId, periodoAnterior);

        BigDecimal economiaAnterior = receitaAnterior.subtract(
                despesasAnterior);

        return new AnaliseEconomicaDTO(
                mes,
                ano,
                percentualMeta,
                receitaAtual,
                despesasAtual,
                economiaProjetada,
                economiaAtual,
                diferencaMeta,
                percentualEconomizado,
                receitaAnterior,
                despesasAnterior,
                economiaAnterior
        );
    }
    public List<HistoricoEconomicoDTO> buscarHistorico(
            Long usuarioId, int mes, int ano) {

        if (mes < 1 || mes > 12 || ano < 1) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Informe um mês e ano válidos"
            );
        }

        YearMonth periodoFinal = YearMonth.of(ano, mes);
        List<HistoricoEconomicoDTO> historico = new ArrayList<>();

        for (int i = 11; i >= 0; i--) {
            YearMonth periodo = periodoFinal.minusMonths(i);

            BigDecimal receitas = somarReceitas(usuarioId, periodo);
            BigDecimal despesas = somarDespesasPagas(usuarioId, periodo);
            BigDecimal economia = receitas.subtract(despesas);

            historico.add(new HistoricoEconomicoDTO(
                periodo.getMonthValue(),
                periodo.getYear(),
                receitas,
                despesas,
                economia
            ));
        }

        return historico;
    }

public List<GastoCategoriaDTO> buscarGastosPorCategoria(
        Long usuarioId, int mes, int ano) {

    if (mes < 1 || mes > 12 || ano < 1) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Informe um mês e ano válidos"
        );
    }

    YearMonth periodo = YearMonth.of(ano, mes);

    List<Despesa> despesas =
        despesaRepository.findByUsuarioIdAndDataDespesaBetween(
            usuarioId,
            periodo.atDay(1),
            periodo.atEndOfMonth()
        );

    Map<Long, BigDecimal[]> totaisPorCategoria = new HashMap<>();

    for (Despesa despesa : despesas) {

        if (despesa.getCategoriaId() == null
                || despesa.getValor() == null) {
            continue;
        }

        String status = despesa.getStatus();

        if (!"PAGA".equals(status)
                && !"PENDENTE".equals(status)) {
            continue;
        }

        Long categoriaId = despesa.getCategoriaId();

        BigDecimal[] valores = totaisPorCategoria.computeIfAbsent(
            categoriaId,
            id -> new BigDecimal[] {
                BigDecimal.ZERO,
                BigDecimal.ZERO
            }
        );

        if ("PAGA".equals(status)) {
            valores[0] = valores[0].add(despesa.getValor());
        } else {
            valores[1] = valores[1].add(despesa.getValor());
        }
    }

    Map<Long, String> nomesCategorias =
        categoriaRepository.findByUsuarioIdAndTipo(
            usuarioId, "DESPESA"
        ).stream().collect(
            Collectors.toMap(
                Categoria::getId,
                Categoria::getNome
            )
        );

    return totaisPorCategoria.entrySet().stream()
        .map(item -> new GastoCategoriaDTO(
            item.getKey(),
            nomesCategorias.getOrDefault(
                item.getKey(), "Categoria não encontrada"
            ),
            item.getValue()[0],
            item.getValue()[1]
        ))
        .sorted((a, b) -> {
            BigDecimal totalA =
                a.totalPago().add(a.totalPendente());

            BigDecimal totalB =
                b.totalPago().add(b.totalPendente());

            return totalB.compareTo(totalA);
        })
        .collect(Collectors.toList());
}


    private BigDecimal somarReceitas(
            Long usuarioId, YearMonth periodo) {

        LocalDate inicio = periodo.atDay(1);
        LocalDate fim = periodo.atEndOfMonth();

        List<Receita> receitas =
                receitaRepository
                    .findByUsuarioIdAndDataRecebimentoBetween(
                            usuarioId, inicio, fim);

        return receitas.stream()
                .filter(receita ->
                        "RECEBIDA".equals(receita.getStatus()))
                .map(Receita::getValor)
                .filter(valor -> valor != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal somarDespesasPagas(
            Long usuarioId, YearMonth periodo) {

        LocalDate inicio = periodo.atDay(1);
        LocalDate fim = periodo.atEndOfMonth();

        List<Despesa> despesas =
                despesaRepository
                    .findByUsuarioIdAndDataDespesaBetween(
                            usuarioId, inicio, fim);

        return despesas.stream()
                .filter(despesa ->
                        "PAGA".equals(despesa.getStatus()))
                .map(Despesa::getValor)
                .filter(valor -> valor != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calcularPercentual(
            BigDecimal economia, BigDecimal receita) {

        if (receita.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO.setScale(2);
        }

        return economia.multiply(new BigDecimal("100"))
                .divide(receita, 2, RoundingMode.HALF_UP);
    }
    
    private final CategoriaRepository categoriaRepository;

    
}

