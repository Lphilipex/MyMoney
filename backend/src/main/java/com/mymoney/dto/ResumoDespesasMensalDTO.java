
package com.mymoney.dto;

import java.math.BigDecimal;

public record ResumoDespesasMensalDTO(
        int mes,
        int ano,
        int quantidadeDespesas,
        BigDecimal totalDespesas,
        BigDecimal totalFixas,
        BigDecimal totalVariadas,
        BigDecimal totalEmergencias,
        BigDecimal totalPendentes,
        BigDecimal totalPagas,
        BigDecimal totalAtrasadas
) {
}
