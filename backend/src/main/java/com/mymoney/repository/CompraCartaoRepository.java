
package com.mymoney.repository;

import com.mymoney.model.CompraCartao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompraCartaoRepository
        extends JpaRepository<CompraCartao, Long> {

    List<CompraCartao> findByUsuarioId(Long usuarioId);

    Optional<CompraCartao> findByIdAndUsuarioId(
            Long id, Long usuarioId);

    List<CompraCartao> findByCartaoIdAndUsuarioId(
            Long cartaoId, Long usuarioId);
}

