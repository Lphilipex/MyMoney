package com.mymoney.dto;

import java.math.BigDecimal;

public record ResumoFinanceiroIntegradoDTO(
        int mes,
        int ano,
        ResumoDespesasMensalDTO despesas,
        BigDecimal totalReceitas,
        BigDecimal totalReceitasRecebidas,
        BigDecimal totalReceitasPrevistas,
        BigDecimal totalParcelasCartao,
        BigDecimal parcelasPendentes,
        BigDecimal parcelasPagas,
        BigDecimal parcelasAtrasadas,
        BigDecimal totalCompromissos,
        BigDecimal totalEmAberto,
        BigDecimal saldoMensal
) {
}