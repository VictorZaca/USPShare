package api

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"
	"uspshare/badge"
	"uspshare/config"
	"uspshare/database"
	"uspshare/models"
	"uspshare/store"

	"io"
	"os"
	"path/filepath"

	"github.com/google/uuid"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/sync/errgroup"

	"github.com/go-chi/chi/v5"
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

	// 1. Busca os dados principais do usuário (que agora incluem bio, curso, avatarUrl, etc.)
	user, err := store.GetUserByID(userID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "User not found"})
		return
	}

	// 2. Busca as estatísticas reais que já implementamos
	uploadsCount, _ := store.CountUserUploads(userID)
	commentsCount, _ := store.CountUserComments(userID)

	// 3. Monta o objeto de estatísticas
	// Removemos os dados mockados e confiamos nos dados do banco.
	// Likes e Reputation continuam como placeholder por enquanto.
	user.Stats = models.UserStats{
		Uploads:    int(uploadsCount),
		Likes:      0, // TODO: Implementar lógica de contagem de likes
		Comments:   int(commentsCount),
		Reputation: 0, // TODO: Implementar lógica de reputação
	}

	earnedBadges := badge.EvaluateBadges(user.Stats)
	// 3. Atribui a lista de badges conquistadas ao objeto do usuário
	user.Badges = earnedBadges

	// Se o usuário ainda não tiver um avatar, podemos definir um padrão aqui
	if user.AvatarURL == "" {
		// Isso pode ser uma URL de um avatar padrão no seu frontend ou um serviço externo
		user.AvatarURL = "https://i.pravatar.cc/150?u=" + user.Email
	}

	// 4. Envia o objeto 'user' completo, com os dados reais do banco.
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
		Semester:    r.FormValue("semester"),
		IsAnonymous: r.FormValue("isAnonymous") == "true",
		Tags:        tags,
		FileName:    handler.Filename,
		FileUrl:     "/" + filePath,
		UploadDate:  time.Now(),
		Likes:       0,
	}
	professorIDHex := r.FormValue("professorId")
	if professorIDHex != "" {
		profID, err := primitive.ObjectIDFromHex(professorIDHex)
		if err == nil {
			resource.ProfessorID = &profID
		}
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

func HandleGetResourceByID(w http.ResponseWriter, r *http.Request) {
	// Pega o ID da URL. Ex: /api/resource/60d...
	idParam := chi.URLParam(r, "id") // Para Chi. Se for Fiber, seria c.Params("id")
	objID, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid resource ID"})
		return
	}

	resourceData, err := store.GetResourceByID(objID)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "Resource not found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch resource"})
		return
	}

	writeJSON(w, http.StatusOK, resourceData)
}

func HandleListComments(w http.ResponseWriter, r *http.Request) {
	resourceIDHex := chi.URLParam(r, "id")
	resourceID, _ := primitive.ObjectIDFromHex(resourceIDHex)

	comments, err := store.GetCommentsByResourceID(resourceID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch comments"})
		return
	}

	writeJSON(w, http.StatusOK, comments)
}

