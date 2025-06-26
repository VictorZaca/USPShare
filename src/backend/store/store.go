package store

import (
	"context"
	"log"
	"sort"
	"time"

	"uspshare/database"
	"uspshare/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"

	"go.mongodb.org/mongo-driver/mongo"
)

// --- User Store ---
func CreateUser(user *models.User) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.ID = primitive.NewObjectID() // Gera um novo ID
	user.CreatedAt = time.Now()
	_, err = database.UserCollection.InsertOne(context.TODO(), bson.M{
		"_id":       user.ID,
		"name":      user.Name,
		"email":     user.Email,
		"password":  string(hashedPassword),
		"createdAt": user.CreatedAt,
	})
	return err
}

func GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	err := database.UserCollection.FindOne(context.TODO(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func ListResources() ([]bson.M, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{"$lookup", bson.D{
			{"from", "likes"}, {"localField", "_id"}, {"foreignField", "resourceId"}, {"as", "likeData"},
		}}},
		{{"$lookup", bson.D{
			{"from", "users"},
			{"localField", "userId"},
			{"foreignField", "_id"},
			{"as", "uploaderInfo"},
		}}},
		// 2. Faz o JOIN com a coleção de professores
		{{"$lookup", bson.D{
			{"from", "professors"},
			{"localField", "professorId"},
			{"foreignField", "_id"},
			{"as", "professorInfo"},
		}}},

		{{"$lookup", bson.D{
			{"from", "comments"}, // Coleção de comentários
			{"localField", "_id"},
			{"foreignField", "resourceId"},
			{"as", "commentData"},
		}}},

		// Desconstrói os arrays resultantes para facilitar o acesso
		{{"$unwind", bson.D{{"path", "$uploaderInfo"}, {"preserveNullAndEmptyArrays", true}}}},
		{{"$unwind", bson.D{{"path", "$professorInfo"}, {"preserveNullAndEmptyArrays", true}}}},

		{{"$addFields", bson.D{
			{"id", "$_id"},

			{"uploaderName", "$uploaderInfo.name"},
			{"uploaderAvatar", "$uploaderInfo.avatarUrl"},
			{"professorName", "$professorInfo.name"},
			{"professorAvatar", "$professorInfo.avatarUrl"},
			{"likes", bson.D{{"$size", "$likeData"}}},
			{"comments", bson.D{{"$size", "$commentData"}}},
		}}},
		{{"$project", bson.D{{"likeData", 0}}}},
	}

	cursor, err := database.ResourceCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	return results, nil
}

func GetUserByID(id primitive.ObjectID) (*models.User, error) {
	var user models.User
	err := database.UserCollection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func GetResourcesByUserID(userID primitive.ObjectID) ([]bson.M, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{"$match", bson.D{{"userId", userID}}}},

		{{"$lookup", bson.D{{"from", "likes"}, {"localField", "_id"}, {"foreignField", "resourceId"}, {"as", "likeData"}}}},
		{{"$lookup", bson.D{{"from", "comments"}, {"localField", "_id"}, {"foreignField", "resourceId"}, {"as", "commentData"}}}},
		{{"$lookup", bson.D{{"from", "users"}, {"localField", "userId"}, {"foreignField", "_id"}, {"as", "uploaderInfo"}}}},
		{{"$lookup", bson.D{{"from", "professors"}, {"localField", "professorId"}, {"foreignField", "_id"}, {"as", "professorInfo"}}}},
		{{"$unwind", bson.D{{"path", "$uploaderInfo"}, {"preserveNullAndEmptyArrays", true}}}},
		{{"$unwind", bson.D{{"path", "$professorInfo"}, {"preserveNullAndEmptyArrays", true}}}},
		{{"$addFields", bson.D{
			{"id", "$_id"},
			{"likes", bson.D{{"$size", "$likeData"}}},
			{"comments", bson.D{{"$size", "$commentData"}}},
			{"uploaderName", "$uploaderInfo.name"},
			{"uploaderAvatar", "$uploaderInfo.avatarUrl"},
			{"professorName", "$professorInfo.name"},
			{"professorAvatar", "$professorInfo.avatarUrl"},
		}}},
		{{"$sort", bson.D{{"uploadDate", -1}}}},
		{{"$project", bson.D{
			{"_id", 0}, {"likeData", 0}, {"commentData", 0}, {"uploaderInfo", 0}, {"professorInfo", 0},
		}}},
	}

	cursor, err := database.ResourceCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	return results, nil
}

