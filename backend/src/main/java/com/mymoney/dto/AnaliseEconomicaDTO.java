
package com.mymoney.dto;

import java.math.BigDecimal;

public record AnaliseEconomicaDTO(
        int mes,
        int ano,
        BigDecimal percentualMeta,
        BigDecimal receitaRecebida,
        BigDecimal despesasPagas,
        BigDecimal economiaProjetada,
        BigDecimal economiaRealizada,
        BigDecimal diferencaMeta,
        BigDecimal percentualEconomizado,
        BigDecimal receitaRecebidaMesAnterior,
        BigDecimal despesasPagasMesAnterior,
        BigDecimal economiaRealizadaMesAnterior
) {}
