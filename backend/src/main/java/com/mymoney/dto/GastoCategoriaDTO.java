
package com.mymoney.dto;

import java.math.BigDecimal;

public record GastoCategoriaDTO(
    Long categoriaId,
    String categoria,
    BigDecimal totalPago,
    BigDecimal totalPendente
) {}