// Função para contar os uploads de um usuário (para as estatísticas)
func CountUserUploads(userID primitive.ObjectID) (int64, error) {
	count, err := database.ResourceCollection.CountDocuments(context.TODO(), bson.M{"userId": userID})
	if err != nil {
		return 0, err
	}
	return count, nil
}

func CreateResource(resource *models.Resource) error {
	// A função InsertOne insere a struct 'resource' diretamente na coleção.
	// O driver do MongoDB usa as tags 'bson' da nossa struct para mapear os campos.
	_, err := database.ResourceCollection.InsertOne(context.TODO(), resource)
	return err
}

func GetResourceByID(id primitive.ObjectID) (bson.M, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{"$match", bson.D{{"_id", id}}}},
		{{"$lookup", bson.D{{"from", "users"}, {"localField", "userId"}, {"foreignField", "_id"}, {"as", "uploaderInfo"}}}},
		{{"$lookup", bson.D{{"from", "professors"}, {"localField", "professorId"}, {"foreignField", "_id"}, {"as", "professorInfo"}}}},
		{{"$lookup", bson.D{{"from", "likes"}, {"localField", "_id"}, {"foreignField", "resourceId"}, {"as", "likeData"}}}},
		{{"$lookup", bson.D{{"from", "comments"}, {"localField", "_id"}, {"foreignField", "resourceId"}, {"as", "commentData"}}}},
		{{"$unwind", bson.D{{"path", "$uploaderInfo"}, {"preserveNullAndEmptyArrays", true}}}},
		{{"$unwind", bson.D{{"path", "$professorInfo"}, {"preserveNullAndEmptyArrays", true}}}},
		{{"$addFields", bson.D{
			{"uploaderName", "$uploaderInfo.name"},
			{"uploaderAvatar", "$uploaderInfo.avatarUrl"},
			{"professorName", "$professorInfo.name"},
			{"professorAvatar", "$professorInfo.avatarUrl"},
			{"likes", bson.D{{"$size", "$likeData"}}},
			{"comments", bson.D{{"$size", "$commentData"}}},
		}}},
	}
	cursor, err := database.ResourceCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}
	if len(results) == 0 {
		return nil, mongo.ErrNoDocuments
	}
	return results[0], nil
}

func CreateComment(comment *models.Comment) error {
	_, err := database.CommentCollection.InsertOne(context.TODO(), comment)
	return err
}

// GetCommentsByResourceID busca todos os comentários de um recurso, já com o nome do autor.
func GetCommentsByResourceID(resourceID primitive.ObjectID) ([]*models.CommentWithAuthor, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// 1. Busca todos os comentários do recurso, já com os dados do autor, de uma só vez.
	pipeline := mongo.Pipeline{
		{{"$match", bson.D{{"resourceId", resourceID}}}},
		{{"$lookup", bson.D{{"from", "users"}, {"localField", "userId"}, {"foreignField", "_id"}, {"as", "authorInfo"}}}},
		{{"$lookup", bson.D{{"from", "comment_likes"}, {"localField", "_id"}, {"foreignField", "commentId"}, {"as", "likeData"}}}},
		{{"$unwind", "$authorInfo"}},
		{{"$addFields", bson.D{
			{"authorName", "$authorInfo.name"},
			{"authorAvatar", "$authorInfo.avatarUrl"},
			{"likes", bson.D{{"$size", "$likeData"}}},
		}}},
		{{"$project", bson.D{{"authorInfo", 0}, {"likeData", 0}}}},
	}

	cursor, err := database.CommentCollection.Aggregate(ctx, pipeline)
	if err != nil {
		log.Printf("Erro na agregação do MongoDB: %v", err)
		return nil, err
	}
	defer cursor.Close(ctx)

	// Struct temporária para decodificação inicial
	type tempComment struct {
		ID           primitive.ObjectID  `bson:"_id"`
		ParentID     *primitive.ObjectID `bson:"parentId"`
		Content      string              `bson:"content"`
		CreatedAt    time.Time           `bson:"createdAt"`
		AuthorName   string              `bson:"authorName"`
		AuthorAvatar string              `bson:"authorAvatar"`
		Replies      []tempComment       `bson:"replies,omitempty"` // Permite respostas
		Likes        int                 `bson:"likes"`
	}

	var allComments []tempComment
	if err = cursor.All(ctx, &allComments); err != nil {
		return nil, err
	}

	// 2. Monta a árvore em memória, a abordagem mais robusta para recursão.
	commentMap := make(map[primitive.ObjectID]*models.CommentWithAuthor)

	// Primeiro, popula o mapa com todos os comentários como nós individuais.
	for _, c := range allComments {
		commentMap[c.ID] = &models.CommentWithAuthor{
			ID:           c.ID,
			ParentID:     c.ParentID,
			Content:      c.Content,
			CreatedAt:    c.CreatedAt,
			AuthorName:   c.AuthorName,
			AuthorAvatar: c.AuthorAvatar,
			Replies:      []*models.CommentWithAuthor{}, // Inicializa o slice de respostas
			Likes:        c.Likes,
		}
	}

	var rootComments []*models.CommentWithAuthor
	// Segundo, itera sobre o mapa e aninha os filhos em seus pais.
	for _, commentNode := range commentMap {
		if commentNode.ParentID != nil {
			if parent, ok := commentMap[*commentNode.ParentID]; ok {
				// Encontrou o pai, anexa este comentário como uma resposta.
				parent.Replies = append(parent.Replies, commentNode)
			}
		} else {
			// Se não tem pai, é um comentário principal (raiz).
			rootComments = append(rootComments, commentNode)
		}
	}

	// 3. (Bônus de Qualidade) Ordena os comentários em todos os níveis.
	sortCommentsRecursive(rootComments)

	return rootComments, nil
}

