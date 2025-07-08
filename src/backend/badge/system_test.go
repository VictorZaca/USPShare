package badge

import (
	"reflect"
	"testing"
	"uspshare/models"
)

func TestEvaluateBadges(t *testing.T) {
	testCases := []struct {
		name     string
		stats    models.UserStats
		expected []string
	}{
		{
			name:     "Usuário Novo Sem Ações",
			stats:    models.UserStats{Uploads: 0, Comments: 0},
			expected: []string{"Novo Membro"},
		},
		{
			name:     "Usuário com 1 Upload",
			stats:    models.UserStats{Uploads: 1, Comments: 5},
			expected: []string{"Novo Membro", "Colaborador"},
		},
		{
			name:     "Usuário com 10 Uploads",
			stats:    models.UserStats{Uploads: 10, Comments: 15},
			expected: []string{"Novo Membro", "Colaborador", "Mestre dos Uploads"},
		},
		{
			name:     "Usuário com 25 Comentários e 12 Uploads",
			stats:    models.UserStats{Uploads: 12, Comments: 25},
			expected: []string{"Novo Membro", "Colaborador", "Mestre dos Uploads", "Comentarista Ativo"},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result := EvaluateBadges(tc.stats)

			if !reflect.DeepEqual(result, tc.expected) {
				t.Errorf("Para o caso '%s', esperado %v, mas obtido %v", tc.name, tc.expected, result)
			}
		})
	}
}
