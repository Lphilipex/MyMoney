
package com.mymoney.services;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey chave;

    public JwtService(@Value("${mymoney.jwt.secret}") String segredo) {
        this.chave = Keys.hmacShaKeyFor(
            segredo.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String gerarToken(Long usuarioId, String email) {
        Date agora = new Date();
        Date expiracao = new Date(agora.getTime() + 3600000);

        return Jwts.builder()
            .subject(email)
            .claim("usuarioId", usuarioId)
            .issuedAt(agora)
            .expiration(expiracao)
            .signWith(chave)
            .compact();
    }
    public boolean validarToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(chave)
                    .build()
                    .parseSignedClaims(token);

            return true;

        } catch (io.jsonwebtoken.JwtException
                 | IllegalArgumentException e) {
            return false;
        }
    }

    public String extrairEmail(String token) {
        return Jwts.parser()
                .verifyWith(chave)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}