// sortCommentsRecursive ordena os comentários e suas respostas pela data de criação.
func sortCommentsRecursive(comments []*models.CommentWithAuthor) {
	// Ordena o nível atual (mais novos primeiro)
	sort.Slice(comments, func(i, j int) bool {
		return comments[i].CreatedAt.After(comments[j].CreatedAt)
	})

	// Chama a si mesma para ordenar as respostas de cada comentário
	for _, c := range comments {
		if len(c.Replies) > 0 {
			sortCommentsRecursive(c.Replies)
		}
	}
}

// CreateNotification insere uma nova notificação no banco de dados.
func CreateNotification(notification *models.Notification) error {
	_, err := database.NotificationCollection.InsertOne(context.TODO(), notification)
	return err
}

// GetNotificationsByUserID busca todas as notificações para um usuário específico,
// ordenadas da mais nova para a mais antiga.
func GetNotificationsByUserID(userID primitive.ObjectID) ([]models.Notification, error) {
	var notifications []models.Notification
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Opções para ordenar por data de criação (descendente) e limitar a 50
	opts := options.Find().SetSort(bson.D{{"createdAt", -1}}).SetLimit(50)

	cursor, err := database.NotificationCollection.Find(ctx, bson.M{"userId": userID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &notifications); err != nil {
		return nil, err
	}

	if notifications == nil {
		return []models.Notification{}, nil // Retorna um slice vazio em vez de nulo
	}

	return notifications, nil
}

// MarkNotificationAsRead atualiza uma notificação para o estado 'lida'.
// Também verifica se a notificação pertence ao usuário que fez a requisição, por segurança.
func MarkNotificationAsRead(notificationID, userID primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{
		"_id":    notificationID,
		"userId": userID, // Garante que um usuário não pode ler a notificação de outro
	}

	update := bson.M{
		"$set": bson.M{"isRead": true},
	}

	_, err := database.NotificationCollection.UpdateOne(ctx, filter, update)
	return err
}

func GetCommentByID(id primitive.ObjectID) (*models.Comment, error) {
	var comment models.Comment
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err := database.CommentCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&comment)
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

func GetCommentWithAuthorByID(commentID primitive.ObjectID) (*models.CommentWithAuthor, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// A pipeline de agregação para buscar o comentário e seu autor
	pipeline := mongo.Pipeline{
		{{"$match", bson.D{{"_id", commentID}}}},
		{{"$lookup", bson.D{{"from", "users"}, {"localField", "userId"}, {"foreignField", "_id"}, {"as", "authorInfo"}}}},
		{{"$lookup", bson.D{{"from", "comment_likes"}, {"localField", "_id"}, {"foreignField", "commentId"}, {"as", "likeData"}}}},
		{{"$unwind", "$authorInfo"}},
		{{"$addFields", bson.D{
			{"authorName", "$authorInfo.name"},
			{"authorAvatar", "$authorInfo.avatarUrl"},
			{"likes", bson.D{{"$size", "$likeData"}}},
		}}},
		{{"$project", bson.D{{"authorInfo", 0}, {"likeData", 0}}}},
	}

	cursor, err := database.CommentCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	// Decodifica o resultado diretamente em um slice de nossa struct
	var results []models.CommentWithAuthor
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	if len(results) == 0 {
		return nil, mongo.ErrNoDocuments
	}

	// Retorna um ponteiro para o primeiro (e único) resultado
	return &results[0], nil
}

func CountUserComments(userID primitive.ObjectID) (int64, error) {
	count, err := database.CommentCollection.CountDocuments(context.TODO(), bson.M{"userId": userID})
	if err != nil {
		return 0, err
	}
	return count, nil
}

func UpdateUserByID(id primitive.ObjectID, update bson.M) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// O filtro para encontrar o documento correto a ser atualizado
	filter := bson.M{"_id": id}

	// A operação UpdateOne aplica as modificações definidas no documento 'update'.
	// Este documento 'update' é criado nos handlers (ex: bson.M{"$set": ...})
	// e pode conter qualquer operador de atualização do MongoDB.
	_, err := database.UserCollection.UpdateOne(ctx, filter, update)

	return err
}

