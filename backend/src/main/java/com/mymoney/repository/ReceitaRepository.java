
package com.mymoney.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mymoney.model.Receita;

public interface ReceitaRepository extends JpaRepository<Receita, Long> {

    List<Receita> findByUsuarioId(Long usuarioId);

    Optional<Receita> findByIdAndUsuarioId(Long id, Long usuarioId);

    List<Receita> findByUsuarioIdAndDataRecebimentoBetween(
            Long usuarioId,
            LocalDate inicio,
            LocalDate fim
    );
}
