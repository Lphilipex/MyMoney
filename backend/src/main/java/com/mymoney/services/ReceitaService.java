
package com.mymoney.services;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.mymoney.model.Categoria;
import com.mymoney.model.Receita;
import com.mymoney.repository.CategoriaRepository;
import com.mymoney.repository.ReceitaRepository;

@Service
public class ReceitaService {

    private final ReceitaRepository receitaRepository;
    private final CategoriaRepository categoriaRepository;

    public ReceitaService(
            ReceitaRepository receitaRepository,
            CategoriaRepository categoriaRepository) {

        this.receitaRepository = receitaRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public Receita cadastrar(Receita receita, Long usuarioId) {

        receita.setUsuarioId(usuarioId);

        Categoria categoria = categoriaRepository
                .findById(receita.getCategoriaId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Categoria não encontrada"
                ));

        if (!categoria.getUsuarioId().equals(usuarioId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Esta categoria não pertence ao usuário"
            );
        }

        if (!"RECEITA".equals(categoria.getTipo())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A categoria precisa ser do tipo RECEITA"
            );
        }

        return receitaRepository.save(receita);
    }

    public List<Receita> listar(Long usuarioId) {
        return receitaRepository.findByUsuarioId(usuarioId);
    }

    public Receita buscarPorId(Long id, Long usuarioId) {

        return receitaRepository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Receita não encontrada"
                ));
    }

    public void excluir(Long id, Long usuarioId) {

        Receita receita = buscarPorId(id, usuarioId);

        receitaRepository.delete(receita);
    }

public Receita atualizar(Long id, Receita dados, Long usuarioId) {
    Receita receita = buscarPorId(id, usuarioId);

    Categoria categoria = categoriaRepository.findById(dados.getCategoriaId())
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "Categoria não encontrada"));

    if (!categoria.getUsuarioId().equals(usuarioId)) {
        throw new ResponseStatusException(
            HttpStatus.FORBIDDEN, "Esta categoria não pertence ao usuário");
    }

    if (!"RECEITA".equals(categoria.getTipo())) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST, "A categoria precisa ser do tipo RECEITA");
    }

    receita.setCategoriaId(dados.getCategoriaId());
    receita.setDescricao(dados.getDescricao());
    receita.setValor(dados.getValor());
    receita.setDataRecebimento(dados.getDataRecebimento());
    receita.setStatus(dados.getStatus());

    return receitaRepository.save(receita);
}
}

