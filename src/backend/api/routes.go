package api

import "github.com/go-chi/chi/v5"

func RegisterRoutes(r *chi.Mux) {
	// Rotas Públicas
	r.Get("/api/stats", HandleGetStats)

	r.Post("/api/signup", HandleSignup)
	r.Post("/api/login", HandleLogin)
	r.Get("/api/resources", HandleGetResources)
	r.Get("/api/resource/{id}", HandleGetResourceByID)
	r.Get("/api/resource/{id}/comments", HandleListComments)

	r.Get("/api/data/courses", HandleListCourses)
	r.Get("/api/data/professors", HandleListProfessors)
	r.Get("/api/data/tags", HandleListTags)

	r.Get("/api/resource/{id}/related", HandleGetRelatedResources)

	// Rotas Protegidas
	r.Group(func(r chi.Router) {
		r.Use(AuthMiddleware)
		r.Post("/api/upload", HandleUploadResource)
		r.Get("/api/profile", HandleGetProfile)
		r.Get("/api/my-uploads", HandleGetUserUploads)
		r.Post("/api/resource/{id}/comments", HandlePostComment)

		r.Get("/api/notifications", HandleGetNotifications)
		r.Post("/api/notifications/{id}/read", HandleMarkNotificationAsRead)

		r.Put("/api/profile", HandleUpdateProfile)
		r.Post("/api/profile/avatar", HandleUpdateAvatar)

		r.Get("/api/users/search", HandleSearchUsers)
		r.Post("/api/resource/{id}/share", HandleShareResource)

		r.Post("/api/resource/{id}/like", HandleToggleLike)
		r.Get("/api/my-likes", HandleGetMyLikes)
		r.Post("/api/comment/{id}/like", HandleToggleCommentLike)
		r.Get("/api/my-comment-likes", HandleGetMyCommentLikes)

		r.Delete("/api/resource/{id}", HandleDeleteResource)
	})

	r.Group(func(r chi.Router) {
		r.Use(AuthMiddleware)
		r.Use(AdminMiddleware) // Proteção dupla!

		r.Post("/api/admin/tags", HandleCreateTag)
		r.Delete("/api/admin/tags/{id}", HandleDeleteTag)

		r.Post("/api/admin/courses", HandleCreateCourse)
		r.Delete("/api/admin/courses/{id}", HandleDeleteCourse)

		r.Post("/api/admin/professors", HandleCreateProfessor)
		r.Delete("/api/admin/professors/{id}", HandleDeleteProfessor)

	})
}
