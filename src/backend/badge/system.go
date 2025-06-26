package badge

import "uspshare/models" // Certifique-se que o caminho do import está correto

// Badge define a estrutura de uma conquista
type Badge struct {
	ID          string
	Name        string
	Description string
	// A regra é uma função que recebe as estatísticas do usuário e retorna 'true' se ele ganhou a badge
	Rule func(stats models.UserStats) bool
}

// AllBadges é a nossa lista central de todas as conquistas possíveis na plataforma.
// Para criar uma nova badge, basta adicioná-la aqui com uma nova regra.
var AllBadges = []Badge{
	{
		ID:          "new_member",
		Name:        "Novo Membro",
		Description: "Criou uma conta e se juntou à comunidade.",
		Rule: func(stats models.UserStats) bool {
			return true // Todo mundo que tem um perfil é um novo membro
		},
	},
	{
		ID:          "first_upload",
		Name:        "Colaborador",
		Description: "Compartilhou o primeiro material.",
		Rule: func(stats models.UserStats) bool {
			return stats.Uploads >= 1
		},
	},
	{
		ID:          "prolific_uploader",
		Name:        "Mestre dos Uploads",
		Description: "Compartilhou 10 ou mais materiais.",
		Rule: func(stats models.UserStats) bool {
			return stats.Uploads >= 10
		},
	},
	{
		ID:          "prolific_commenter",
		Name:        "Comentarista Ativo",
		Description: "Fez 20 ou mais comentários.",
		Rule: func(stats models.UserStats) bool {
			return stats.Comments >= 20
		},
	},
	// Adicione mais badges aqui no futuro!
	// Ex: { ID: "well_liked", Name: "Popular", Rule: func(stats) { return stats.Likes >= 100 } },
}

// EvaluateBadges recebe as estatísticas de um usuário e retorna um slice de strings
// com os nomes das badges que ele conquistou.
func EvaluateBadges(stats models.UserStats) []string {
	var earnedBadges []string
	for _, badge := range AllBadges {
		if badge.Rule(stats) {
			earnedBadges = append(earnedBadges, badge.Name)
		}
	}
	return earnedBadges
}