// HandlePostComment cria um novo comentário. Rota protegida.
func HandlePostComment(w http.ResponseWriter, r *http.Request) {
	// Pega o ID do recurso da URL
	resourceIDHex := chi.URLParam(r, "id")
	resourceID, _ := primitive.ObjectIDFromHex(resourceIDHex)

	// Pega o ID do usuário do token
	userIDHex, _ := r.Context().Value(userContextKey).(string)
	userID, _ := primitive.ObjectIDFromHex(userIDHex)

	// Define uma struct para decodificar o corpo da requisição
	var req struct {
		Content  string `json:"content"`
		ParentID string `json:"parentId,omitempty"` // Esperamos receber o parentId aqui
	}

	// Decodifica o JSON que o frontend enviou
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Content == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Comment content is required"})
		return
	}

	// --- LOG DE DEBUG 1: O QUE O BACKEND RECEBEU? ---
	log.Printf("Recebido pedido para postar comentário. Conteúdo: '%s', ParentID recebido: '%s'", req.Content, req.ParentID)

	// Cria a base do nosso novo comentário
	comment := models.Comment{
		ID:         primitive.NewObjectID(),
		ResourceID: resourceID,
		UserID:     userID,
		Content:    req.Content,
		CreatedAt:  time.Now(),
	}

	// --- LÓGICA CRÍTICA: Atribui o ParentID se ele for válido ---
	if req.ParentID != "" {
		parentObjID, err := primitive.ObjectIDFromHex(req.ParentID)
		if err != nil {
			// --- LOG DE DEBUG 3: CONFIRMAÇÃO ---
			log.Printf("ParentID recebido ('%s') é inválido. Criando como comentário principal.", req.ParentID)
		} else {
			// --- LOG DE DEBUG 2: CONFIRMAÇÃO ---
			log.Printf("ParentID '%s' é válido. Anexando ao comentário.", req.ParentID)
			comment.ParentID = &parentObjID // Atribui o ponteiro do ID
		}
	} else {
		// --- LOG DE DEBUG 3: CONFIRMAÇÃO ---
		log.Printf("ParentID recebido ('%s') é inválido ou vazio. Criando como comentário principal.", req.ParentID)
	}

	if err := store.CreateComment(&comment); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to post comment"})
		return
	}

	if comment.ParentID != nil {
		parentComment, err := store.GetCommentByID(*comment.ParentID)
		if err == nil && parentComment.UserID != comment.UserID {
			actor, _ := store.GetUserByID(comment.UserID)

			notification := models.Notification{
				ID:         primitive.NewObjectID(),
				UserID:     parentComment.UserID,
				ActorName:  actor.Name,
				Type:       "reply",
				Message:    "respondeu ao seu comentário.",
				ResourceID: comment.ResourceID,
				CommentID:  comment.ID,
				IsRead:     false,
				CreatedAt:  time.Now(),
			}
			store.CreateNotification(&notification)
		}
	}

	newCommentData, err := store.GetCommentWithAuthorByID(comment.ID)
	if err != nil {
		// Se falhar em buscar por algum motivo, retorna um erro.
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Comment posted, but failed to retrieve it"})
		return
	}

	// Se deu tudo certo, retorna o objeto completo do novo comentário.
	writeJSON(w, http.StatusCreated, newCommentData)
}

func HandleGetNotifications(w http.ResponseWriter, r *http.Request) {
	// Pega o ID do usuário que o AuthMiddleware colocou no contexto
	userIDHex, ok := r.Context().Value(userContextKey).(string)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}
	userID, _ := primitive.ObjectIDFromHex(userIDHex)

	notifications, err := store.GetNotificationsByUserID(userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch notifications"})
		return
	}

	writeJSON(w, http.StatusOK, notifications)
}

// HandleMarkNotificationAsRead marca uma notificação específica como lida.
func HandleMarkNotificationAsRead(w http.ResponseWriter, r *http.Request) {
	// Pega o ID da notificação da URL (ex: /api/notifications/SEU_ID/read)
	notificationIDHex := chi.URLParam(r, "id")
	notificationID, err := primitive.ObjectIDFromHex(notificationIDHex)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid notification ID"})
		return
	}

	// Pega o ID do usuário do token para segurança
	userIDHex, _ := r.Context().Value(userContextKey).(string)
	userID, _ := primitive.ObjectIDFromHex(userIDHex)

	err = store.MarkNotificationAsRead(notificationID, userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to mark notification as read"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Notification marked as read"})
}

