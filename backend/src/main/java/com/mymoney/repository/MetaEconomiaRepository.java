
package com.mymoney.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mymoney.model.MetaEconomia;

public interface MetaEconomiaRepository
        extends JpaRepository<MetaEconomia, Long> {

    Optional<MetaEconomia> findByUsuarioId(Long usuarioId);
}
