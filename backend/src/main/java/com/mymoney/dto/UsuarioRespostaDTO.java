
package com.mymoney.dto;

import com.mymoney.model.Usuario;
import java.time.LocalDateTime;

public record UsuarioRespostaDTO(
    Long id,
    String nome,
    String email,
    LocalDateTime dataCriacao
) {
    public static UsuarioRespostaDTO deUsuario(Usuario usuario) {
        return new UsuarioRespostaDTO(
            usuario.getId(),
            usuario.getNome(),
            usuario.getEmail(),
            usuario.getDataCriacao()
        );
    }
}