package api

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"
	"uspshare/config"
	"uspshare/database"
	"uspshare/models"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

var testRouter *chi.Mux
var testDBClient *mongo.Client

// TestMain é a função de setup para todos os testes neste pacote.
func TestMain(m *testing.M) {
	// Carrega o .env do diretório raiz do projeto
	if err := godotenv.Load("../.env"); err != nil {
		log.Fatal("Erro: não foi possível carregar o arquivo .env. Certifique-se que ele está na raiz do projeto.")
	}

	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Fatal("MONGO_URI não está definida no arquivo .env")
	}

	// Conecta a um banco de dados de TESTE para evitar sujar o de desenvolvimento
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatalf("Erro ao conectar ao MongoDB para testes: %v", err)
	}
	testDBClient = client

	// Aponta as coleções do pacote 'database' para o banco de dados de TESTE
	testDatabase := testDBClient.Database("uspshare_test")
	database.UserCollection = testDatabase.Collection("users")
	database.ResourceCollection = testDatabase.Collection("resources")
	database.CommentCollection = testDatabase.Collection("comments")
	database.LikeCollection = testDatabase.Collection("likes")
	database.CommentLikeCollection = testDatabase.Collection("comment_likes")
	database.TagCollection = testDatabase.Collection("tags")
	database.CourseCollection = testDatabase.Collection("courses")
	database.ProfessorCollection = testDatabase.Collection("professors")
	database.NotificationCollection = testDatabase.Collection("notifications")

	log.Println("Conectado ao banco de dados de teste 'uspshare_test' com sucesso!")

	// Configura o roteador com todas as rotas da aplicação
	testRouter = chi.NewRouter()
	RegisterRoutes(testRouter)

	// Executa todos os testes
	exitCode := m.Run()

	// Limpeza: apaga o banco de dados de teste e desconecta
	log.Println("Limpando e desconectando o banco de dados de teste...")
	if err := testDatabase.Drop(context.Background()); err != nil {
		log.Printf("Aviso: não foi possível apagar o banco de dados de teste: %v", err)
	}
	testDBClient.Disconnect(context.Background())

	os.Exit(exitCode)
}

// =================================
//  HELPERS
// =================================

// clearDatabase limpa todas as coleções para garantir isolamento entre os testes.
func clearDatabase(t *testing.T) {
	collections := []string{
		"users", "resources", "comments", "likes",
		"comment_likes", "tags", "courses", "professors", "notifications",
	}
	for _, c := range collections {
		_, err := testDBClient.Database("uspshare_test").Collection(c).DeleteMany(context.Background(), bson.M{})
		if err != nil {
			t.Fatalf("Falha ao limpar a coleção %s: %v", c, err)
		}
	}
}

// createTestUser cria um usuário com um papel específico (role) diretamente no banco.
func createTestUser(t *testing.T, name, email, password, role string) *models.User {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	assert.NoError(t, err, "Falha ao gerar hash da senha")

	user := &models.User{
		ID:        primitive.NewObjectID(),
		Name:      name,
		Email:     email,
		Password:  string(hashedPassword),
		Role:      role, // "user" ou "admin"
		CreatedAt: time.Now(),
	}

	_, err = database.UserCollection.InsertOne(context.Background(), user)
	assert.NoError(t, err, "Falha ao inserir usuário de teste no banco")

	return user
}

// generateTestToken cria um token JWT válido para um determinado ID de usuário.
func generateTestToken(t *testing.T, userID primitive.ObjectID) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": userID.Hex(),
		"exp":    time.Now().Add(time.Hour).Unix(),
	})
	tokenString, err := token.SignedString(config.JWT_SECRET)
	assert.NoError(t, err, "Falha ao assinar o token de teste")
	return "Bearer " + tokenString
}