func HandleUpdateProfile(w http.ResponseWriter, r *http.Request) {
	userIDHex, _ := r.Context().Value(userContextKey).(string)
	userID, _ := primitive.ObjectIDFromHex(userIDHex)

	var req struct {
		Name    string `json:"name"`
		Course  string `json:"course"`
		Faculty string `json:"faculty"`
		Bio     string `json:"bio"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	log.Printf("Atualizando perfil do usuário %s: %+v", userIDHex, req)

	update := bson.M{
		"$set": bson.M{
			"name":    req.Name,
			"course":  req.Course,
			"faculty": req.Faculty,
			"bio":     req.Bio,
		},
	}

	if err := store.UpdateUserByID(userID, update); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update profile"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Profile updated successfully"})
}

// HandleUpdateAvatar lida com o upload da imagem de avatar do usuário.
func HandleUpdateAvatar(w http.ResponseWriter, r *http.Request) {
	userIDHex, _ := r.Context().Value(userContextKey).(string)
	userID, _ := primitive.ObjectIDFromHex(userIDHex)

	r.ParseMultipartForm(2 << 20) // Limite de 2MB
	file, handler, err := r.FormFile("avatar")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid avatar file field"})
		return
	}
	defer file.Close()

	// Salva o avatar em uma subpasta para organização
	avatarFileName := userID.Hex() + filepath.Ext(handler.Filename)
	avatarPath := filepath.Join("uploads", "avatars", avatarFileName)

	// Garante que o diretório de avatares exista
	os.MkdirAll(filepath.Dir(avatarPath), os.ModePerm)

	dst, _ := os.Create(avatarPath)
	defer dst.Close()
	io.Copy(dst, file)

	avatarUrl := "/uploads/avatars/" + avatarFileName

	// Atualiza a URL do avatar no banco de dados
	update := bson.M{"$set": bson.M{"avatarUrl": avatarUrl}}
	if err := store.UpdateUserByID(userID, update); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to update avatar URL"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"avatarUrl": avatarUrl})
}

func HandleGetTags(w http.ResponseWriter, r *http.Request) {
	tags, err := store.GetDistinctFieldValues("tags")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch tags"})
		return
	}
	writeJSON(w, http.StatusOK, tags)
}

func HandleListTags(w http.ResponseWriter, r *http.Request) {
	tags, err := store.ListTags()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch tags"})
		return
	}
	writeJSON(w, http.StatusOK, tags)
}

func HandleCreateTag(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Name == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Tag name is required"})
		return
	}
	tag := models.Tag{ID: primitive.NewObjectID(), Name: req.Name}
	if err := store.CreateTag(&tag); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create tag"})
		return
	}
	writeJSON(w, http.StatusCreated, tag)
}

func HandleDeleteTag(w http.ResponseWriter, r *http.Request) {
	id, _ := primitive.ObjectIDFromHex(chi.URLParam(r, "id"))
	if err := store.DeleteTagByID(id); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to delete tag"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Tag deleted successfully"})
}

// --- Handlers para Courses ---

func HandleListCourses(w http.ResponseWriter, r *http.Request) {
	courses, err := store.ListCourses()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch courses"})
		return
	}
	writeJSON(w, http.StatusOK, courses)
}

func HandleCreateCourse(w http.ResponseWriter, r *http.Request) {
	var req models.Course
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Name == "" || req.Code == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Course name and code are required"})
		return
	}
	req.ID = primitive.NewObjectID()
	if err := store.CreateCourse(&req); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create course"})
		return
	}
	writeJSON(w, http.StatusCreated, req)
}

func HandleDeleteCourse(w http.ResponseWriter, r *http.Request) {
	id, _ := primitive.ObjectIDFromHex(chi.URLParam(r, "id"))
	if err := store.DeleteCourseByID(id); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to delete course"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Course deleted successfully"})
}

// --- Handlers para Professors ---

func HandleListProfessors(w http.ResponseWriter, r *http.Request) {
	profs, err := store.ListProfessors()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch professors"})
		return
	}
	writeJSON(w, http.StatusOK, profs)
}

func HandleCreateProfessor(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(2 << 20); err != nil { // Limite de 2MB
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Request too large"})
		return
	}
	name := r.FormValue("name")
	if name == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Professor name is required"})
		return
	}
	professor := models.Professor{ID: primitive.NewObjectID(), Name: name}
	file, handler, err := r.FormFile("avatar")
	if err == nil {
		defer file.Close()
		avatarFileName := professor.ID.Hex() + filepath.Ext(handler.Filename)
		avatarPath := filepath.Join("uploads", "avatars", avatarFileName)
		os.MkdirAll(filepath.Dir(avatarPath), os.ModePerm)
		dst, _ := os.Create(avatarPath)
		defer dst.Close()
		io.Copy(dst, file)
		professor.AvatarURL = "/uploads/avatars/" + avatarFileName
	}
	if err := store.CreateProfessor(&professor); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create professor"})
		return
	}
	writeJSON(w, http.StatusCreated, professor)
}

func HandleDeleteProfessor(w http.ResponseWriter, r *http.Request) {
	id, _ := primitive.ObjectIDFromHex(chi.URLParam(r, "id"))
	// Bônus: aqui você também poderia deletar o arquivo de imagem do avatar do sistema de arquivos.
	if err := store.DeleteProfessorByID(id); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to delete professor"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Professor deleted successfully"})
}

func HandleSearchUsers(w http.ResponseWriter, r *http.Request) {
	// Pega o termo de busca da query string (ex: /api/users/search?q=enzo)
	query := r.URL.Query().Get("q")

	userIDHex, _ := r.Context().Value(userContextKey).(string)
	userID, _ := primitive.ObjectIDFromHex(userIDHex)

	users, err := store.SearchUsersByNameOrEmail(query, userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to search users"})
		return
	}

	writeJSON(w, http.StatusOK, users)
}

// HandleShareResource cria a notificação de compartilhamento.
func HandleShareResource(w http.ResponseWriter, r *http.Request) {
	senderIDHex, _ := r.Context().Value(userContextKey).(string)
	senderID, _ := primitive.ObjectIDFromHex(senderIDHex)

	resourceIDHex := chi.URLParam(r, "id")
	resourceID, _ := primitive.ObjectIDFromHex(resourceIDHex)

	var req struct {
		RecipientID string `json:"recipientId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		return
	}
	recipientID, _ := primitive.ObjectIDFromHex(req.RecipientID)

	// Busca os dados necessários para criar a notificação
	sender, _ := store.GetUserByID(senderID)
	resource, _ := store.GetResourceByID(resourceID) // Usamos a GetResourceByID que retorna bson.M

	notification := models.Notification{
		ID:         primitive.NewObjectID(),
		UserID:     recipientID, // A notificação é PARA o destinatário
		ActorName:  sender.Name, // O ator é quem enviou
		Type:       "share",
		Message:    "compartilhou o material '" + resource["title"].(string) + "' com você.",
		ResourceID: resourceID,
		CommentID:  primitive.NilObjectID, // Não há comentário associado
		IsRead:     false,
		CreatedAt:  time.Now(),
	}

	if err := store.CreateNotification(&notification); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create share notification"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Material shared successfully"})
}

