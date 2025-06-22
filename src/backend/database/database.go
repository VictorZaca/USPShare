package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

var DB *mongo.Client
var UserCollection *mongo.Collection
var ResourceCollection *mongo.Collection

func InitDB() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	fmt.Println("Hello, World!")
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	MONGODB_URI := os.Getenv("MONGO_URI")

	// Use a sua string de conexão do MongoDB
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(MONGODB_URI))
	if err != nil {
		log.Fatal("Erro ao conectar ao MongoDB:", err)
	}

	// Verifica se a conexão foi bem sucedida
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		log.Fatal("Não foi possível pingar o MongoDB:", err)
	}

	DB = client
	database := DB.Database("uspshare")
	UserCollection = database.Collection("users")
	ResourceCollection = database.Collection("resources")

	log.Println("Conectado ao MongoDB com sucesso!")
	createIndexes()
}

// Criar índices é uma boa prática para performance e para garantir regras de negócio
func createIndexes() {
	// Garante que o campo 'email' na coleção 'users' seja único
	indexModel := mongo.IndexModel{
		Keys: bson.M{
			"email": 1, // 1 para ordem ascendente
		},
		Options: options.Index().SetUnique(true),
	}

	_, err := UserCollection.Indexes().CreateOne(context.Background(), indexModel)
	if err != nil {
		log.Printf("Não foi possível criar índice para 'users': %v\n", err)
	} else {
		log.Println("Índice de email único criado com sucesso.")
	}
}
