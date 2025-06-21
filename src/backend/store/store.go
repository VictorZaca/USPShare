package store

import (
	"context"
	"time"
	"uspshare/database"
	"uspshare/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
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

// --- Resource Store ---
// func ListResources() ([]models.Resource, error) {
// 	cursor, err := database.ResourceCollection.Find(context.TODO(), bson.M{})
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer cursor.Close(context.TODO())

// 	var resources []models.Resource
// 	if err = cursor.All(context.TODO(), &resources); err != nil {
// 		return nil, err
// 	}

// 	return resources, nil
// }

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
