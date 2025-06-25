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

func ListResources() ([]models.Resource, error) {
	var resources []models.Resource

	// Usar um contexto com timeout é uma boa prática para queries de banco de dados
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// bson.M{} é um filtro vazio, que significa "encontrar todos os documentos"
	cursor, err := database.ResourceCollection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	// Decodifica todos os documentos do cursor para o nosso slice de resources
	if err = cursor.All(ctx, &resources); err != nil {
		return nil, err
	}

	// Se nenhum recurso for encontrado, o MongoDB retorna um slice nulo (nil).
	// É uma boa prática retornar um slice vazio em vez de nulo para evitar erros no frontend.
	if resources == nil {
		return []models.Resource{}, nil
	}

	return resources, nil
}

func GetUserByID(id primitive.ObjectID) (*models.User, error) {
	var user models.User
	err := database.UserCollection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func GetResourcesByUserID(userID primitive.ObjectID) ([]models.Resource, error) {
	var resources []models.Resource
	cursor, err := database.ResourceCollection.Find(context.TODO(), bson.M{"userId": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.TODO())

	if err = cursor.All(context.TODO(), &resources); err != nil {
		return nil, err
	}
	return resources, nil
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

	// Pipeline de Agregação para fazer o "JOIN" com a coleção de usuários
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.D{{Key: "_id", Value: id}}}}, // 1. Encontra o recurso pelo ID
		{{Key: "$lookup", Value: bson.D{ // 2. Faz o JOIN
			{Key: "from", Value: "users"},        // da coleção 'users'
			{Key: "localField", Value: "userId"}, // usando o campo 'userId' da coleção 'resources'
			{Key: "foreignField", Value: "_id"},  // com o campo '_id' da coleção 'users'
			{Key: "as", Value: "uploaderInfo"},   // e coloca o resultado em um array 'uploaderInfo'
		}}},
		{{Key: "$unwind", Value: bson.D{{Key: "path", Value: "$uploaderInfo"}, {Key: "preserveNullAndEmptyArrays", Value: true}}}}, // 3. Desconstrói o array para um objeto
		{{Key: "$addFields", Value: bson.D{ // 4. Adiciona/modifica campos
			{Key: "uploaderName", Value: "$uploaderInfo.name"}, // Cria o campo 'uploaderName'
		}}},
		{{Key: "$project", Value: bson.D{ // 5. Remove campos que não queremos enviar
			{Key: "uploaderInfo", Value: 0}, // Remove o objeto uploaderInfo inteiro
			{Key: "userId", Value: 0},       // Remove o userId para não expor o ID do uploader
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
		{{"$lookup", bson.D{
			{"from", "users"}, {"localField", "userId"}, {"foreignField", "_id"}, {"as", "authorInfo"},
		}}},
		{{"$unwind", "$authorInfo"}},
		{{"$addFields", bson.D{
			{"authorName", "$authorInfo.name"},
		}}},
	}

	cursor, err := database.CommentCollection.Aggregate(ctx, pipeline)
	if err != nil {
		log.Printf("Erro na agregação do MongoDB: %v", err)
		return nil, err
	}
	defer cursor.Close(ctx)

	// Struct temporária para decodificação inicial
	type tempComment struct {
		ID         primitive.ObjectID  `bson:"_id"`
		ParentID   *primitive.ObjectID `bson:"parentId"`
		Content    string              `bson:"content"`
		CreatedAt  time.Time           `bson:"createdAt"`
		AuthorName string              `bson:"authorName"`
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
			ID:         c.ID,
			ParentID:   c.ParentID,
			Content:    c.Content,
			CreatedAt:  c.CreatedAt,
			AuthorName: c.AuthorName,
			Replies:    []*models.CommentWithAuthor{}, // Inicializa o slice de respostas
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
		{{"$lookup", bson.D{
			{"from", "users"},
			{"localField", "userId"},
			{"foreignField", "_id"},
			{"as", "authorInfo"},
		}}},
		{{"$unwind", "$authorInfo"}},
		{{"$addFields", bson.D{
			{"authorName", "$authorInfo.name"},
		}}},
		// Adicionamos um $project para garantir que o formato seja idêntico ao da outra função
		{{"$project", bson.D{
			{"content", 1},
			{"createdAt", 1},
			{"authorName", 1},
			{"parentId", 1},
			// Não precisamos dos campos userId e authorInfo na resposta final
		}}},
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