type CourseInfo struct {
	Code string `json:"code" bson:"_id"`
	Name string `json:"name" bson:"name"`
}

func GetDistinctCourses() ([]CourseInfo, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Usamos uma agregação para agrupar por código e pegar o primeiro nome associado.
	pipeline := mongo.Pipeline{
		{{"$group", bson.D{
			{"_id", "$courseCode"},
			{"name", bson.D{{"$first", "$course"}}},
		}}},
		{{"$sort", bson.D{{"_id", 1}}}}, // Ordena pelo código da disciplina
	}

	cursor, err := database.ResourceCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var courses []CourseInfo
	if err = cursor.All(ctx, &courses); err != nil {
		return nil, err
	}
	return courses, nil
}

// GetDistinctFieldValues retorna uma lista de valores únicos para um campo específico (ex: "professor", "tags").
func GetDistinctFieldValues(fieldName string) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// O comando Distinct do MongoDB é perfeito para isso.
	values, err := database.ResourceCollection.Distinct(ctx, fieldName, bson.M{})
	if err != nil {
		return nil, err
	}

	// Converte o resultado (que é []interface{}) para []string
	var stringValues []string
	for _, v := range values {
		if str, ok := v.(string); ok {
			stringValues = append(stringValues, str)
		}
	}
	sort.Strings(stringValues) // Ordena alfabeticamente
	return stringValues, nil
}

// --- Funções para Courses ---
func ListCourses() ([]models.Course, error) {
	var items []models.Course
	cursor, err := database.CourseCollection.Find(context.TODO(), bson.M{}, options.Find().SetSort(bson.D{{"code", 1}}))
	if err != nil {
		return nil, err
	}
	if err = cursor.All(context.TODO(), &items); err != nil {
		return nil, err
	}
	return items, nil
}
func CreateCourse(item *models.Course) error {
	_, err := database.CourseCollection.InsertOne(context.TODO(), item)
	return err
}
func DeleteCourseByID(id primitive.ObjectID) error {
	_, err := database.CourseCollection.DeleteOne(context.TODO(), bson.M{"_id": id})
	return err
}

// --- Funções para Professors ---
func ListProfessors() ([]models.Professor, error) {
	var items []models.Professor
	cursor, err := database.ProfessorCollection.Find(context.TODO(), bson.M{}, options.Find().SetSort(bson.D{{"name", 1}}))
	if err != nil {
		return nil, err
	}
	if err = cursor.All(context.TODO(), &items); err != nil {
		return nil, err
	}
	return items, nil
}
func CreateProfessor(item *models.Professor) error {
	_, err := database.ProfessorCollection.InsertOne(context.TODO(), item)
	return err
}
func DeleteProfessorByID(id primitive.ObjectID) error {
	_, err := database.ProfessorCollection.DeleteOne(context.TODO(), bson.M{"_id": id})
	return err
}

