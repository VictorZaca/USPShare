package api

import (
	"context"
	"log"
	"net/http"
	"strings"
	"uspshare/config"

	"github.com/golang-jwt/jwt/v5"
)

// Criamos um tipo customizado para a chave do contexto para evitar colisões
type contextKey string

const userContextKey = contextKey("userId")

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Missing authorization header"})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Invalid token format"})
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, log.Output(1, "Unexpected signing method")
			}
			return []byte(config.JWT_SECRET), nil
		})

		if err != nil || !token.Valid {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Invalid or expired token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Invalid token claims"})
			return
		}

		userId := claims["userId"].(string)

		// --- A MUDANÇA PRINCIPAL ---
		// Adiciona o userId ao contexto da requisição
		ctx := context.WithValue(r.Context(), userContextKey, userId)
		// Passa a requisição para o próximo handler com o novo contexto
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
