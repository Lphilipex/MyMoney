
package com.mymoney.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "despesas")
public class Despesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "categoria_id")
    private Long categoriaId;

    @NotBlank(message = "A descrição é obrigatória")
    @Size(max = 200, message = "A descrição deve ter no máximo 200 caracteres")
    @Column(nullable = false, length = 200)
    private String descricao;

    @NotNull(message = "O valor é obrigatório")
    @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @NotBlank(message = "O tipo da despesa é obrigatório")
    @Pattern(
        regexp = "FIXA|VARIADA|EMERGENCIA",
        message = "O tipo deve ser FIXA, VARIADA ou EMERGENCIA"
    )
    @Column(name = "tipo_despesa", nullable = false, length = 20)
    private String tipoDespesa;

    @NotNull(message = "A data da despesa é obrigatória")
    @Column(name = "data_despesa", nullable = false)
    private LocalDate dataDespesa;

    @Column(name = "data_vencimento")
    private LocalDate dataVencimento;

    @NotBlank(message = "O status é obrigatório")
    @Pattern(
        regexp = "PENDENTE|PAGA|ATRASADA",
        message = "O status deve ser PENDENTE, PAGA ou ATRASADA"
    )
    @Column(nullable = false, length = 20)
    private String status = "PENDENTE";

    @NotNull(message = "Informe se a despesa é recorrente")
    @Column(nullable = false)
    private Boolean recorrente = false;

    @Size(max = 500, message = "A observação deve ter no máximo 500 caracteres")
    @Column(length = 500)
    private String observacao;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    public Despesa() {
    }

    @PrePersist
    public void prepararCadastro() {
        if (dataCriacao == null) {
            dataCriacao = LocalDateTime.now();
        }

        if (status == null) {
            status = "PENDENTE";
        }

        if (recorrente == null) {
            recorrente = false;
        }
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

    public Long getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(Long categoriaId) {
        this.categoriaId = categoriaId;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public String getTipoDespesa() {
        return tipoDespesa;
    }

    public void setTipoDespesa(String tipoDespesa) {
        this.tipoDespesa = tipoDespesa;
    }

    public LocalDate getDataDespesa() {
        return dataDespesa;
    }

    public void setDataDespesa(LocalDate dataDespesa) {
        this.dataDespesa = dataDespesa;
    }

    public LocalDate getDataVencimento() {
        return dataVencimento;
    }

    public void setDataVencimento(LocalDate dataVencimento) {
        this.dataVencimento = dataVencimento;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getRecorrente() {
        return recorrente;
    }

    public void setRecorrente(Boolean recorrente) {
        this.recorrente = recorrente;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }
    
    
}