
package com.mymoney.services;

import com.mymoney.dto.RelatorioCategoriaDTO;
import com.mymoney.dto.RelatorioCategoriasMensalDTO;
import com.mymoney.model.Categoria;
import com.mymoney.model.Despesa;
import com.mymoney.repository.CategoriaRepository;
import com.mymoney.repository.DespesaRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RelatorioFinanceiroService {

    private final DespesaRepository despesaRepository;
    private final CategoriaRepository categoriaRepository;

    public RelatorioFinanceiroService(
            DespesaRepository despesaRepository,
            CategoriaRepository categoriaRepository) {

        this.despesaRepository = despesaRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public RelatorioCategoriasMensalDTO relatorioPorCategoria(
            Long usuarioId, int mes, int ano) {

        if (mes < 1 || mes > 12 || ano < 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe um mês entre 1 e 12 e um ano válido"
            );
        }

        YearMonth periodo = YearMonth.of(ano, mes);

        LocalDate inicio = periodo.atDay(1);
        LocalDate fim = periodo.atEndOfMonth();

        // Busca somente as categorias do usuário autenticado.
        List<Categoria> categoriasUsuario =
                categoriaRepository.findByUsuarioId(usuarioId);

        Map<Long, String> nomesCategorias = new HashMap<>();

        for (Categoria categoria : categoriasUsuario) {
            nomesCategorias.put(
                    categoria.getId(),
                    categoria.getNome()
            );
        }

        // Busca as despesas do usuário no mês escolhido.
        List<Despesa> despesas =
                despesaRepository
                        .findByUsuarioIdAndDataDespesaBetween(
                                usuarioId, inicio, fim
                        );

        Map<Long, DadosCategoria> totais = new HashMap<>();

        BigDecimal totalGeral = BigDecimal.ZERO;

        for (Despesa despesa : despesas) {

            Long categoriaId = despesa.getCategoriaId();

            String nomeCategoria;

            if (categoriaId == null) {
                nomeCategoria = "Sem categoria";
            } else {
                nomeCategoria = nomesCategorias.get(categoriaId);

                if (nomeCategoria == null) {
                    nomeCategoria = "Categoria não encontrada";
                }
            }

            // Agrupa as despesas pela categoria.
            DadosCategoria dados = totais.get(categoriaId);

            if (dados == null) {
                dados = new DadosCategoria(
                        categoriaId, nomeCategoria
                );
                totais.put(categoriaId, dados);
            }

            BigDecimal valor = despesa.getValor();

            if (valor == null) {
                valor = BigDecimal.ZERO;
            }

            dados.quantidade++;
            dados.total = dados.total.add(valor);
            totalGeral = totalGeral.add(valor);

            String status = despesa.getStatus();

            if ("PENDENTE".equalsIgnoreCase(status)) {
                dados.pendente = dados.pendente.add(valor);

            } else if ("PAGA".equalsIgnoreCase(status)) {
                dados.pago = dados.pago.add(valor);

            } else if ("ATRASADA".equalsIgnoreCase(status)) {
                dados.atrasado = dados.atrasado.add(valor);
            }
        }

        // Transforma os resultados em uma lista de DTOs.
        List<RelatorioCategoriaDTO> resultado = new ArrayList<>();

        for (DadosCategoria dados : totais.values()) {

            resultado.add(new RelatorioCategoriaDTO(
                    dados.categoriaId,
                    dados.nome,
                    dados.quantidade,
                    dados.total,
                    dados.pendente,
                    dados.pago,
                    dados.atrasado
            ));
        }

        // Mostra primeiro as categorias com maior gasto.
        resultado.sort(
                Comparator.comparing(
                        RelatorioCategoriaDTO::total
                ).reversed()
        );

        return new RelatorioCategoriasMensalDTO(
                mes,
                ano,
                despesas.size(),
                totalGeral,
                resultado
        );
    }

    // Classe auxiliar para acumular os valores de cada categoria.
    private static class DadosCategoria {

        private final Long categoriaId;
        private final String nome;

        private int quantidade = 0;

        private BigDecimal total = BigDecimal.ZERO;
        private BigDecimal pendente = BigDecimal.ZERO;
        private BigDecimal pago = BigDecimal.ZERO;
        private BigDecimal atrasado = BigDecimal.ZERO;

        public DadosCategoria(Long categoriaId, String nome) {
            this.categoriaId = categoriaId;
            this.nome = nome;
        }
    }
}
