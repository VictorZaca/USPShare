package api

import "github.com/go-chi/chi/v5" // ou seu roteador preferido

// RegisterRoutes configura todas as rotas da aplicação
func RegisterRoutes(r *chi.Mux) {
	// Rotas Públicas
	r.Post("/api/signup", HandleSignup)
	r.Post("/api/login", HandleLogin)
	r.Get("/api/resources", HandleGetResources)
	r.Get("/api/resource/{id}", HandleGetResourceByID)
	r.Get("/api/resource/{id}/comments", HandleListComments)

	// Rotas Protegidas
	r.Group(func(r chi.Router) {
		r.Use(AuthMiddleware)
		r.Post("/api/upload", HandleUploadResource)
		r.Get("/api/profile", HandleGetProfile)
		r.Get("/api/my-uploads", HandleGetUserUploads)
		r.Post("/api/resource/{id}/comments", HandlePostComment)

		r.Get("/api/notifications", HandleGetNotifications)
		r.Post("/api/notifications/{id}/read", HandleMarkNotificationAsRead)
	})
}