// createTestResource cria um recurso no banco para ser usado em testes.
func createTestResource(t *testing.T, userID primitive.ObjectID, title string) *models.Resource {
	resource := &models.Resource{
		ID:          primitive.NewObjectID(),
		UserID:      userID,
		Title:       title,
		CourseCode:  "MAC0110",
		Description: "Descrição de teste",
		UploadDate:  time.Now(),
	}
	_, err := database.ResourceCollection.InsertOne(context.Background(), resource)
	assert.NoError(t, err)
	return resource
}

// =================================
//  TESTS
// =================================

func TestHandleSignup(t *testing.T) {
	clearDatabase(t)

	t.Run("Cadastro com sucesso", func(t *testing.T) {
		payload := map[string]string{
			"name":     "Novo Usuário",
			"email":    "novo@email.com",
			"password": "senhaforte123",
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("POST", "/api/signup", bytes.NewBuffer(body))
		rr := httptest.NewRecorder()
		testRouter.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusCreated, rr.Code, "O status code deveria ser 201 Created")

		// Verifica se o usuário foi realmente criado no banco
		var user models.User
		err := database.UserCollection.FindOne(context.Background(), bson.M{"email": "novo@email.com"}).Decode(&user)
		assert.NoError(t, err, "O usuário deveria existir no banco de dados")
		assert.Equal(t, "Novo Usuário", user.Name)
	})

	t.Run("Falha ao cadastrar com e-mail já existente", func(t *testing.T) {
		createTestUser(t, "Usuário Existente", "existente@email.com", "senha123", "user")

		payload := map[string]string{
			"name":     "Outro Usuário",
			"email":    "existente@email.com", // E-mail repetido
			"password": "outrasenha",
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("POST", "/api/signup", bytes.NewBuffer(body))
		rr := httptest.NewRecorder()
		testRouter.ServeHTTP(rr, req)

		// A lógica atual retorna 500, o que é aceitável, mas um 409 Conflict seria mais semântico.
		assert.Equal(t, http.StatusInternalServerError, rr.Code, "O status code deveria ser 500 para e-mail duplicado")
	})

	t.Run("Falha ao cadastrar com campos faltando", func(t *testing.T) {
		payload := map[string]string{
			"name":  "Usuário Incompleto",
			"email": "incompleto@email.com",
			// Senha faltando
		}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("POST", "/api/signup", bytes.NewBuffer(body))
		rr := httptest.NewRecorder()
		testRouter.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusBadRequest, rr.Code, "O status code deveria ser 400 Bad Request")
	})
}

func TestHandleLogin(t *testing.T) {
	clearDatabase(t)
	user := createTestUser(t, "Login Test", "login@test.com", "senha123", "user")

	t.Run("Login com sucesso", func(t *testing.T) {
		payload := map[string]string{"email": user.Email, "password": "senha123"}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("POST", "/api/login", bytes.NewBuffer(body))
		rr := httptest.NewRecorder()
		testRouter.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusOK, rr.Code, "O status code deveria ser 200 OK")

		var resp map[string]interface{}
		json.Unmarshal(rr.Body.Bytes(), &resp)
		assert.NotEmpty(t, resp["token"], "A resposta deveria conter um token JWT")
	})

	t.Run("Login com senha incorreta", func(t *testing.T) {
		payload := map[string]string{"email": user.Email, "password": "senha_errada"}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("POST", "/api/login", bytes.NewBuffer(body))
		rr := httptest.NewRecorder()
		testRouter.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusUnauthorized, rr.Code, "O status code deveria ser 401 Unauthorized")
	})
}

