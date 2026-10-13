
package com.mymoney.dto;

import java.math.BigDecimal;
import java.util.List;

public record RelatorioCategoriasMensalDTO(
        int mes,
        int ano,
        int quantidadeDespesas,
        BigDecimal totalGeral,
        List<RelatorioCategoriaDTO> categorias
) {
}
