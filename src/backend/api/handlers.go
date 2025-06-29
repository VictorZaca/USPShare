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
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Requisição inválida"})
		return
	}

	if req.Name == "" || req.Email == "" || req.Password == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Nome, e-mail e senha são obrigatórios."})
		return
	}

	log.Printf("Cadastrando usuário '%s' com a senha de %d caracteres.", req.Email, len(req.Password))

	user := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: req.Password,
	}

	if err := store.CreateUser(&user); err != nil {
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

	log.Printf("Recebida tentativa de login para o email: '%s'", req.Email)

	user, err := store.GetUserByEmail(req.Email)
	if err != nil {
		log.Printf("ERRO: Usuário com email '%s' não foi encontrado no banco de dados.", req.Email)
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Credenciais inválidas"})
		return
	}

	log.Println("Usuário encontrado. Verificando a senha...")

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		log.Println("ERRO: A senha fornecida NÃO BATE com o hash salvo no banco.")
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Credenciais inválidas"})
		return
	}

	log.Println("Senha correta! Gerando token JWT...")

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
	commentsCount, _ := store.CountUserComments(userID)

	user.Stats = models.UserStats{
		Uploads:    int(uploadsCount),
		Likes:      0,
		Comments:   int(commentsCount),
		Reputation: 0,
	}

	earnedBadges := badge.EvaluateBadges(user.Stats)
	user.Badges = earnedBadges

	if user.AvatarURL == "" {
		user.AvatarURL = "https://i.pravatar.cc/150?u=" + user.Email
	}

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
	userIDHex, ok := r.Context().Value(userContextKey).(string)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}
	userID, _ := primitive.ObjectIDFromHex(userIDHex)

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "File too large"})
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid file field"})
		return
	}
	defer file.Close()

	uniqueFileName := uuid.New().String() + filepath.Ext(handler.Filename)
	filePath := filepath.Join("uploads", uniqueFileName)

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

	tagsJSON := r.FormValue("tags")
	var tags []string
	if err := json.Unmarshal([]byte(tagsJSON), &tags); err != nil {
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

	if err := store.CreateResource(&resource); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to save resource metadata"})
		return
	}

	writeJSON(w, http.StatusCreated, resource)
}

func HandleGetResources(w http.ResponseWriter, r *http.Request) {
	resources, err := store.ListResources()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch resources"})
		return
	}

	writeJSON(w, http.StatusOK, resources)
}

func HandleGetResourceByID(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
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

func HandlePostComment(w http.ResponseWriter, r *http.Request) {
	resourceIDHex := chi.URLParam(r, "id")
	resourceID, _ := primitive.ObjectIDFromHex(resourceIDHex)

	userIDHex, _ := r.Context().Value(userContextKey).(string)
	userID, _ := primitive.ObjectIDFromHex(userIDHex)

	var req struct {
		Content  string `json:"content"`
		ParentID string `json:"parentId,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Content == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Comment content is required"})
		return
	}

	log.Printf("Recebido pedido para postar comentário. Conteúdo: '%s', ParentID recebido: '%s'", req.Content, req.ParentID)

	comment := models.Comment{
		ID:         primitive.NewObjectID(),
		ResourceID: resourceID,
		UserID:     userID,
		Content:    req.Content,
		CreatedAt:  time.Now(),
	}

	if req.ParentID != "" {
		parentObjID, err := primitive.ObjectIDFromHex(req.ParentID)
		if err != nil {
			log.Printf("ParentID recebido ('%s') é inválido. Criando como comentário principal.", req.ParentID)
		} else {
			log.Printf("ParentID '%s' é válido. Anexando ao comentário.", req.ParentID)
			comment.ParentID = &parentObjID
		}
	} else {
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
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Comment posted, but failed to retrieve it"})
		return
	}

	writeJSON(w, http.StatusCreated, newCommentData)
}

func HandleGetNotifications(w http.ResponseWriter, r *http.Request) {
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

func HandleMarkNotificationAsRead(w http.ResponseWriter, r *http.Request) {
	notificationIDHex := chi.URLParam(r, "id")
	notificationID, err := primitive.ObjectIDFromHex(notificationIDHex)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid notification ID"})
		return
	}

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

	avatarFileName := userID.Hex() + filepath.Ext(handler.Filename)
	avatarPath := filepath.Join("uploads", "avatars", avatarFileName)

	os.MkdirAll(filepath.Dir(avatarPath), os.ModePerm)

	dst, _ := os.Create(avatarPath)
	defer dst.Close()
	io.Copy(dst, file)

	avatarUrl := "/uploads/avatars/" + avatarFileName

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
	if err := store.DeleteProfessorByID(id); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to delete professor"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": "Professor deleted successfully"})
}

func HandleSearchUsers(w http.ResponseWriter, r *http.Request) {
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

	sender, _ := store.GetUserByID(senderID)
	resource, _ := store.GetResourceByID(resourceID)

	notification := models.Notification{
		ID:         primitive.NewObjectID(),
		UserID:     recipientID,
		ActorName:  sender.Name,
		Type:       "share",
		Message:    "compartilhou o material '" + resource["title"].(string) + "' com você.",
		ResourceID: resourceID,
		CommentID:  primitive.NilObjectID,
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
		store.DeleteLike(userID, resourceID)
	} else {
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

		resourceData, err := store.GetResourceByID(resourceID)
		if err == nil && resourceData != nil {

			if uploaderInfo, ok := resourceData["uploaderInfo"].(primitive.M); ok && uploaderInfo != nil {

				if resourceAuthorID, ok := uploaderInfo["_id"].(primitive.ObjectID); ok {

					if resourceAuthorID != userID {
						sender, _ := store.GetUserByID(userID)
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

		comment, _ := store.GetCommentByID(commentID)
		if comment != nil && comment.UserID != userID {
			sender, _ := store.GetUserByID(userID)
			notification := models.Notification{
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

	currentResource, err := store.GetResourceByID(resourceID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Resource not found"})
		return
	}

	courseCode, ok := currentResource["courseCode"].(string)
	if !ok {
		writeJSON(w, http.StatusOK, []models.Resource{})
		return
	}

	relatedResources, err := store.FindRelatedResources(courseCode, resourceID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch related resources"})
		return
	}

	writeJSON(w, http.StatusOK, relatedResources)
}

func HandleGetStats(w http.ResponseWriter, r *http.Request) {
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
		distinctCourses, err := database.CourseCollection.Distinct(context.Background(), "code", bson.M{})
		courseCount = int64(len(distinctCourses))
		return err
	})

	if err := g.Wait(); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to fetch stats"})
		return
	}

	stats := map[string]int64{
		"users":     userCount,
		"resources": resourceCount,
		"courses":   courseCount,
		"downloads": 1000,
	}

	writeJSON(w, http.StatusOK, stats)
}

func HandleDeleteResource(w http.ResponseWriter, r *http.Request) {
	userID, _ := primitive.ObjectIDFromHex(r.Context().Value(userContextKey).(string))
	resourceID, _ := primitive.ObjectIDFromHex(chi.URLParam(r, "id"))

	err := store.DeleteResourceByID(resourceID, userID)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			writeJSON(w, http.StatusForbidden, map[string]string{"error": "Permission denied or resource not found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to delete resource"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Resource deleted successfully"})
}
