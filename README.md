# Guia Passo a Passo: Desenvolvimento de Site para Alunos da USP

Este guia detalhado aborda o desenvolvimento de um site para alunos da USP, onde os usuários poderão se cadastrar, fazer login e enviar documentos (provas, listas, exercícios, etc.) de anos anteriores. O guia cobre desde o planejamento até a implantação, com orientações para implementação do backend em Kotlin ou Go e o uso do MySQL com 4 tabelas.

## 1. Planejamento e Levantamento de Requisitos

### Defina a ideia principal:  

- Usuários se cadastrando e autenticando no site.  
- Upload de documentos (provas, listas, exercícios) para acesso posterior.  
- Visualização e pesquisa dos documentos por critérios (ex: disciplina, ano, tipo de prova).  
- (Opcional) Possibilidade de comentar ou avaliar os documentos.

### Funcionalidades Básicas:  

- Cadastro de novo usuário  
- Login e logout  
- Upload (armazenamento local ou em nuvem) dos arquivos  
- Listagem, filtragem e pesquisa dos documentos  
- Exibição dos detalhes dos arquivos (título, descrição, data, autor, disciplina, etc.)

### Definição dos requisitos do projeto:  

- Backend escrito em Kotlin ou Go  
- Banco de dados MySQL com 4 tabelas  
- (Opcional) Interface web básica para interação com os usuários utilizando HTML, CSS e, se necessário, JavaScript ou framework como Bootstrap para facilitar o design.

## 2. Definição e Estruturação do Banco de Dados MySQL

Crie um novo banco (por exemplo, "usp_documents") e planeje 4 tabelas. Sugestão de modelagem:

### Tabela "usuarios":

- id (INT, PK, auto incremento)  
- nome (VARCHAR)  
- email (VARCHAR, único)  
- hash_senha (VARCHAR)  
- data_criacao (DATETIME)

### Tabela "disciplinas":  

- id (INT, PK, auto incremento)  
- nome (VARCHAR)  
- codigo (VARCHAR) – opcional para identificar a disciplina  
- descricao (TEXT) – opcional

### Tabela "documentos":  

- id (INT, PK, auto incremento)  
- titulo (VARCHAR)  
- descricao (TEXT)  
- tipo (ENUM ou VARCHAR) – ex.: "prova", "lista", "exercício"  
- ano (INT) – para indicar o ano do exame  
- usuario_id (INT) – chave estrangeira referenciando "usuarios"  
- disciplina_id (INT) – chave estrangeira referenciando "disciplinas"  
- data_upload (DATETIME)  
- caminho_arquivo (VARCHAR) – local onde o arquivo está armazenado

### Tabela "comentarios":  

- id (INT, PK, auto incremento)  
- documento_id (INT) – chave estrangeira referenciando "documentos"  
- usuario_id (INT) – chave estrangeira referenciando "usuarios"  
- comentario (TEXT)  
- data_comentario (DATETIME)

### Ferramentas Úteis:  
- MySQL Workbench ou DBeaver para modelagem e administração do banco.
- Scripts SQL para criar as tabelas e definir as chaves estrangeiras.

## 3. Desenvolvimento do Backend

### A. Usando Kotlin

#### Frameworks Sugeridos:  

- Spring Boot – Possui muita documentação e facilita a criação de APIs REST.  
- Ktor – Um framework mais leve e moderno para aplicações web.

#### Passos Básicos com Spring Boot (exemplo):  

1. Configure o ambiente de desenvolvimento (instale o JDK, uma IDE como IntelliJ IDEA e o Maven/Gradle).  
2. Crie um novo projeto Spring Boot com dependências para Web, JPA (para ORM) e MySQL Driver.  
3. Configure o arquivo de propriedades (application.properties ou application.yml) com as credenciais do banco MySQL.  
4. Modele suas entidades (classes) que mapeiam para as tabelas "usuarios", "disciplinas", "documentos" e "comentarios".  
5. Crie repositórios (interfaces que estendem JpaRepository) para acesso aos dados.
6. Desenvolva controllers REST para expor endpoints, como:

   - POST /usuarios – para cadastro
   - POST /login – para autenticação  
   - POST /documentos – para upload  
   - GET /documentos – para listagem e pesquisa  
   - (Opcional) POST /comentarios – para enviar comentários

7. Inclua tratamentos de exceção, segurança (por exemplo, JWT ou OAuth2) e verificação de uploads (tamanho e tipo do arquivo).

### B. Usando Go

#### Frameworks Sugeridos:  

- Gin ou Echo – São frameworks robustos e de alta performance para construir APIs RESTful.

#### Passos Básicos com Gin (exemplo):  

1. Instale o Go e configure o ambiente de desenvolvimento (use VS Code, GoLand ou o editor de sua preferência).  
2. Crie um novo projeto Go e importe o framework Gin.  
3. Configure uma conexão com o MySQL utilizando um driver (como go-sql-driver/mysql) ou um ORM (por exemplo, GORM).  
4. Modele suas estruturas (structs) que mapeiam para as tabelas do banco.
5. Implemente funções para gerenciar os endpoints REST:

   - POST /usuarios para cadastro
   - POST /login para autenticação  
   - POST /documentos para upload  
   - GET /documentos para listagem e pesquisa  
   - (Opcional) POST /comentarios para comentários  

6. Trabalhe com validações, tratamento de erros, autenticação (por exemplo, com tokens JWT) e segurança para uploads (limite de tamanho e tipos de arquivo).

