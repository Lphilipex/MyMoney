#  MyMoney — Controle Financeiro Pessoal
<img width="1914" height="905" alt="image" src="https://github.com/user-attachments/assets/f2ef67a4-4cec-439a-a496-b889cb4dadae" />
---
<img width="1909" height="907" alt="image" src="https://github.com/user-attachments/assets/94bd2e98-64fd-49b8-8677-d5c4c2ebedfb" />
---
<img width="1915" height="907" alt="image" src="https://github.com/user-attachments/assets/4e07475d-9441-4a51-b937-5bbbf03c35fc" />

---
<img width="1915" height="906" alt="image" src="https://github.com/user-attachments/assets/bcd7e9f1-5ea0-4ca2-bb1c-15c689fe1abd" />

---
<img width="1917" height="898" alt="image" src="https://github.com/user-attachments/assets/cbfdb343-e840-4998-bc9a-788b23751999" />

---
<img width="1910" height="897" alt="image" src="https://github.com/user-attachments/assets/178e2bba-f4d5-4c02-84da-be0283963f20" />

---
<img width="1905" height="904" alt="image" src="https://github.com/user-attachments/assets/44a567fb-5866-4c3e-848f-c5f9668900f5" />

---
<img width="1914" height="905" alt="image" src="https://github.com/user-attachments/assets/25955382-fe73-434e-8117-cd691ef18bc0" />

---






O **MyMoney** é uma aplicação de controle financeiro pessoal desenvolvida para ajudar os usuários a organizar suas finanças, acompanhar receitas e despesas e visualizar sua situação financeira de maneira simples e intuitiva.

O projeto está sendo desenvolvido com foco em organização, usabilidade e aprendizado prático de desenvolvimento Full Stack, utilizando uma API REST no backend e uma interface web no frontend, com possibilidade de evolução para uma aplicação Android.

##  Objetivo do projeto

Desenvolver uma solução que facilite o gerenciamento das finanças pessoais, permitindo acompanhar movimentações financeiras, organizar gastos por categorias e consultar informações importantes por meio de um dashboard.

##  Funcionalidades

- [x] Estrutura inicial do backend com Spring Boot.
- [x] API REST para comunicação entre as aplicações.
- [ ] Cadastro e gerenciamento de receitas.
- [ ] Cadastro e gerenciamento de despesas.
- [ ] Organização de gastos por categorias.
- [ ] Dashboard com resumo financeiro.
- [ ] Relatórios de receitas e despesas.
- [ ] Gerenciamento de cartões de crédito.
- [ ] Controle de compras e parcelas dos cartões.

### 📱 Próximo update

- [ ] Aplicativo para dispositivos Android.

##  Tecnologias utilizadas

O MyMoney está sendo desenvolvido utilizando tecnologias modernas de desenvolvimento Full Stack, com separação entre frontend, backend e banco de dados.

###  Backend

- **Java:** linguagem de programação utilizada para implementar as regras de negócio, processar informações financeiras e desenvolver a lógica da aplicação.
- **Spring Boot:** framework utilizado para facilitar a criação e configuração da aplicação backend.
- **Spring Web:** responsável pela criação dos endpoints REST que permitem a comunicação entre o frontend e o backend por meio de requisições HTTP.
- **Spring Data JPA:** facilita o acesso e a persistência dos dados no banco de dados, reduzindo a necessidade de escrever consultas SQL manualmente para operações comuns.
- **Bean Validation:** permite validar os dados recebidos pela API, ajudando a evitar cadastros com informações inválidas.
- **Maven:** ferramenta utilizada para gerenciar as dependências e o processo de compilação e execução do backend.

###  Banco de dados

**PostgreSQL** é o sistema gerenciador de banco de dados relacional utilizado para armazenar e organizar as informações financeiras da aplicação.

O banco de dados foi planejado para armazenar usuários, receitas, despesas, categorias, cartões de crédito, compras parceladas e investimentos, mantendo os relacionamentos entre essas informações.

#### Diagrama do banco de dados

