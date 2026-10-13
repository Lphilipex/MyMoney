
package com.mymoney.controllers;

import com.mymoney.dto.LoginDTO;
import com.mymoney.dto.TokenDTO;
import com.mymoney.services.AuthService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public TokenDTO login(@Valid @RequestBody LoginDTO dados) {
        return authService.login(dados);
    }
    @GetMapping("/teste")
    public String testar() {
        return "Controller de autenticação funcionando!";
    }
}
