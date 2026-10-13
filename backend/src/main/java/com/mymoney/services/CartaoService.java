
package com.mymoney.services;

import com.mymoney.model.Cartao;
import com.mymoney.repository.CartaoRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CartaoService {

    private final CartaoRepository repository;

    public CartaoService(CartaoRepository repository) {
        this.repository = repository;
    }

    public List<Cartao> listar(Long usuarioId) {
        return repository.findByUsuarioId(usuarioId);
    }

    public Cartao buscarPorId(Long id, Long usuarioId) {
        return repository.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cartão não encontrado"
                ));
    }

    public Cartao cadastrar(Cartao cartao, Long usuarioId) {
        validarCartao(cartao);

        cartao.setUsuarioId(usuarioId);
        cartao.setAtivo(true);

        return repository.save(cartao);
    }

    public Cartao atualizar(Long id, Cartao dados, Long usuarioId) {
        validarCartao(dados);

        Cartao cartao = buscarPorId(id, usuarioId);

        cartao.setNome(dados.getNome());
        cartao.setBanco(dados.getBanco());
    
        cartao.setLimite(dados.getLimite());
        cartao.setDiaFechamento(dados.getDiaFechamento());
        cartao.setDiaVencimento(dados.getDiaVencimento());

        return repository.save(cartao);
    }

    public void excluir(Long id, Long usuarioId) {
        Cartao cartao = buscarPorId(id, usuarioId);
        repository.delete(cartao);
    }

    private void validarCartao(Cartao cartao) {
        if (cartao.getNome() == null || cartao.getNome().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O nome do cartão é obrigatório"
            );
        }

        if (cartao.getBanco() == null || cartao.getBanco().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O banco é obrigatório"
            );
        }

        if (cartao.getLimite() != null
                && cartao.getLimite().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O limite deve ser maior que zero"
            );
        }

       

        validarDia(cartao.getDiaFechamento(), "fechamento");
        validarDia(cartao.getDiaVencimento(), "vencimento");
    }

    private void validarDia(Short dia, String tipo) {
        if (dia != null && (dia < 1 || dia > 31)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O dia de " + tipo + " deve estar entre 1 e 31"
            );
        }
    }
}