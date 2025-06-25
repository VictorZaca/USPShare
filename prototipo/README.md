# 🎓 USPShare

Uma plataforma de compartilhamento de recursos acadêmicos desenvolvida para a comunidade da USP, permitindo que estudantes compartilhem materiais de estudo, provas antigas, resumos e outros recursos educacionais.

## 🚀 Tecnologias Utilizadas

### 🎨 **Frontend (React + TypeScript)**

#### **Core Framework & Language**
- **React 19.1.0** - Biblioteca JavaScript para construção de interfaces de usuário
  - Utiliza o novo JSX Transform (sem necessidade de importar React)
  - Hooks modernos para gerenciamento de estado
  - Componentes funcionais com TypeScript
- **TypeScript 5.8.3** - Superset tipado do JavaScript
  - Tipagem estática para maior segurança e produtividade
  - Interfaces para props e estados
  - Intellisense aprimorado no desenvolvimento
- **Vite 6.3.1** - Build tool e servidor de desenvolvimento ultra-rápido
  - Hot Module Replacement (HMR) instantâneo
  - Build otimizado para produção
  - Suporte nativo ao TypeScript

#### **Sistema de Design e UI**
- **Material-UI (MUI) 7.1.1** - Sistema de design principal
  - Mais de 50 componentes utilizados (Button, Card, Typography, Grid, etc.)
  - Theme customizado com modo claro/escuro
  - Design responsivo e acessível
  - Ícones do @mui/icons-material (50+ ícones únicos)
- **@mui/lab 7.0.0** - Componentes experimentais
  - LoadingButton para UX aprimorada em formulários
  - Componentes beta para funcionalidades avançadas
- **CSS-in-JS** - Estilização com sx prop e styled components

#### **Roteamento e Navegação**
- **React Router DOM 7.5.2** - Sistema de roteamento client-side
  - 25+ rotas configuradas
  - Links tipados com TypeScript
  - Navegação programática com useNavigate
  - Parâmetros de rota dinâmicos

#### **HTTP Client e Comunicação**
- **Axios 1.10.0** - Cliente HTTP para comunicação com API
  - Instância configurada com interceptors
  - Bearer Token automático para autenticação
  - Tratamento de erros centralizado
  - Base URL configurável

#### **Gerenciamento de Estado**
- **React Context API** - Estado global da aplicação
  - AuthContext para autenticação
  - ColorModeContext para temas
  - Hooks customizados (useAuth)
- **useState & useEffect** - Estado local dos componentes

#### **Componentes Customizados**
- **Button System** - Wrapper inteligente do LoadingButton
  - Suporte a roteamento interno (React Router)
  - Suporte a links externos
  - Estados de loading integrados
- **Tabs System** - Sistema de abas baseado em MUI + Context
- **File Upload** - Interface de drag & drop para arquivos
- **Comment Thread** - Sistema de comentários hierárquicos

---

### ⚙️ **Backend (Go)**

#### **Core Language & Runtime**
- **Go 1.18** - Linguagem principal do backend
  - Performance nativa e baixo consumo de memória
  - Concorrência nativa com goroutines
  - Garbage collection automático
  - Compilação para binário único

#### **Web Framework**
- **Chi v5.2.2** - Router HTTP minimalista e performático
  - Middleware pipeline configurável
  - Roteamento RESTful
  - Context propagation
  - Zero dependencies extras

#### **Autenticação e Segurança**
- **JWT (golang-jwt/jwt/v5 5.2.2)** - JSON Web Tokens
  - HS256 signing method
  - Claims customizados (userID, email, exp)
  - Middleware de autenticação automático
- **bcrypt (golang.org/x/crypto)** - Hash seguro de senhas
  - Salt automático
  - Custo configurável
  - Resistente a ataques de força bruta
- **CORS (go-chi/cors v1.2.1)** - Cross-Origin Resource Sharing
  - Headers configurados para desenvolvimento
  - Proteção contra requisições maliciosas

#### **Banco de Dados**
- **MongoDB** - Banco NoSQL principal
  - Esquema flexível para diferentes tipos de conteúdo
  - Agregação pipeline para consultas complexas
  - Índices otimizados para performance
- **MongoDB Go Driver v1.17.4** - Driver oficial
  - Connection pooling automático
  - Context timeouts configuráveis
  - BSON marshaling/unmarshaling

