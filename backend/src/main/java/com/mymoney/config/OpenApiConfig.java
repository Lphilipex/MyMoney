
package com.mymoney.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI myMoneyOpenAPI() {

        String esquemaSeguranca = "Bearer Authentication";

        return new OpenAPI()
                .info(new Info()
                        .title("MyMoney API")
                        .version("1.0.0")
                        .description(
                                "API para controle financeiro pessoal, "
                                + "despesas, cartões e relatórios."
                        )
                        .contact(new Contact()
                                .name("Equipe MyMoney")
                        )
                )
                .components(new Components()
                        .addSecuritySchemes(
                                esquemaSeguranca,
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                        )
                )
                .addSecurityItem(
                        new SecurityRequirement()
                                .addList(esquemaSeguranca)
                );
    }
}
