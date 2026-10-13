
package com.mymoney.services;

import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.mymoney.model.MetaEconomia;
import com.mymoney.repository.MetaEconomiaRepository;

@Service
public class MetaEconomiaService {

    private final MetaEconomiaRepository metaRepository;

    public MetaEconomiaService(
            MetaEconomiaRepository metaRepository) {
        this.metaRepository = metaRepository;
    }

    public MetaEconomia consultar(Long usuarioId) {
        return metaRepository.findByUsuarioId(usuarioId)
                .orElse(null);
    }

    public MetaEconomia salvar(
            BigDecimal percentual,
            Long usuarioId) {

        if (percentual == null
                || percentual.compareTo(BigDecimal.ZERO) < 0
                || percentual.compareTo(new BigDecimal("100")) > 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A meta deve estar entre 0% e 100%"
            );
        }

        MetaEconomia meta = metaRepository
                .findByUsuarioId(usuarioId)
                .orElseGet(MetaEconomia::new);

        meta.setUsuarioId(usuarioId);
        meta.setPercentual(percentual);

        return metaRepository.save(meta);
    }
}