#### **Utilitários e Helpers**
- **UUID (google/uuid v1.6.0)** - Geração de identificadores únicos
  - UUIDs v4 para nomes de arquivos
  - Prevenção de colisões
- **godotenv v1.5.1** - Carregamento de variáveis de ambiente
  - Configuração segura através de .env
  - Separação de configs por ambiente

---

### 🗄️ **Banco de Dados e Persistência**

#### **Estrutura de Dados**
- **Database:** `uspshare`
- **Collections:**
  - `users` - Perfis de usuário e autenticação
  - `resources` - Materiais acadêmicos (PDFs, imagens)
  - `comments` - Sistema de comentários hierárquicos
  - `notifications` - Sistema de notificações em tempo real

#### **Modelos de Dados**
```go
type User struct {
    ID         ObjectID  `json:"id" bson:"_id"`
    Name       string    `json:"name"`
    Email      string    `json:"email"`
    Password   string    `json:"-"` // Nunca retornado em JSON
    Course     string    `json:"course"`
    Faculty    string    `json:"faculty"`
    Stats      UserStats `json:"stats"`
    CreatedAt  time.Time `json:"createdAt"`
}

type Resource struct {
    ID          ObjectID `json:"id" bson:"_id"`
    Title       string   `json:"title"`
    CourseCode  string   `json:"courseCode"`
    FileUrl     string   `json:"fileUrl"`
    Tags        []string `json:"tags"`
    Likes       int      `json:"likes"`
    IsAnonymous bool     `json:"isAnonymous"`
}
```

#### **Índices e Performance**
- **Índice único** no campo email (users)
- **Índices compostos** para consultas de pesquisa
- **TTL indexes** para limpeza automática de dados temporários

---

### 🔐 **Segurança e Autenticação**

#### **Sistema de Autenticação**
- **JWT Stateless** - Tokens auto-contidos sem sessão no servidor
- **Bearer Token** - Padrão Authorization header
- **Token Expiry** - Expiração automática configurável
- **Refresh Token** - Renovação segura de sessões

#### **Proteção de Dados**
- **Password Hashing** - bcrypt com salt automático
- **SQL Injection Prevention** - Uso de BSON para MongoDB
- **XSS Protection** - Sanitização de inputs
- **CORS Configuration** - Controle de acesso cross-origin

#### **Middleware de Segurança**
```go
func AuthMiddleware(next http.Handler) http.Handler {
    // Validação de JWT
    // Extração de claims
    // Context propagation
}
```

---

### 📁 **Sistema de Arquivos e Upload**

#### **Gerenciamento de Arquivos**
- **Multipart Form Data** - Upload de arquivos grandes
- **UUID Naming** - Nomes únicos para prevenir colisões
- **File Type Validation** - Verificação de MIME types
- **Size Limits** - Controle de tamanho de arquivos

#### **Tipos Suportados**
- **Documentos:** PDF, DOC, DOCX
- **Imagens:** PNG, JPG, JPEG, WebP
- **Validação:** Magic bytes verification

#### **Storage System**
```
backend/uploads/
├── 550e8400-e29b-41d4-a716-446655440000.pdf
├── 6ba7b810-9dad-11d1-80b4-00c04fd430c8.png
└── 6ba7b811-9dad-11d1-80b4-00c04fd430c8.jpg
```

---

### 🛠️ **Ferramentas de Desenvolvimento**

#### **Frontend Development**
- **ESLint 9.22.0** - Linter de código com regras customizadas
  - typescript-eslint para TypeScript
  - react-hooks rules para hooks
  - react-refresh para hot reload
- **TypeScript Compiler** - Verificação de tipos em tempo real
- **Vite Dev Server** - Hot reload instantâneo
- **Browser DevTools** - React Developer Tools integration

#### **Backend Development**
- **Air** - Hot reload para Go
  - Recompilação automática em mudanças
  - Configuração customizada via air.toml
- **go mod** - Gerenciamento de dependências
- **Go toolchain** - gofmt, go vet, go build

#### **Build e Deploy**
- **Frontend Build:** TypeScript → ES modules → Bundle otimizado
- **Backend Build:** Go source → Binary nativo
- **Production Ready:** Builds otimizados para performance

---

### 🔄 **Arquitetura e Comunicação**

#### **Arquitetura Geral**
```
Frontend (React) ←→ HTTP/REST ←→ Backend (Go) ←→ MongoDB
     ↓                              ↓
  localStorage              File System (uploads/)
```

