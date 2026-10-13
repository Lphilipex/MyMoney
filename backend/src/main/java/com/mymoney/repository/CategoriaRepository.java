
package com.mymoney.repository;

import com.mymoney.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoriaRepository
        extends JpaRepository<Categoria, Long> {

    List<Categoria> findByUsuarioId(Long usuarioId);

    List<Categoria> findByUsuarioIdAndTipo(
            Long usuarioId, String tipo);
}
