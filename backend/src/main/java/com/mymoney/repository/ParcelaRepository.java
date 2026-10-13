
package com.mymoney.repository;


import com.mymoney.model.Parcela;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParcelaRepository extends JpaRepository<Parcela, Long> {

    List<Parcela> findByCompraIdOrderByNumeroAsc(Long compraId);
    
    List<Parcela> findByCompraIdInAndStatus(
            List<Long> comprasIds, String status);

    Optional<Parcela> findByIdAndCompraId(Long id, Long compraId);

    List<Parcela> findByStatus(String status);

}
