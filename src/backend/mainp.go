package main

import (
	"log"
	"net/http"
	"uspshare/api"
	"uspshare/database"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	database.InitDB()

	r := chi.NewRouter()

	// Middlewares
	r.Use(middleware.Logger)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // Permite requisições do seu frontend React
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Registrar as rotas da API
	api.RegisterRoutes(r)

	log.Println("Servidor iniciado na porta :8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatalf("Não foi possível iniciar o servidor: %v", err)
	}
}