// --- Funções para Tags ---
func ListTags() ([]models.Tag, error) {
	var items []models.Tag
	cursor, err := database.TagCollection.Find(context.TODO(), bson.M{}, options.Find().SetSort(bson.D{{"name", 1}}))
	if err != nil {
		return nil, err
	}
	if err = cursor.All(context.TODO(), &items); err != nil {
		return nil, err
	}
	return items, nil
}
func CreateTag(item *models.Tag) error {
	_, err := database.TagCollection.InsertOne(context.TODO(), item)
	return err
}
func DeleteTagByID(id primitive.ObjectID) error {
	_, err := database.TagCollection.DeleteOne(context.TODO(), bson.M{"_id": id})
	return err
}

func SearchUsersByNameOrEmail(query string, selfID primitive.ObjectID) ([]models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Filtro para buscar por nome OU email, usando regex para busca parcial e case-insensitive
	// E excluindo o próprio ID do usuário ($ne: not equal)
	filter := bson.M{
		"_id": bson.M{"$ne": selfID},
		"$or": []bson.M{
			{"name": bson.M{"$regex": query, "$options": "i"}},
			{"email": bson.M{"$regex": query, "$options": "i"}},
		},
	}

	// Projeta para retornar apenas os campos necessários e seguros
	projection := bson.M{"password": 0}
	opts := options.Find().SetProjection(projection).SetLimit(10)

	cursor, err := database.UserCollection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err = cursor.All(ctx, &users); err != nil {
		return nil, err
	}

	return users, nil
}

func CreateLike(like *models.Like) error {
	_, err := database.LikeCollection.InsertOne(context.TODO(), like)
	return err
}

func DeleteLike(userID, resourceID primitive.ObjectID) error {
	_, err := database.LikeCollection.DeleteOne(context.TODO(), bson.M{"userId": userID, "resourceId": resourceID})
	return err
}

func HasUserLikedResource(userID, resourceID primitive.ObjectID) (bool, error) {
	count, err := database.LikeCollection.CountDocuments(context.TODO(), bson.M{"userId": userID, "resourceId": resourceID})
	return count > 0, err
}

func CountLikesForResource(resourceID primitive.ObjectID) (int64, error) {
	return database.LikeCollection.CountDocuments(context.TODO(), bson.M{"resourceId": resourceID})
}

func CountLikesReceivedByUser(userID primitive.ObjectID) (int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		// 1. Encontra todos os recursos postados pelo usuário
		{{"$match", bson.D{{"userId", userID}}}},
		// 2. Faz o JOIN com a coleção de likes para buscar as curtidas de cada recurso
		{{"$lookup", bson.D{
			{"from", "likes"},
			{"localField", "_id"},
			{"foreignField", "resourceId"},
			{"as", "likesData"},
		}}},
		// 3. Adiciona um campo com o número de likes para cada recurso
		{{"$addFields", bson.D{
			{"likeCount", bson.D{{"$size", "$likesData"}}},
		}}},
		// 4. Agrupa tudo e SOMA a contagem de likes
		{{"$group", bson.D{
			{"_id", nil}, // Agrupa todos os documentos em um só
			{"totalLikes", bson.D{{"$sum", "$likeCount"}}},
		}}},
	}

	cursor, err := database.ResourceCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return 0, err
	}
	defer cursor.Close(ctx)

	var results []struct {
		TotalLikes int64 `bson:"totalLikes"`
	}
	if cursor.Next(ctx) {
		if err := cursor.Decode(&results); err != nil {
			// Workaround for a specific decoding issue with single result
			// This part can be tricky, let's try a simpler approach if this fails.
			// For now, let's assume a simpler structure for decoding.
			var result struct {
				TotalLikes int64 `bson:"totalLikes"`
			}
			if err := cursor.Decode(&result); err == nil {
				return result.TotalLikes, nil
			}
		}
		if len(results) > 0 {
			return results[0].TotalLikes, nil
		}
	}
	return 0, nil // Retorna 0 se não houver resultados
}

