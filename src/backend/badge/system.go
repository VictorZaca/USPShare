package badge

import "uspshare/models"

type Badge struct {
	ID          string
	Name        string
	Description string
	Rule        func(stats models.UserStats) bool
}

var AllBadges = []Badge{
	{
		ID:          "new_member",
		Name:        "Novo Membro",
		Description: "Criou uma conta e se juntou à comunidade.",
		Rule: func(stats models.UserStats) bool {
			return true
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
}

func EvaluateBadges(stats models.UserStats) []string {
	var earnedBadges []string
	for _, badge := range AllBadges {
		if badge.Rule(stats) {
			earnedBadges = append(earnedBadges, badge.Name)
		}
	}
	return earnedBadges
}