#### **API REST Design**
- **RESTful endpoints** com verbos HTTP apropriados
- **JSON** como formato de dados padrão
- **Status codes** consistentes (200, 201, 400, 401, 404, 500)
- **Error responses** padronizados

#### **Comunicação Frontend-Backend**
```typescript
// Axios instance com interceptors
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
});

// Auto-attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
```

---

### 📊 **Funcionalidades e Features**

#### **Sistema Acadêmico**
- **Upload de Materiais** - PDFs, provas, resumos, listas
- **Categorização Inteligente** - Por curso, disciplina, professor
- **Sistema de Tags** - Categorização flexível e busca
- **Busca Avançada** - Filtros múltiplos e ordenação
- **Metadata Rich** - Semestre, professor, tipo de material

#### **Features Sociais**
- **Sistema de Likes** - Avaliação de qualidade do conteúdo
- **Comentários Hierárquicos** - Discussões aninhadas em threads
- **Perfis de Usuário** - Estatísticas personalizadas e gamificação
- **Sistema de Notificações** - Feedback em tempo real
- **Upload Anônimo** - Opção de privacidade

#### **UX/UI Avançado**
- **Design Responsivo** - Mobile-first approach
- **Dark/Light Mode** - Alternância automática de temas
- **Loading States** - Feedback visual em todas as operações
- **Error Handling** - Mensagens de erro user-friendly
- **Infinite Scroll** - Carregamento otimizado de listas

### Backend
- **Go 1.18** - Linguagem principal
- **Chi v5.2.2** - Router HTTP
- **MongoDB** - Banco de dados NoSQL
- **JWT** - Autenticação stateless
- **bcrypt** - Criptografia de senhas
- **Air** - Hot reload para desenvolvimento

## ⚡ Início Rápido

**TL;DR - Para desenvolvedores experientes:**

