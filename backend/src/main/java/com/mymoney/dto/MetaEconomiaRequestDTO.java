
package com.mymoney.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record MetaEconomiaRequestDTO(

    @NotNull(message = "O percentual da meta é obrigatório")
    @DecimalMin(value = "0.00", message = "A meta mínima é 0%")
    @DecimalMax(value = "100.00", message = "A meta máxima é 100%")
    BigDecimal percentual

) {}
