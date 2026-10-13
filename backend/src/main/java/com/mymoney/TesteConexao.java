
package com.mymoney;

import java.sql.Connection;
import javax.sql.DataSource;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class TesteConexao implements CommandLineRunner {

    private final DataSource dataSource;

    public TesteConexao(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {

        try (Connection conexao = dataSource.getConnection()) {

            System.out.println("Conexao com PostgreSQL realizada!");
            System.out.println("Banco conectado: " + conexao.getCatalog());

        }
    }
}