func GetUserLikedResourceIDs(userID primitive.ObjectID) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"userId": userID}
	cursor, err := database.LikeCollection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var likedResourceIDs []string
	for cursor.Next(ctx) {
		var like models.Like
		if err := cursor.Decode(&like); err == nil {
			likedResourceIDs = append(likedResourceIDs, like.ResourceID.Hex())
		}
	}
	return likedResourceIDs, nil
}

func LikeComment(like *models.CommentLike) error {
	_, err := database.CommentLikeCollection.InsertOne(context.TODO(), like)
	return err
}

func UnlikeComment(userID, commentID primitive.ObjectID) error {
	_, err := database.CommentLikeCollection.DeleteOne(context.TODO(), bson.M{"userId": userID, "commentId": commentID})
	return err
}

func HasUserLikedComment(userID, commentID primitive.ObjectID) (bool, error) {
	count, err := database.CommentLikeCollection.CountDocuments(context.TODO(), bson.M{"userId": userID, "commentId": commentID})
	return count > 0, err
}

func CountLikesForComment(commentID primitive.ObjectID) (int64, error) {
	return database.CommentLikeCollection.CountDocuments(context.TODO(), bson.M{"commentId": commentID})
}

func GetUserLikedCommentIDs(userID primitive.ObjectID) ([]string, error) {
	var likedCommentIDs []string
	cursor, err := database.CommentLikeCollection.Find(context.TODO(), bson.M{"userId": userID})
	if err != nil {
		return nil, err
	}
	for cursor.Next(context.TODO()) {
		var like models.CommentLike
		if err := cursor.Decode(&like); err == nil {
			likedCommentIDs = append(likedCommentIDs, like.CommentID.Hex())
		}
	}
	return likedCommentIDs, nil
}

func FindRelatedResources(courseCode string, currentResourceID primitive.ObjectID) ([]bson.M, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Filtro: busca pelo mesmo courseCode, mas com um ID diferente ($ne = not equal)
	filter := bson.M{
		"courseCode": courseCode,
		"_id":        bson.M{"$ne": currentResourceID},
	}

	// --- NOVA PIPELINE DE AGREGAÇÃO ---
	pipeline := mongo.Pipeline{
		{{"$match", filter}},
		{{"$limit", 4}}, // Limita a 4 resultados

		// 1. Faz o JOIN com a coleção de professores
		{{"$lookup", bson.D{
			{"from", "professors"},
			{"localField", "professorId"},
			{"foreignField", "_id"},
			{"as", "professorInfo"},
		}}},
		{{"$unwind", bson.D{{"path", "$professorInfo"}, {"preserveNullAndEmptyArrays", true}}}},

		// 2. Adiciona os campos que queremos ao resultado final
		{{"$addFields", bson.D{
			// Renomeia o _id para id, corrigindo o bug de 'undefined'
			{"id", "$_id"},
			{"professorName", "$professorInfo.name"},
			{"professorAvatar", "$professorInfo.avatarUrl"},
		}}},

		// 3. Projeta apenas os campos estritamente necessários para a UI
		{{"$project", bson.D{
			{"title", 1},
			{"type", 1},
			{"id", 1},
			{"professorName", 1},
			{"professorAvatar", 1},
		}}},
	}

	cursor, err := database.ResourceCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	return results, nil
}

func DeleteResourceByID(resourceID, userID primitive.ObjectID) error {
	ctx := context.TODO()

	// O filtro garante que um usuário só pode deletar seu próprio recurso.
	filter := bson.M{"_id": resourceID, "userId": userID}

	// 1. Deleta o documento do recurso principal
	result, err := database.ResourceCollection.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}
	// Se nenhum documento foi deletado, significa que o usuário não é o dono
	if result.DeletedCount == 0 {
		return mongo.ErrNoDocuments // Retorna um erro para o handler saber
	}

	// 2. Deleta todos os likes associados
	_, err = database.LikeCollection.DeleteMany(ctx, bson.M{"resourceId": resourceID})
	if err != nil {
		log.Printf("Aviso: falha ao deletar likes do recurso %s: %v", resourceID.Hex(), err)
	}

	// 3. Deleta todos os comentários e seus likes associados
	_, err = database.CommentCollection.DeleteMany(ctx, bson.M{"resourceId": resourceID})
	if err != nil {
		log.Printf("Aviso: falha ao deletar comentários do recurso %s: %v", resourceID.Hex(), err)
	}
	// Lógica para deletar o arquivo do servidor...

	return nil
}
