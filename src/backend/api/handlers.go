package api

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
	"uspshare/config"
	"uspshare/models"
	"uspshare/store"

	"io"
	"os"
	"path/filepath"

	"github.com/google/uuid"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"

	"github.com/golang-jwt/jwt/v5"
)

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func HandleSignup(w http.ResponseWriter, r *http.Request) {
	// 1. Usar uma struct SÓ para a requisição, que pode receber a senha.
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Requisição inválida"})
		return
	}

	// Adicione validações aqui se desejar (campos vazios, etc)
	if req.Name == "" || req.Email == "" || req.Password == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Nome, e-mail e senha são obrigatórios."})
		return
	}

	// Log para confirmar que a senha foi recebida corretamente
	log.Printf("Cadastrando usuário '%s' com a senha de %d caracteres.", req.Email, len(req.Password))

	// 2. Criar a nossa struct 'models.User' para passar para a camada de store.
	// A função store.CreateUser será responsável por fazer o hash da senha.
	user := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: req.Password, // Passando a senha em texto plano para a próxima camada
	}

	// 3. Chamar a função do store com os dados corretos
	if err := store.CreateUser(&user); err != nil {
		// No futuro, você pode adicionar um tratamento para erro de email duplicado aqui
		// if mongo.IsDuplicateKeyError(err) { ... }
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Não foi possível criar o usuário"})
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{"message": "Usuário criado com sucesso"})
}

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Requisição inválida"})
		return
	}

	// --- LOG DE DEBUG 1: VERIFICA O QUE FOI RECEBIDO ---
	log.Printf("Recebida tentativa de login para o email: '%s'", req.Email)

	user, err := store.GetUserByEmail(req.Email)
	if err != nil {
		// --- LOG DE DEBUG 2: O USUÁRIO NÃO FOI ENCONTRADO ---
		log.Printf("ERRO: Usuário com email '%s' não foi encontrado no banco de dados.", req.Email)
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Credenciais inválidas"})
		return
	}

	// --- LOG DE DEBUG 3: O USUÁRIO FOI ENCONTRADO ---
	log.Println("Usuário encontrado. Verificando a senha...")

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		// --- LOG DE DEBUG 4: A SENHA ESTÁ INCORRETA ---
		log.Println("ERRO: A senha fornecida NÃO BATE com o hash salvo no banco.")
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Credenciais inválidas"})
		return
	}

	// --- LOG DE DEBUG 5: SUCESSO! ---
	log.Println("Senha correta! Gerando token JWT...")

	// Gerar Token JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": user.ID,
		"exp":    time.Now().Add(time.Hour * 24).Unix(), // Token expira em 24 horas
	})

	tokenString, err := token.SignedString(config.JWT_SECRET)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Não foi possível gerar o token"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"token": tokenString,
		"user": map[string]any{
			"name":    user.Name,
			"email":   user.Email,
			"initial": string(user.Name[0]),
		},
	})
}

func HandleListResources(w http.ResponseWriter, r *http.Request) {
	resources, err := store.ListResources()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Não foi possível buscar os recursos"})
		return
	}
	writeJSON(w, http.StatusOK, resources)
}

func HandleGetProfile(w http.ResponseWriter, r *http.Request) {
	// Pega o userId que o middleware colocou no contexto
	userIDHex, ok := r.Context().Value(userContextKey).(string)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}
	userID, _ := primitive.ObjectIDFromHex(userIDHex)

	user, err := store.GetUserByID(userID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "User not found"})
		return
	}

	uploadsCount, _ := store.CountUserUploads(userID)

	// Preenche os dados
	user.AvatarURL = "https://i.pravatar.cc/150?u=" + user.Email
	user.Bio = "Estudante da USP. Bio a ser preenchida."
	user.Course = "Engenharia (a ser preenchido)"
	user.Faculty = "Instituto (a ser preenchido)"
	user.YearJoined = "2022"
	user.Badges = []string{"Novo Membro"}
	user.Stats = models.UserStats{Uploads: int(uploadsCount), Likes: 0, Comments: 0, Reputation: 10}

	writeJSON(w, http.StatusOK, user)
}

func HandleGetUserUploads(w http.ResponseWriter, r *http.Request) {
	userIDHex, ok := r.Context().Value(userContextKey).(string)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}
	userID, _ := primitive.ObjectIDFromHex(userIDHex)

	resources, err := store.GetResourcesByUserID(userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to get user uploads"})
		return
	}

	writeJSON(w, http.StatusOK, resources)
}

func HandleUploadResource(w http.ResponseWriter, r *http.Request) {
	// 1. Obter o ID do usuário do token (colocado pelo middleware)
	userIDHex, ok := r.Context().Value(userContextKey).(string)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}
	userID, _ := primitive.ObjectIDFromHex(userIDHex)

	// 2. Parse do formulário multipart (limite de 10MB para o upload)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "File too large"})
		return
	}

	// 3. Obter o arquivo da requisição
	file, handler, err := r.FormFile("file") // "file" deve ser o nome do campo no frontend
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid file field"})
		return
	}
	defer file.Close()

	// 4. Gerar um nome de arquivo único para evitar colisões
	uniqueFileName := uuid.New().String() + filepath.Ext(handler.Filename)
	filePath := filepath.Join("uploads", uniqueFileName)

	// 5. Criar o arquivo no servidor e salvar o conteúdo
	dst, err := os.Create(filePath)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to save file"})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to copy file content"})
		return
	}

	// 6. Criar o objeto Resource para salvar no banco
	// Os campos do formulário são acessados com r.FormValue()
	tagsJSON := r.FormValue("tags")
	var tags []string
	// Decodifica a string JSON de tags em um slice de strings
	if err := json.Unmarshal([]byte(tagsJSON), &tags); err != nil {
		// Se falhar, podemos simplesmente ignorar as tags ou logar o erro
		log.Printf("Erro ao decodificar tags: %v", err)
	}

	resource := models.Resource{
		ID:          primitive.NewObjectID(),
		UserID:      userID,
		Title:       r.FormValue("title"),
		Description: r.FormValue("description"),
		Course:      r.FormValue("course"),
		CourseCode:  r.FormValue("courseCode"),
		Type:        r.FormValue("fileType"),
		Professor:   r.FormValue("professor"),
		Semester:    r.FormValue("semester"),
		IsAnonymous: r.FormValue("isAnonymous") == "true",
		Tags:        tags,
		FileName:    handler.Filename,
		FileUrl:     "/" + filePath,
		UploadDate:  time.Now(),
		Likes:       0,
	}

	// 7. Salvar os metadados no MongoDB (você precisará criar a função store.CreateResource)
	if err := store.CreateResource(&resource); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to save resource metadata"})
		return
	}

	writeJSON(w, http.StatusCreated, resource)
}

func HandleGetResources(w http.ResponseWriter, r *http.Request) {
	resources, err := store.ListResources()
	if err != nil {
		// Se houver um erro ao buscar no banco, retornamos um erro de servidor
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch resources"})
		return
	}

	// Se tudo deu certo, enviamos a lista de recursos com status 200 OK
	writeJSON(w, http.StatusOK, resources)
}
