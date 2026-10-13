package com.mymoney.dto;

import java.math.BigDecimal;
import java.util.List;

public record ResumoFinanceiroDTO(
        BigDecimal totalCompras,
        BigDecimal totalPendente,
        BigDecimal totalPago,
        BigDecimal totalAtrasado,
        List<ResumoCartaoDTO> cartoes
) {
}