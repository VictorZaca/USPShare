package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserStats struct {
	Uploads    int `json:"uploads" bson:"uploads"`
	Likes      int `json:"likes" bson:"likes"`
	Comments   int `json:"comments" bson:"comments"`
	Reputation int `json:"reputation" bson:"reputation"`
}

type User struct {
	ID         primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Name       string             `json:"name" bson:"name"`
	Email      string             `json:"email" bson:"email"`
	Password   string             `json:"-" bson:"password"`
	CreatedAt  time.Time          `json:"createdAt" bson:"createdAt"`
	Course     string             `json:"course" bson:"course"`
	Faculty    string             `json:"faculty" bson:"faculty"`
	YearJoined string             `json:"yearJoined" bson:"yearJoined"`
	Bio        string             `json:"bio" bson:"bio"`
	AvatarURL  string             `json:"avatar" bson:"avatarUrl"`
	Badges     []string           `json:"badges" bson:"badges"`
	Stats      UserStats          `json:"stats" bson:"stats"`

	Role string `json:"role,omitempty" bson:"role,omitempty"` // "user" ou "admin"
}

type Course struct {
	ID   primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Code string             `json:"code" bson:"code"`
	Name string             `json:"name" bson:"name"`
}

type Professor struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name      string             `json:"name" bson:"name"`
	AvatarURL string             `json:"avatarUrl,omitempty" bson:"avatarUrl,omitempty"`
}

type Tag struct {
	ID   primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Name string             `json:"name" bson:"name"`
}

type Resource struct {
	ID          primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	UserID      primitive.ObjectID  `json:"userId" bson:"userId"`
	ProfessorID *primitive.ObjectID `json:"professorId,omitempty" bson:"professorId,omitempty"`
	CourseCode  string              `json:"courseCode" bson:"courseCode"`
	Course      string              `json:"course" bson:"course"`
	Type        string              `json:"type" bson:"type"`
	FileName    string              `json:"fileName" bson:"fileName"`
	FileUrl     string              `json:"fileUrl" bson:"fileUrl"`
	UploadDate  time.Time           `json:"uploadDate" bson:"uploadDate"`
	Likes       int                 `json:"likes" bson:"likes"`
	// --- CAMPOS ADICIONADOS ---
	Title       string   `json:"title" bson:"title"`
	Description string   `json:"description" bson:"description"`
	Semester    string   `json:"semester" bson:"semester"`
	Tags        []string `json:"tags" bson:"tags"`
	IsAnonymous bool     `json:"isAnonymous" bson:"isAnonymous"`
}

type Comment struct {
	ID         primitive.ObjectID  `json:"id" bson:"_id,omitempty"`
	ResourceID primitive.ObjectID  `json:"resourceId" bson:"resourceId"`
	UserID     primitive.ObjectID  `json:"userId" bson:"userId"`
	ParentID   *primitive.ObjectID `json:"parentId,omitempty" bson:"parentId,omitempty"`
	Content    string              `json:"content" bson:"content"`
	CreatedAt  time.Time           `json:"createdAt" bson:"createdAt"`
}

type Notification struct {
	ID         primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID     primitive.ObjectID `json:"userId" bson:"userId"`
	ActorName  string             `json:"actorName" bson:"actorName"`
	Type       string             `json:"type" bson:"type"`
	Message    string             `json:"message" bson:"message"`
	ResourceID primitive.ObjectID `json:"resourceId" bson:"resourceId"`
	CommentID  primitive.ObjectID `json:"commentId" bson:"commentId"`
	IsRead     bool               `json:"isRead" bson:"isRead"`
	CreatedAt  time.Time          `json:"createdAt" bson:"createdAt"`
}

type CommentWithAuthor struct {
	ID           primitive.ObjectID   `json:"id" bson:"_id,omitempty"`
	Content      string               `json:"content" bson:"content"`
	CreatedAt    time.Time            `json:"createdAt" bson:"createdAt"`
	AuthorName   string               `json:"authorName" bson:"authorName"`
	AuthorAvatar string               `json:"authorAvatar,omitempty" bson:"authorAvatar,omitempty"`
	ParentID     *primitive.ObjectID  `json:"parentId,omitempty" bson:"parentId,omitempty"`
	Replies      []*CommentWithAuthor `json:"replies,omitempty"` // Slice de ponteiros para si mesmo
	Likes        int                  `json:"likes" bson:"likes"`
}

type Like struct {
	ID         primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID     primitive.ObjectID `json:"userId" bson:"userId"`
	ResourceID primitive.ObjectID `json:"resourceId" bson:"resourceId"`
	CreatedAt  time.Time          `json:"createdAt" bson:"createdAt"`
}

type CommentLike struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID    primitive.ObjectID `json:"userId" bson:"userId"`
	CommentID primitive.ObjectID `json:"commentId" bson:"commentId"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
}