func HandleToggleLike(w http.ResponseWriter, r *http.Request) {
	userID, _ := primitive.ObjectIDFromHex(r.Context().Value(userContextKey).(string))
	resourceID, _ := primitive.ObjectIDFromHex(chi.URLParam(r, "id"))

	hasLiked, err := store.HasUserLikedResource(userID, resourceID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Error checking like status"})
		return
	}

	if hasLiked {
		// Se já curtiu, descurte.
		store.DeleteLike(userID, resourceID)
	} else {
		// Se não curtiu, cria o like.
		like := models.Like{
			ID:         primitive.NewObjectID(),
			UserID:     userID,
			ResourceID: resourceID,
			CreatedAt:  time.Now(),
		}
		if err := store.CreateLike(&like); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to like resource"})
			return
		}

		// Tenta buscar os dados do recurso para encontrar o autor.
		resourceData, err := store.GetResourceByID(resourceID)
		if err == nil && resourceData != nil {

			// 1. Verifica se o campo 'uploaderInfo' existe E se ele é do tipo correto.
			if uploaderInfo, ok := resourceData["uploaderInfo"].(primitive.M); ok && uploaderInfo != nil {

				// 2. Verifica se o campo '_id' existe dentro do uploaderInfo.
				if resourceAuthorID, ok := uploaderInfo["_id"].(primitive.ObjectID); ok {

					// 3. Garante que o usuário não está curtindo o próprio material.
					if resourceAuthorID != userID {
						sender, _ := store.GetUserByID(userID) // Busca o nome de quem curtiu
						if sender != nil {
							notification := models.Notification{
								ID:         primitive.NewObjectID(),
								UserID:     resourceAuthorID,
								ActorName:  sender.Name,
								Type:       "like",
								Message:    "curtiu seu material '" + resourceData["title"].(string) + "'.",
								ResourceID: resourceID,
								IsRead:     false,
								CreatedAt:  time.Now(),
							}
							store.CreateNotification(&notification)
						}
					}
				}
			}
		} else {
			log.Printf("Aviso: não foi possível buscar dados do recurso %s para enviar notificação de like.", resourceID.Hex())
		}
	}

	// Retorna o novo estado e contagem de likes
	newLikeCount, _ := store.CountLikesForResource(resourceID)
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"likes":    newLikeCount,
		"hasLiked": !hasLiked,
	})
}

func HandleGetMyLikes(w http.ResponseWriter, r *http.Request) {
	userID, _ := primitive.ObjectIDFromHex(r.Context().Value(userContextKey).(string))
	likedIDs, err := store.GetUserLikedResourceIDs(userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch user likes"})
		return
	}
	writeJSON(w, http.StatusOK, likedIDs)
}