```bash
# 1. Clone e entre na pasta
git clone <URL_DO_REPOSITORIO>
cd USPShare

# 2. Configure o backend
cd backend
cp env.example .env  # Edite se necessário
go mod download
cd ..

# 3. Configure o frontend
cd uspshare
npm install
cd ..

```

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **[Node.js](https://nodejs.org/)** (versão 18+ recomendada)
- **[Go](https://golang.org/dl/)** (versão 1.18+)
- **[MongoDB](https://www.mongodb.com/try/download/community)** ou acesso a uma instância MongoDB
- **[Git](https://git-scm.com/)**

### Verificando as instalações:
```bash
node --version    # v18.0.0+
npm --version     # v8.0.0+
go version       # go1.18+
mongod --version # v5.0+
```

---

## 🛠️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd USPShare
```

### 2. Configuração do Backend

#### 2.1. Navegue para a pasta do backend
```bash
cd backend
```

#### 2.2. Instale as dependências Go
```bash
go mod download
```

#### 2.3. Configure as variáveis de ambiente
Copie o arquivo de exemplo e configure suas variáveis:
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com suas configurações
nano .env  # ou use seu editor preferido
```

O arquivo `.env` deve conter:
```env
# backend/.env
MONGO_URI=mongodb://localhost:27017/uspshare
JWT_SECRET=sua-chave-secreta-muito-segura-aqui
PORT=8080
```

**⚠️ Importante:** 
- MongoDB Atlas: substitua MONGO_URI pela string de conexão da nuvem
- Produção: use JWT_SECRET forte e única
- Nunca commite o arquivo `.env` para o repositório

### 3. Configuração do Frontend

#### 3.1. Navegue para a pasta do frontend
```bash
cd ../uspshare
```

#### 3.2. Instale as dependências
```bash
npm install
```

### 4. Configuração do Banco de Dados

#### 4.1. Inicie o MongoDB
```bash
# Linux (Ubuntu/Debian)
sudo systemctl start mongod
```

#### 4.2. (Opcional) MongoDB Compass
Conecte-se ao `mongodb://localhost:27017` para visualizar os dados

---

## 🚀 Executando o Projeto

#### Terminal 1 - Backend:
```bash
cd backend

go run main.go
```
*Backend rodando em: `http://localhost:8080`*

#### Terminal 2 - Frontend:
```bash
cd uspshare
npm run dev
```
*Frontend rodando em: `http://localhost:5173`*

### Opção 2: Script Automático
```bash
# Para macOS/Linux
./start.sh
```

---

## 🧹 Reset Completo do Sistema

**Para resetar completamente o sistema:**
```bash
# Reset rápido para desenvolvimento
./quick_reset.sh
```

**O reset remove:**
- ✅ Todos os usuários cadastrados
- ✅ Todos os arquivos enviados
- ✅ Todos os comentários e notificações
- ✅ Dados do banco MongoDB
- ✅ Arquivos da pasta uploads/
- ✅ Arquivos temporários

**Após o reset:** Limpe o localStorage do navegador (F12 → Application → Local Storage)

---

## 📁 Estrutura do Projeto

```
USPShare/
├── backend/                 # 🔧 API Go
│   ├── api/                # HTTP handlers e rotas
│   │   ├── handlers.go     # Lógica de negócio
│   │   ├── middleware.go   # JWT auth, CORS
│   │   └── routes.go       # Definição de rotas
│   ├── config/             # Configurações da aplicação
│   ├── database/           # Conexão e setup MongoDB
│   ├── models/             # Estruturas de dados (User, Resource)
│   ├── store/              # Camada de acesso aos dados
│   ├── uploads/            # 📁 Arquivos enviados pelos usuários
│   ├── go.mod              # Dependências Go
│   ├── air.toml            # Configuração hot reload
│   └── mainp.go            # Ponto de entrada da aplicação
├── uspshare/               # 🎨 Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   │   ├── ui/         # Sistema de design customizado
│   │   │   ├── file-card.tsx
│   │   │   └── CommentThread.tsx
│   │   ├── pages/          # Páginas da aplicação
│   │   │   ├── LandingPage.tsx
│   │   │   ├── ExplorePage.tsx
│   │   │   ├── UploadPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── context/        # Estado global (AuthContext)
│   │   ├── api/            # Cliente HTTP (Axios)
│   │   └── assets/         # Recursos estáticos
│   ├── package.json        # Dependências Node.js
│   ├── vite.config.ts      # Configuração build tool
│   └── tsconfig.json       # Configuração TypeScript
├── quick_reset.sh          # 🧹 Script de reset rápido
├── start.sh                # 🚀 Script de inicialização
└── README.md               # 📖 Este arquivo
```

---

## 🔧 Comandos Úteis

### Backend Commands
```bash
# Desenvolvimento com hot reload
air

# Executar normalmente
go run main.go

# Build para produção
go build -o main main.go

# Instalar nova dependência
go get <package-name>

# Limpar e organizar módulos
go mod tidy
```

### Frontend Commands
```bash
# Servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview

# Linting do código
npm run lint

# Instalar nova dependência
npm install <package-name>

# Atualizar dependências
npm update

# Limpar node_modules
rm -rf node_modules package-lock.json && npm install
```

---

## 🌐 API Endpoints

### 🔐 Autenticação
```http
POST /api/signup              # Cadastro de usuário
POST /api/login               # Login e obtenção de JWT
```

### 📚 Recursos Acadêmicos
```http
GET    /api/resources         # Listar todos os recursos
GET    /api/resource/:id      # Buscar recurso específico
POST   /api/upload           # Upload de arquivo (🔒 protegido)
DELETE /api/resource/:id     # Deletar recurso (🔒 protegido)
```

### 👤 Usuário
```http
GET /api/profile             # Perfil do usuário (🔒 protegido)
PUT /api/profile             # Atualizar perfil (🔒 protegido)
GET /api/user/uploads        # Uploads do usuário (🔒 protegido)
```

### 💬 Comentários
```http
GET  /api/resource/:id/comments    # Comentários de um recurso
POST /api/resource/:id/comments    # Adicionar comentário (🔒 protegido)
PUT  /api/comment/:id              # Editar comentário (🔒 protegido)
DEL  /api/comment/:id              # Deletar comentário (🔒 protegido)
```

### 🔔 Notificações
```http
GET /api/notifications             # Notificações do usuário (🔒 protegido)
PUT /api/notifications/:id/read    # Marcar como lida (🔒 protegido)
```

### 📄 Arquivos Estáticos
```http
GET /uploads/:filename             # Servir arquivos enviados
```

---

## 📱 Funcionalidades Detalhadas

### ✅ **Sistema de Autenticação**
- Cadastro com validação de email USP
- Login seguro com JWT
- Logout com limpeza de tokens
- Sessões persistentes com localStorage

### ✅ **Upload e Gerenciamento de Arquivos**
- Drag & drop interface
- Validação de tipo e tamanho
- Metadata rica (curso, professor, semestre)
- Preview de arquivos PDF
- Sistema de tags flexível

### ✅ **Sistema de Comentários**
- Comentários hierárquicos (threads)
- Respostas aninhadas
- Ordenação por data/relevância
- Notificações de novas respostas

### ✅ **Perfil de Usuário**
- Estatísticas personalizadas
- Histórico de uploads
- Sistema de badges/conquistas
- Configurações de privacidade

### ✅ **Sistema de Busca e Filtros**
- Busca textual avançada
- Filtros por tipo, curso, professor
- Ordenação múltipla
- Resultados paginados

### ✅ **Interface Responsiva**
- Design mobile-first
- Breakpoints otimizados
- Touch-friendly interactions
- Offline indicators

### ✅ **Temas e Acessibilidade**
- Dark/Light mode automático
- High contrast support
- Keyboard navigation
- Screen reader compatibility

---

## 🚨 Troubleshooting

### Problemas Comuns

#### **1. Erro de conexão com MongoDB:**
```
Error loading .env file
panic: Não foi possível conectar ao MongoDB
```
**Soluções:**
- Verifique se MongoDB está rodando: `sudo systemctl status mongod`
- Confirme a MONGO_URI no arquivo `.env`
- Teste conexão: `mongo mongodb://localhost:27017`

#### **2. Erro de CORS:**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Soluções:**
- Verifique se backend está na porta 8080
- Confirme configuração CORS em `mainp.go`
- Teste com `curl -H "Origin: http://localhost:5173" http://localhost:8080/api/resources`

#### **3. Erro de dependências Node.js:**
```
Module not found: Can't resolve '@mui/material'
```
**Soluções:**
```bash
rm -rf node_modules package-lock.json
npm install
```

#### **4. Erro de dependências Go:**
```
go: module not found
```
**Soluções:**
```bash
go mod download
go mod tidy
```

#### **5. Erro de JWT Token:**
```
401 Unauthorized: Invalid token
```
**Soluções:**
- Limpe localStorage: `localStorage.clear()`
- Verifique JWT_SECRET no `.env`
- Refaça login

### Performance Issues

#### **Frontend Loading Slow:**
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Clear cache
rm -rf node_modules/.vite
npm run dev
```

#### **Backend Memory Usage:**
```bash
# Monitor Go process
top -p $(pgrep -f "mainp.go")

# Check Go memory stats
go tool pprof http://localhost:8080/debug/pprof/heap
```

### Debug Logs

#### **Backend Logs:**
```bash
# Detailed logging
export LOG_LEVEL=debug
go run mainp.go
```

#### **Frontend Logs:**
- Abra DevTools (F12) → Console
- Network tab para requests HTTP
- React DevTools para component state

---

## 🔒 Segurança

### Best Practices Implementadas

#### **Backend Security:**
- ✅ JWT com expiração
- ✅ bcrypt para hashing de senhas  
- ✅ CORS configurado
- ✅ Input validation
- ✅ SQL injection prevention (BSON)
- ✅ File type validation
- ✅ Size limits para uploads

#### **Frontend Security:**
- ✅ XSS prevention (React built-in)
- ✅ HTTPS only em produção
- ✅ Sanitização de inputs
- ✅ Token storage seguro
- ✅ CSP headers

#### **Infrastructure Security:**
- ✅ Environment variables para secrets
- ✅ MongoDB authentication
- ✅ Rate limiting (future)
- ✅ Audit logs (future)

---

## 🚀 Deployment

### Build de Produção

#### **Frontend:**
```bash
cd uspshare
npm run build
# Output: dist/ folder
```

#### **Backend:**
```bash
cd backend
go build -o uspshare-api mainp.go
# Output: uspshare-api binary
```

### Environment Setup

#### **Production .env:**
```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/uspshare
JWT_SECRET=super-secure-secret-key-256-bits
PORT=8080
NODE_ENV=production
```

---

### Logs de Debug

Para ver logs detalhados:
- **Backend**: Os logs aparecem no terminal onde você executou `air` ou `go run`
- **Frontend**: Abra o DevTools do navegador (F12) e veja o Console

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido com ❤️ para a comunidade USP**