### Dicas Gerais para o Backend:  
- Utilize uma arquitetura limpa, separando as camadas de controladores (controllers), serviços (services) e acesso a dados (repositories/DAOs).  
- Use funções/métodos para reutilização de código, principalmente na conexão e manipulação do banco de dados.  
- Teste suas rotas com ferramentas como Postman ou cURL.  
- Mantenha a documentação da API atualizada (pode usar Swagger/OpenAPI).

## 4. Desenvolvimento do Frontend

### Opções:  

- Desenvolver páginas em HTML, CSS e JavaScript para consumo dos endpoints REST do backend.  
- Usar frameworks/metodologias como Bootstrap para facilitar o design responsivo.  
- Utilizar AJAX/fetch para interações assíncronas (por exemplo, para enviar dados de login ou upload sem recarregar a página).

### Funcionalidades de Interface:  

- Página inicial com informações sobre o site e acesso às funcionalidades.  
- Tela de cadastro e login.  
- Página para upload de documentos (formulário com campos para título, descrição, seleção de disciplina, tipo e ano).  
- Página de listagem dos documentos com filtros e possibilidade de pesquisa.  
- (Opcional) Página de visualização com comentários.

## 5. A Integração Com o Banco de Dados

### Configuração:  

- Certifique-se que o MySQL esteja instalado e configurado.  
- Crie o banco de dados e as tabelas conforme o script SQL que você elaborará (baseado na modelagem sugerida).

### Exemplo de Script SQL para criação das tabelas:

```sql
-- Tabela de usuários
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  hash_senha VARCHAR(255) NOT NULL,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de disciplinas
CREATE TABLE disciplinas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  codigo VARCHAR(20),
  descricao TEXT
);

-- Tabela de documentos
CREATE TABLE documentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50),
  ano INT,
  usuario_id INT,
  disciplina_id INT,
  data_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
  caminho_arquivo VARCHAR(255),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id)
);

-- Tabela de comentários
CREATE TABLE comentarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  documento_id INT,
  usuario_id INT,
  comentario TEXT,
  data_comentario DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (documento_id) REFERENCES documentos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### Observações:  
- Caso opte por outra abordagem na modelagem, ajuste as tabelas e relacionamentos conforme necessário.  
- Considere índices nas colunas que serão usadas para filtragem e pesquisa (como "ano", "tipo", "disciplina_id").


## 6. Testes, Segurança e Validação

### Testes Unitários e de Integração:  

- Implemente testes para as funções críticas do backend (como autenticação, upload e acesso ao banco de dados).  
- Utilize ferramentas próprias da linguagem escolhida (JUnit para Kotlin ou o pacote testing do Go).

### Segurança:  

- Assegure-se de validar e sanitizar os dados de entrada para evitar ataques como SQL injection.  
- Para uploads de arquivos, limite o tamanho e os tipos de arquivos aceitos (por exemplo, PDF, DOCX ou TXT).  
- Implemente autenticação robusta (como tokens JWT) e, se necessário, criptografe senhas com um algoritmo seguro (exemplo, BCrypt).

### Validação de Dados no Frontend:  

- Utilize formulários com validação básica para garantir que os campos obrigatórios sejam preenchidos.

## 7. Deploy e Ambiente de Produção

### Hospedagem:  

- Escolha um serviço de hospedagem (VPS, serviço de nuvem ou PaaS) para o backend e o banco de dados, ou utilize provedores especializados.

### Configuração do Servidor:  

- Configure o ambiente de produção com variáveis de ambiente para dados sensíveis (credenciais do banco, chaves secretas, etc).  
- Utilize certificados SSL para segurança na transmissão dos dados.

### Gerenciamento de Versões:   

- Use um sistema de versionamento (como Git) para controlar as alterações no código, facilitando atualizações e correções.

## 8. Documentação do Projeto

### Documente o Código e as API Endpoints:  

- Crie um guia de uso da API (por exemplo, com Swagger/OpenAPI) para que outros desenvolvedores possam entender como interagir com o backend.  
- Escreva um README detalhado no repositório contendo instruções para instalação, execução e deploy.

### Esclareça as Dependências:  

- Liste todas as bibliotecas e ferramentas utilizadas, assim como os passos para configurar o ambiente de desenvolvimento.

## 9. Aprendizado Contínuo

### Cursos e Tutoriais:  

- Pesquise cursos online sobre desenvolvimento web utilizando Kotlin (Spring Boot ou Ktor) ou Go (Gin, Echo).  
- Explore tutoriais sobre MySQL e modelagem de dados relacionais para adquirir uma compreensão sólida sobre bancos de dados.

### Documentação Oficial:  

- Consulte a documentação oficial dos frameworks e das linguagens para esclarecer dúvidas e explorar funcionalidades avançadas.

## Resumo dos Passos

1. Levante os requisitos e defina as funcionalidades que o site deve ter (cadastro, upload, pesquisa, etc.).  
2. Planeje a arquitetura do banco de dados MySQL e crie 4 tabelas (usuários, disciplinas, documentos e comentários, por exemplo).  
3. Escolha entre Kotlin e Go para o desenvolvimento do backend, configure o ambiente e CRUD dos recursos.  
4. Desenvolva uma interface web simples utilizando HTML/CSS/JavaScript para interação com a API.  
5. Configure a segurança, valide os dados e implemente testes para garantir o funcionamento correto da aplicação.  
6. Faça o deploy do sistema em um ambiente de produção e documente todas as etapas do projeto.

Essa abordagem passo a passo permitirá que você vá da concepção à implantação de um site funcional, mesmo que não tenha muita experiência prévia com web ou banco de dados. Boa sorte no desenvolvimento do projeto e conte com a comunidade (e pesquisas online) para sanar dúvidas ao longo do caminho!

---