func TestHandleUploadResource(t *testing.T) {
	clearDatabase(t)
	user := createTestUser(t, "Uploader", "uploader@test.com", "senha123", "user")
	token := generateTestToken(t, user.ID)

	t.Run("Upload com sucesso", func(t *testing.T) {
		body := new(bytes.Buffer)
		writer := multipart.NewWriter(body)

		// Adiciona campos do formulário
		_ = writer.WriteField("title", "Meu Primeiro Upload de Teste")
		_ = writer.WriteField("description", "Uma descrição detalhada.")
		_ = writer.WriteField("courseCode", "BCC021")
		_ = writer.WriteField("tags", `["prova", "p1"]`)

		// Adiciona o arquivo
		part, err := writer.CreateFormFile("file", "teste.pdf")
		assert.NoError(t, err)
		part.Write([]byte("conteúdo do pdf de teste"))
		writer.Close()

		req := httptest.NewRequest("POST", "/api/upload", body)
		req.Header.Set("Authorization", token)
		req.Header.Set("Content-Type", writer.FormDataContentType())

		rr := httptest.NewRecorder()
		testRouter.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusCreated, rr.Code, "O status code deveria ser 201 Created")

		// Verifica se o recurso foi criado no banco
		var resource models.Resource
		err = database.ResourceCollection.FindOne(context.Background(), bson.M{"title": "Meu Primeiro Upload de Teste"}).Decode(&resource)
		assert.NoError(t, err, "O recurso deveria existir no banco de dados")
		assert.Equal(t, user.ID, resource.UserID)
		assert.Contains(t, resource.Tags, "prova")
	})

	t.Run("Falha no upload sem autenticação", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/upload", nil) // Sem corpo e sem token
		rr := httptest.NewRecorder()
		testRouter.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusUnauthorized, rr.Code, "O status code deveria ser 401 Unauthorized")
	})
}

func TestHandleDeleteResource(t *testing.T) {
	clearDatabase(t)
	owner := createTestUser(t, "Dono", "owner@test.com", "senha123", "user")
	anotherUser := createTestUser(t, "Outro", "another@test.com", "senha123", "user")
	resource := createTestResource(t, owner.ID, "Recurso para Deletar")

	ownerToken := generateTestToken(t, owner.ID)
	anotherUserToken := generateTestToken(t, anotherUser.ID)

	t.Run("Falha ao deletar recurso de outro usuário", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/api/resource/"+resource.ID.Hex(), nil)
		req.Header.Set("Authorization", anotherUserToken) // Tentando deletar com o token de outro usuário
		rr := httptest.NewRecorder()
		testRouter.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusForbidden, rr.Code, "O status code deveria ser 403 Forbidden")
	})

	t.Run("Sucesso ao deletar próprio recurso", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/api/resource/"+resource.ID.Hex(), nil)
		req.Header.Set("Authorization", ownerToken)
		rr := httptest.NewRecorder()
		testRouter.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusOK, rr.Code, "O status code deveria ser 200 OK")

		// Verifica se o recurso foi removido do banco
		count, err := database.ResourceCollection.CountDocuments(context.Background(), bson.M{"_id": resource.ID})
		assert.NoError(t, err)
		assert.Equal(t, int64(0), count, "O recurso não deveria mais existir no banco")
	})
}

func TestAdminRoutes(t *testing.T) {
	clearDatabase(t)
	adminUser := createTestUser(t, "Admin", "admin@test.com", "admin123", "admin")
	regularUser := createTestUser(t, "Regular", "regular@test.com", "user123", "user")

	adminToken := generateTestToken(t, adminUser.ID)
	regularToken := generateTestToken(t, regularUser.ID)

	t.Run("Usuário normal não pode criar tags", func(t *testing.T) {
		payload := map[string]string{"name": "Tag Proibida"}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("POST", "/api/admin/tags", bytes.NewBuffer(body))
		req.Header.Set("Authorization", regularToken)
		req.Header.Set("Content-Type", "application/json")

		rr := httptest.NewRecorder()
		testRouter.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusForbidden, rr.Code, "Usuário normal não deveria acessar rotas de admin")
	})

	t.Run("Admin pode criar tags", func(t *testing.T) {
		payload := map[string]string{"name": "Tag de Admin"}
		body, _ := json.Marshal(payload)
		req := httptest.NewRequest("POST", "/api/admin/tags", bytes.NewBuffer(body))
		req.Header.Set("Authorization", adminToken)
		req.Header.Set("Content-Type", "application/json")

		rr := httptest.NewRecorder()
		testRouter.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusCreated, rr.Code, "Admin deveria conseguir criar tags")

		// Verifica se a tag foi criada no banco
		count, err := database.TagCollection.CountDocuments(context.Background(), bson.M{"name": "Tag de Admin"})
		assert.NoError(t, err)
		assert.Equal(t, int64(1), count, "A tag deveria ter sido criada no banco")
	})
}

