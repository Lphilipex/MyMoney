
package com.mymoney.repository;

import com.mymoney.model.Investimento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvestimentoRepository
        extends JpaRepository<Investimento, Long> {

    List<Investimento> findAllByUsuarioIdOrderByDataMovimentacaoDesc(
            Long usuarioId
    );

    Optional<Investimento> findByIdAndUsuarioId(
            Long id,
            Long usuarioId
    );
}
