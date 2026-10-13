
package com.mymoney.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {
	private static final Logger log =
	        LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> tratarValidacao(
            MethodArgumentNotValidException ex) {

        Map<String, Object> erros = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(erro ->
            erros.put(erro.getField(), erro.getDefaultMessage())
        );

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("data", LocalDateTime.now());
        resposta.put("status", 400);
        resposta.put("erro", "Dados inválidos");
        resposta.put("mensagens", erros);

        return ResponseEntity.badRequest().body(resposta);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> tratarStatus(
            ResponseStatusException ex) {

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("data", LocalDateTime.now());
        resposta.put("status", ex.getStatusCode().value());
        resposta.put("erro", ex.getReason());

        return ResponseEntity
                .status(ex.getStatusCode())
                .body(resposta);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> tratarJsonInvalido(
            HttpMessageNotReadableException ex) {

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("data", LocalDateTime.now());
        resposta.put("status", 400);
        resposta.put("erro", "JSON inválido ou dados em formato incorreto");

        return ResponseEntity.badRequest().body(resposta);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> tratarErroGeral(
            Exception ex) {
    	log.error("Erro ao processar a requisição", ex);

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("data", LocalDateTime.now());
        resposta.put("status", 500);
        resposta.put("erro", "Ocorreu um erro interno. Tente novamente.");

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(resposta);
        
    }
    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> recursoNaoEncontrado(
            org.springframework.web.servlet.resource.NoResourceFoundException ex) {

        Map<String, Object> resposta = new HashMap<>();

        resposta.put("erro", "Rota não encontrada");
        resposta.put("status", 404);

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resposta);
    }
    
}