![Diagrama do banco de dados MyMoney](https://github.com/user-attachments/assets/6baf873e-5172-4641-a7c2-abbc48f1e0b8)

###  Frontend

O frontend é responsável pela interface visual do MyMoney e pela interação do usuário com as funcionalidades do sistema.

- **Interface web:** permite visualizar informações financeiras, navegar pelas funcionalidades e interagir com os dados apresentados pela aplicação.
- **Integração com API REST:** permite enviar requisições ao backend e apresentar os dados retornados pela aplicação.

As tecnologias e bibliotecas específicas do frontend serão documentadas conforme a implementação atual do projeto.

##  Comunicação entre as camadas

A aplicação utiliza uma arquitetura separada em que o frontend se comunica com o backend por meio de uma API REST.

O backend processa as requisições, aplica as regras de negócio e realiza as operações necessárias no PostgreSQL, retornando as respostas para o frontend.

##  Ferramentas de desenvolvimento

- **Spring Tool Suite (STS):** ambiente de desenvolvimento utilizado para programar e executar o backend Java.
- **Git:** sistema de controle de versão utilizado para acompanhar as alterações no código-fonte.
- **GitHub:** plataforma utilizada para hospedar o repositório e documentar a evolução do projeto.
- **PostgreSQL:** ferramenta utilizada para gerenciar e consultar os dados persistidos pela aplicação.

##  Como executar o projeto

###  Pré-requisitos

Antes de iniciar, instale:

- Java compatível com a versão configurada no backend.
- Maven, caso não utilize o Maven Wrapper do projeto.
- PostgreSQL.
- Node.js e npm, caso o frontend utilize essa tecnologia.

### 1. Clonar o repositório

```bash
git clone URL_DO_SEU_REPOSITORIO
cd MyMoney
```

Substitua `URL_DO_SEU_REPOSITORIO` pelo endereço real do repositório no GitHub.

### 2. Configurar o banco de dados

Crie um banco de dados PostgreSQL para o MyMoney e configure as credenciais de conexão no arquivo de configuração do backend.

Exemplo de configuração:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mymoney
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

Configure as variáveis de ambiente `DB_USERNAME` e `DB_PASSWORD` com as credenciais locais do PostgreSQL.

> **Importante:** não publique senhas reais ou outras credenciais no GitHub.

### 3. Executar o backend

Abra um terminal na pasta do backend:

```bash
cd backend
```

Execute a aplicação com o Maven Wrapper, se disponível.

**Linux ou macOS:**

```bash
./mvnw spring-boot:run
```

**Windows:**

```bat
mvnw.cmd spring-boot:run
```

Se o projeto não possuir Maven Wrapper, utilize:

```bash
mvn spring-boot:run
```

### 4. Executar o frontend

Abra outro terminal e acesse a pasta do frontend:

```bash
cd frontend
```

Se o frontend utilizar Node.js, instale as dependências:

```bash
npm install
```

Depois, inicie a aplicação conforme o script definido no `package.json`. Em projetos configurados com Vite, normalmente:

```bash
npm run dev
```

Consulte as instruções específicas do frontend caso os comandos sejam diferentes.

##  Segurança

- Não versionar senhas ou credenciais de acesso.
- Utilizar variáveis de ambiente para configurações sensíveis.
- Validar os dados recebidos pela API.
- Evoluir a aplicação com mecanismos de autenticação e autorização.

##  Aprendizados

Este projeto permite praticar conceitos importantes de desenvolvimento de software, incluindo:

- Desenvolvimento de APIs REST com Java e Spring Boot.
- Persistência de dados com Spring Data JPA e PostgreSQL.
- Integração entre frontend e backend.
- Organização de código e separação de responsabilidades.
- Controle de versão com Git e GitHub.

##  Próximos passos

- Finalizar as funcionalidades de receitas e despesas.
- Aprimorar o dashboard financeiro.
- Implementar relatórios e filtros por período.
- Desenvolver o gerenciamento de cartões e parcelas.
- Melhorar a experiência visual e a responsividade.
- Desenvolver uma aplicação Android integrada à API.

##  Desenvolvedor

**Luiz Philipe Barros Machado**

Desenvolvedor Full Stack Júnior, com interesse em Java, Spring Boot, desenvolvimento de APIs e criação de soluções que resolvam problemas do dia a dia.

- **GitHub:** [@Lphilipex](https://github.com/Lphilipex)
- **LinkedIn:** [Luiz Philipe Barros Machado](https://www.linkedin.com/in/luiz-philipe-barros-machado/)

---
