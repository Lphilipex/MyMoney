
package com.mymoney.model;

import java.math.BigDecimal;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(
    name = "metas_economia",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_meta_economia_usuario",
            columnNames = "usuario_id"
        )
    }
)
public class MetaEconomia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @NotNull(message = "O percentual da meta é obrigatório")
    @DecimalMin(value = "0.00", message = "A meta não pode ser menor que 0%")
    @DecimalMax(value = "100.00", message = "A meta não pode ser maior que 100%")
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal percentual;

    public MetaEconomia() {
    }

    public Long getId() {
        return id;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public BigDecimal getPercentual() {
        return percentual;
    }

    public void setPercentual(BigDecimal percentual) {
        this.percentual = percentual;
    }
}
