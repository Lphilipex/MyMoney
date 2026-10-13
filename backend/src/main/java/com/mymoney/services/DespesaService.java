
package com.mymoney.services;

import java.util.List;

import java.math.BigDecimal;
import java.time.LocalDate;
import com.mymoney.dto.ResumoDespesasMensalDTO;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.stereotype.Service;

import com.mymoney.model.Categoria;
import com.mymoney.model.Despesa;
import com.mymoney.repository.CategoriaRepository;
import com.mymoney.repository.DespesaRepository;

@Service
public class DespesaService {

    private final DespesaRepository despesaRepository;
    private final CategoriaRepository categoriaRepository;

    public DespesaService(
            DespesaRepository despesaRepository,
            CategoriaRepository categoriaRepository) {
        this.despesaRepository = despesaRepository;
        this.categoriaRepository = categoriaRepository;
    }

    // Valida a categoria, quando informada

private void validarCategoria(Long categoriaId, Long usuarioId) {

    if (categoriaId == null) {
        return;
    }

    Categoria categoria = categoriaRepository.findById(categoriaId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Categoria não encontrada"
            ));

    if (categoria.getUsuarioId() == null
            || !categoria.getUsuarioId().equals(usuarioId)) {
        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "A categoria não pertence a este usuário"
        );
    }

    if (!"DESPESA".equals(categoria.getTipo())) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "A categoria precisa ser do tipo DESPESA"
        );
    }
}


    // Cadastra uma despesa
    public Despesa cadastrar(Despesa despesa, Long usuarioId) {

        validarCategoria(despesa.getCategoriaId(), usuarioId);

        despesa.setUsuarioId(usuarioId);

        return despesaRepository.save(despesa);
    }

    // Lista todas as despesas do usuário
    public List<Despesa> listar(Long usuarioId) {
        return despesaRepository.findByUsuarioId(usuarioId);
    }

    // Busca uma despesa pelo ID, respeitando o usuário
    public Despesa buscarPorId(Long id, Long usuarioId) {

        return despesaRepository.findByIdAndUsuarioId(id, usuarioId)
        		.orElseThrow(() -> new ResponseStatusException(
        		        HttpStatus.NOT_FOUND,
        		        "Despesa não encontrada"
        		));
                   
    }

    // Filtra despesas pelo tipo
    public List<Despesa> listarPorTipo(
            Long usuarioId, String tipoDespesa) {

        if (!List.of("FIXA", "VARIADA", "EMERGENCIA")
                .contains(tipoDespesa)) {
            throw new RuntimeException("Tipo de despesa inválido");
        }

        return despesaRepository
                .findByUsuarioIdAndTipoDespesa(usuarioId, tipoDespesa);
    }

    // Filtra despesas pelo status
    public List<Despesa> listarPorStatus(
            Long usuarioId, String status) {

        if (!List.of("PENDENTE", "PAGA", "ATRASADA")
                .contains(status)) {
            throw new RuntimeException("Status de despesa inválido");
        }

        return despesaRepository
                .findByUsuarioIdAndStatus(usuarioId, status);
    }

    // Atualiza uma despesa existente
    public Despesa atualizar(
            Long id, Despesa dados, Long usuarioId) {

        Despesa despesa = buscarPorId(id, usuarioId);

        validarCategoria(dados.getCategoriaId(), usuarioId);

        despesa.setCategoriaId(dados.getCategoriaId());
        despesa.setDescricao(dados.getDescricao());
        despesa.setValor(dados.getValor());
        despesa.setTipoDespesa(dados.getTipoDespesa());
        despesa.setDataDespesa(dados.getDataDespesa());
        despesa.setDataVencimento(dados.getDataVencimento());
        
        despesa.setRecorrente(dados.getRecorrente());
        despesa.setObservacao(dados.getObservacao());

        return despesaRepository.save(despesa);
    }

    // Exclui uma despesa existente
    public void excluir(Long id, Long usuarioId) {

        Despesa despesa = buscarPorId(id, usuarioId);

        despesaRepository.delete(despesa);
    }

    // Marca uma despesa como paga
    public Despesa marcarComoPaga(Long id, Long usuarioId) {

        Despesa despesa = buscarPorId(id, usuarioId);

        despesa.setStatus("PAGA");

        return despesaRepository.save(despesa);
    }

public ResumoDespesasMensalDTO resumoMensal(
        Long usuarioId, int mes, int ano) {

    if (mes < 1 || mes > 12 || ano < 1) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Informe um mês entre 1 e 12 e um ano válido"
        );
    }

    LocalDate inicio = LocalDate.of(ano, mes, 1);
    LocalDate fim = inicio.withDayOfMonth(
            inicio.lengthOfMonth()
    );

    List<Despesa> despesas =
            despesaRepository.findByUsuarioIdAndDataDespesaBetween(
                    usuarioId, inicio, fim
            );

    BigDecimal totalDespesas = BigDecimal.ZERO;
    BigDecimal totalFixas = BigDecimal.ZERO;
    BigDecimal totalVariadas = BigDecimal.ZERO;
    BigDecimal totalEmergencias = BigDecimal.ZERO;
    BigDecimal totalPendentes = BigDecimal.ZERO;
    BigDecimal totalPagas = BigDecimal.ZERO;
    BigDecimal totalAtrasadas = BigDecimal.ZERO;

    for (Despesa despesa : despesas) {

        BigDecimal valor = despesa.getValor();

        totalDespesas = totalDespesas.add(valor);

        if ("FIXA".equals(despesa.getTipoDespesa())) {
            totalFixas = totalFixas.add(valor);
        }

        if ("VARIADA".equals(despesa.getTipoDespesa())) {
            totalVariadas = totalVariadas.add(valor);
        }

        if ("EMERGENCIA".equals(despesa.getTipoDespesa())) {
            totalEmergencias =
                    totalEmergencias.add(valor);
        }

        if ("PENDENTE".equals(despesa.getStatus())) {
            totalPendentes = totalPendentes.add(valor);
        }

        if ("PAGA".equals(despesa.getStatus())) {
            totalPagas = totalPagas.add(valor);
        }

        if ("ATRASADA".equals(despesa.getStatus())) {
            totalAtrasadas = totalAtrasadas.add(valor);
        }
    }

    return new ResumoDespesasMensalDTO(
            mes,
            ano,
            despesas.size(),
            totalDespesas,
            totalFixas,
            totalVariadas,
            totalEmergencias,
            totalPendentes,
            totalPagas,
            totalAtrasadas
    );
}


}