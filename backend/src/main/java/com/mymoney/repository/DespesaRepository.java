
package com.mymoney.repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;


import org.springframework.data.jpa.repository.JpaRepository;

import com.mymoney.model.Despesa;

public interface DespesaRepository extends JpaRepository<Despesa, Long> {

    // Lista todas as despesas de um usuário
    List<Despesa> findByUsuarioId(Long usuarioId);

    // Busca uma despesa específica de um usuário
    Optional<Despesa> findByIdAndUsuarioId(Long id, Long usuarioId);

    // Lista as despesas de um usuário por tipo
    List<Despesa> findByUsuarioIdAndTipoDespesa(
        Long usuarioId,
        String tipoDespesa
    );

    // Lista as despesas de um usuário por status
    List<Despesa> findByUsuarioIdAndStatus(
        Long usuarioId,
        String status
    );
 // Dentro da interface DespesaRepository:
    List<Despesa> findByUsuarioIdAndDataDespesaBetween(
            Long usuarioId,
            LocalDate inicio,
            LocalDate fim
    );
}