func HandleToggleCommentLike(w http.ResponseWriter, r *http.Request) {
	userID, _ := primitive.ObjectIDFromHex(r.Context().Value(userContextKey).(string))
	commentID, _ := primitive.ObjectIDFromHex(chi.URLParam(r, "id"))

	hasLiked, _ := store.HasUserLikedComment(userID, commentID)

	if hasLiked {
		store.UnlikeComment(userID, commentID)
	} else {
		like := models.CommentLike{
			ID:        primitive.NewObjectID(),
			UserID:    userID,
			CommentID: commentID,
			CreatedAt: time.Now(),
		}
		store.LikeComment(&like)

		// Lógica para notificar o autor do comentário (não de si mesmo)
		comment, _ := store.GetCommentByID(commentID)
		if comment != nil && comment.UserID != userID {
			sender, _ := store.GetUserByID(userID)
			notification := models.Notification{
				// ... (preencha a notificação do tipo 'comment_like')
				ID:         primitive.NewObjectID(),
				UserID:     comment.UserID,
				ActorName:  sender.Name,
				Type:       "comment_like",
				Message:    "curtiu seu comentário.",
				ResourceID: comment.ResourceID,
				CommentID:  comment.ID,
				IsRead:     false,
				CreatedAt:  time.Now(),
			}
			store.CreateNotification(&notification)
		}
	}

	newLikeCount, _ := store.CountLikesForComment(commentID)
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"likes":    newLikeCount,
		"hasLiked": !hasLiked,
	})
}

// HandleGetMyCommentLikes retorna os IDs de todos os comentários que o usuário curtiu.
func HandleGetMyCommentLikes(w http.ResponseWriter, r *http.Request) {
	userID, _ := primitive.ObjectIDFromHex(r.Context().Value(userContextKey).(string))
	likedIDs, err := store.GetUserLikedCommentIDs(userID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch user comment likes"})
		return
	}
	writeJSON(w, http.StatusOK, likedIDs)
}

func HandleGetRelatedResources(w http.ResponseWriter, r *http.Request) {
	resourceID, _ := primitive.ObjectIDFromHex(chi.URLParam(r, "id"))

	// 1. Primeiro, busca o recurso atual para descobrir o código da disciplina.
	currentResource, err := store.GetResourceByID(resourceID) // Usamos a função que já retorna bson.M
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Resource not found"})
		return
	}

	courseCode, ok := currentResource["courseCode"].(string)
	if !ok {
		writeJSON(w, http.StatusOK, []models.Resource{}) // Retorna lista vazia se não tiver courseCode
		return
	}

	// 2. Agora, busca os recursos relacionados.
	relatedResources, err := store.FindRelatedResources(courseCode, resourceID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch related resources"})
		return
	}

	writeJSON(w, http.StatusOK, relatedResources)
}

func HandleGetStats(w http.ResponseWriter, r *http.Request) {
	// Usamos um 'error group' para buscar todas as contagens em paralelo, por performance.
	var g errgroup.Group

	var userCount, resourceCount, courseCount int64

	g.Go(func() error {
		count, err := database.UserCollection.CountDocuments(context.Background(), bson.M{})
		userCount = count
		return err
	})
	g.Go(func() error {
		count, err := database.ResourceCollection.CountDocuments(context.Background(), bson.M{})
		resourceCount = count
		return err
	})
	g.Go(func() error {
		// Contar cursos distintos é um pouco diferente
		distinctCourses, err := database.CourseCollection.Distinct(context.Background(), "code", bson.M{})
		courseCount = int64(len(distinctCourses))
		return err
	})

	if err := g.Wait(); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch stats"})
		return
	}

	// O número de downloads seria uma lógica mais complexa (ex: uma coleção 'downloads').
	// Por enquanto, vamos retornar um número mockado para esta estatística.
	stats := map[string]int64{
		"users":     userCount,
		"resources": resourceCount,
		"courses":   courseCount,
		"downloads": 25000, // Mock
	}

	writeJSON(w, http.StatusOK, stats)
}

func HandleDeleteResource(w http.ResponseWriter, r *http.Request) {
	userID, _ := primitive.ObjectIDFromHex(r.Context().Value(userContextKey).(string))
	resourceID, _ := primitive.ObjectIDFromHex(chi.URLParam(r, "id"))

	// A função no store já contém a lógica para garantir que o usuário é o dono.
	err := store.DeleteResourceByID(resourceID, userID)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			// Isso acontece se o usuário tentar deletar um recurso que não é dele ou não existe.
			writeJSON(w, http.StatusForbidden, map[string]string{"error": "Permission denied or resource not found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to delete resource"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Resource deleted successfully"})
}
