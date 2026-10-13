
package com.mymoney.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AlterarSenhaDTO(

    @NotBlank(message = "A senha atual é obrigatória")
    String senhaAtual,

    @NotBlank(message = "A nova senha é obrigatória")
    @Size(min = 8, max = 72,
          message = "A nova senha deve ter entre 8 e 72 caracteres")
    String novaSenha,

    @NotBlank(message = "A confirmação da senha é obrigatória")
    String confirmarSenha

) {}
