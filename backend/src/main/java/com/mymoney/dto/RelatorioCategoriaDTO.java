
package com.mymoney.dto;

import java.math.BigDecimal;

public record RelatorioCategoriaDTO(
        Long categoriaId,
        String categoria,
        int quantidadeDespesas,
        BigDecimal total,
        BigDecimal pendente,
        BigDecimal pago,
        BigDecimal atrasado
) {
}