// =================================
//  TESTS PARA MIDDLEWARE
// =================================

func TestAuthMiddleware(t *testing.T) {
	clearDatabase(t)
	user := createTestUser(t, "Auth Test User", "auth@test.com", "senha123", "user")

	// Handler "dummy" que será chamado se o middleware passar.
	dummyHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verifica se o ID do usuário foi corretamente adicionado ao contexto.
		userIDFromContext := r.Context().Value(userContextKey)
		assert.NotNil(t, userIDFromContext, "O ID do usuário deveria estar no contexto")
		assert.Equal(t, user.ID.Hex(), userIDFromContext.(string), "O ID do usuário no contexto está incorreto")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Aplica o middleware ao nosso handler dummy
	handlerToTest := AuthMiddleware(dummyHandler)

	t.Run("Sucesso com token válido", func(t *testing.T) {
		token := generateTestToken(t, user.ID)
		req := httptest.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", token)
		rr := httptest.NewRecorder()

		handlerToTest.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusOK, rr.Code, "O handler deveria ser alcançado com um token válido")
		assert.Equal(t, "OK", rr.Body.String())
	})

	t.Run("Falha sem header de autorização", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/protected", nil) // Sem header
		rr := httptest.NewRecorder()
		handlerToTest.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusUnauthorized, rr.Code, "Deveria retornar 401 sem header de autorização")
	})

	t.Run("Falha com formato de token inválido", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "NotBearer some-token") // Formato errado
		rr := httptest.NewRecorder()
		handlerToTest.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusUnauthorized, rr.Code, "Deveria retornar 401 com formato de token inválido")
	})

	t.Run("Falha com token inválido/expirado", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/protected", nil)
		req.Header.Set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c") // Token com assinatura inválida
		rr := httptest.NewRecorder()
		handlerToTest.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusUnauthorized, rr.Code, "Deveria retornar 401 com token inválido")
	})
}

func TestAdminMiddleware(t *testing.T) {
	clearDatabase(t)
	adminUser := createTestUser(t, "Admin User", "admin-mid@test.com", "senha123", "admin")
	regularUser := createTestUser(t, "Regular User", "regular-mid@test.com", "senha123", "user")

	dummyHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Admin Acessou"))
	})

	// O AdminMiddleware roda depois do AuthMiddleware.
	// Então, para testá-lo, precisamos primeiro passar o request pelo AuthMiddleware.
	handlerToTest := AuthMiddleware(AdminMiddleware(dummyHandler))

	t.Run("Sucesso com usuário admin", func(t *testing.T) {
		token := generateTestToken(t, adminUser.ID)
		req := httptest.NewRequest("GET", "/admin-only", nil)
		req.Header.Set("Authorization", token)
		rr := httptest.NewRecorder()

		handlerToTest.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusOK, rr.Code, "Admin deveria ter acesso")
		assert.Equal(t, "Admin Acessou", rr.Body.String())
	})

	t.Run("Falha com usuário normal", func(t *testing.T) {
		token := generateTestToken(t, regularUser.ID)
		req := httptest.NewRequest("GET", "/admin-only", nil)
		req.Header.Set("Authorization", token)
		rr := httptest.NewRecorder()

		handlerToTest.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusForbidden, rr.Code, "Usuário normal não deveria ter acesso")
	})
}
