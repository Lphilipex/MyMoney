package com.mymoney.dto;

import java.math.BigDecimal;

public record HistoricoEconomicoDTO(
    int mes,
    int ano,
    BigDecimal receitaRecebida,
    BigDecimal despesasPagas,
    BigDecimal economiaRealizada
) {}