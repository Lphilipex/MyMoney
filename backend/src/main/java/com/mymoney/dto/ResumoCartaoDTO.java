package com.mymoney.dto;

import java.math.BigDecimal;

public record ResumoCartaoDTO(
        Long cartaoId,
        String nomeCartao,
        BigDecimal totalCompras,
        BigDecimal totalPendente,
        BigDecimal totalPago,
        BigDecimal totalAtrasado
) {
}