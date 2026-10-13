
package com.mymoney.controllers;

import com.mymoney.model.Categoria;
import com.mymoney.repository.CategoriaRepository;
import com.mymoney.services.UsuarioService;

import jakarta.validation.Valid;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/categorias")
public class CategoriaController {

    private final CategoriaRepository repository;
    private final UsuarioService usuarioService;

    public CategoriaController(
            CategoriaRepository repository,
            UsuarioService usuarioService) {
        this.repository = repository;
        this.usuarioService = usuarioService;
    }

    // Lista somente as categorias do usuário autenticado
    @GetMapping
    public List<Categoria> listar(Authentication autenticacao) {

        Long usuarioId = usuarioService
                .buscarPorEmail(autenticacao.getName()).id();

        return repository.findByUsuarioId(usuarioId);
    }

    // Lista as categorias do usuário por tipo
    @GetMapping("/tipo/{tipo}")
    public List<Categoria> listarPorTipo(
            @PathVariable String tipo,
            Authentication autenticacao) {

        validarTipo(tipo);

        Long usuarioId = usuarioService
                .buscarPorEmail(autenticacao.getName()).id();

        return repository.findByUsuarioIdAndTipo(usuarioId, tipo);
    }

    // Cadastra uma categoria para o usuário autenticado
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Categoria cadastrar(
            @Valid @RequestBody Categoria categoria,
            Authentication autenticacao) {

        Long usuarioId = usuarioService
                .buscarPorEmail(autenticacao.getName()).id();

        validarTipo(categoria.getTipo());

        // O usuário vem do token, não do corpo da requisição
        categoria.setUsuarioId(usuarioId);

        return repository.save(categoria);
    }

    // Atualiza uma categoria pertencente ao usuário autenticado
    @PutMapping("/{id}")
    public Categoria atualizar(
            @PathVariable Long id,
            @Valid @RequestBody Categoria dados,
            Authentication autenticacao) {

        Long usuarioId = usuarioService
                .buscarPorEmail(autenticacao.getName()).id();

        Categoria categoria = buscarCategoriaDoUsuario(id, usuarioId);

        validarTipo(dados.getTipo());

        categoria.setNome(dados.getNome());
        categoria.setTipo(dados.getTipo());

        return repository.save(categoria);
    }

    // Exclui uma categoria do usuário autenticado
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(
            @PathVariable Long id,
            Authentication autenticacao) {

        Long usuarioId = usuarioService
                .buscarPorEmail(autenticacao.getName()).id();

        Categoria categoria = buscarCategoriaDoUsuario(id, usuarioId);

        try {
            repository.delete(categoria);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Não é possível excluir uma categoria que está vinculada a despesas"
            );
        }
    }

    // Confere se a categoria existe e pertence ao usuário
    private Categoria buscarCategoriaDoUsuario(
            Long id, Long usuarioId) {

        Categoria categoria = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Categoria não encontrada"
                ));

        if (!usuarioId.equals(categoria.getUsuarioId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Esta categoria não pertence ao usuário autenticado"
            );
        }

        return categoria;
    }

    // Aceita somente os tipos permitidos
    private void validarTipo(String tipo) {

        if (!"RECEITA".equals(tipo) && !"DESPESA".equals(tipo)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O tipo deve ser RECEITA ou DESPESA"
            );
        }
    }
}
