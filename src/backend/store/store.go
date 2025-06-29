package store

import (
	"context"
	"log"
	"sort"
	"time"

	"uspshare/database"
	"uspshare/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"

	"go.mongodb.org/mongo-driver/mongo"
)

func CreateUser(user *models.User) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.ID = primitive.NewObjectID()
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

func ListResources() ([]bson.M, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "likes"},
			{Key: "localField", Value: "_id"},
			{Key: "foreignField", Value: "resourceId"},
			{Key: "as", Value: "likeData"},
		}}},
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "users"},
			{Key: "localField", Value: "userId"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "uploaderInfo"},
		}}},
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "professors"},
			{Key: "localField", Value: "professorId"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "professorInfo"},
		}}},

		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "comments"},
			{Key: "localField", Value: "_id"},
			{Key: "foreignField", Value: "resourceId"},
			{Key: "as", Value: "commentData"},
		}}},

		{{Key: "$unwind", Value: bson.D{{Key: "path", Value: "$uploaderInfo"}, {Key: "preserveNullAndEmptyArrays", Value: true}}}},
		{{Key: "$unwind", Value: bson.D{{Key: "path", Value: "$professorInfo"}, {Key: "preserveNullAndEmptyArrays", Value: true}}}},

		{{Key: "$addFields", Value: bson.D{
			{Key: "id", Value: "$_id"},
			{Key: "uploaderName", Value: "$uploaderInfo.name"},
			{Key: "uploaderAvatar", Value: "$uploaderInfo.avatarUrl"},
			{Key: "professorName", Value: "$professorInfo.name"},
			{Key: "professorAvatar", Value: "$professorInfo.avatarUrl"},
			{Key: "likes", Value: bson.D{{Key: "$size", Value: "$likeData"}}},
			{Key: "comments", Value: bson.D{{Key: "$size", Value: "$commentData"}}},
		}}},
		{{Key: "$project", Value: bson.D{{Key: "likeData", Value: 0}}}},
	}

	cursor, err := database.ResourceCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	return results, nil
}

func GetUserByID(id primitive.ObjectID) (*models.User, error) {
	var user models.User
	err := database.UserCollection.FindOne(context.TODO(), bson.M{"_id": id}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func GetResourcesByUserID(userID primitive.ObjectID) ([]bson.M, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.D{{Key: "userId", Value: userID}}}},

		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "likes"},
			{Key: "localField", Value: "_id"},
			{Key: "foreignField", Value: "resourceId"},
			{Key: "as", Value: "likeData"},
		}}},
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "comments"},
			{Key: "localField", Value: "_id"},
			{Key: "foreignField", Value: "resourceId"},
			{Key: "as", Value: "commentData"},
		}}},
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "users"},
			{Key: "localField", Value: "userId"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "uploaderInfo"},
		}}},
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "professors"},
			{Key: "localField", Value: "professorId"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "professorInfo"},
		}}},
		{{Key: "$unwind", Value: bson.D{
			{Key: "path", Value: "$uploaderInfo"},
			{Key: "preserveNullAndEmptyArrays", Value: true},
		}}},
		{{Key: "$unwind", Value: bson.D{
			{Key: "path", Value: "$professorInfo"},
			{Key: "preserveNullAndEmptyArrays", Value: true},
		}}},
		{{Key: "$addFields", Value: bson.D{
			{Key: "id", Value: "$_id"},
			{Key: "likes", Value: bson.D{{Key: "$size", Value: "$likeData"}}},
			{Key: "comments", Value: bson.D{{Key: "$size", Value: "$commentData"}}},
			{Key: "uploaderName", Value: "$uploaderInfo.name"},
			{Key: "uploaderAvatar", Value: "$uploaderInfo.avatarUrl"},
			{Key: "professorName", Value: "$professorInfo.name"},
			{Key: "professorAvatar", Value: "$professorInfo.avatarUrl"},
		}}},
		{{Key: "$sort", Value: bson.D{{Key: "uploadDate", Value: -1}}}},
		{{Key: "$project", Value: bson.D{
			{Key: "_id", Value: 0},
			{Key: "likeData", Value: 0},
			{Key: "commentData", Value: 0},
			{Key: "uploaderInfo", Value: 0},
			{Key: "professorInfo", Value: 0},
		}}},
	}

	cursor, err := database.ResourceCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	return results, nil
}

func CountUserUploads(userID primitive.ObjectID) (int64, error) {
	count, err := database.ResourceCollection.CountDocuments(context.TODO(), bson.M{"userId": userID})
	if err != nil {
		return 0, err
	}
	return count, nil
}

func CreateResource(resource *models.Resource) error {
	_, err := database.ResourceCollection.InsertOne(context.TODO(), resource)
	return err
}

func GetResourceByID(id primitive.ObjectID) (bson.M, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.D{{Key: "_id", Value: id}}}},
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "users"},
			{Key: "localField", Value: "userId"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "uploaderInfo"},
		}}},
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "professors"},
			{Key: "localField", Value: "professorId"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "professorInfo"},
		}}},
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "likes"},
			{Key: "localField", Value: "_id"},
			{Key: "foreignField", Value: "resourceId"},
			{Key: "as", Value: "likeData"},
		}}},
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "comments"},
			{Key: "localField", Value: "_id"},
			{Key: "foreignField", Value: "resourceId"},
			{Key: "as", Value: "commentData"},
		}}},
		{{Key: "$unwind", Value: bson.D{
			{Key: "path", Value: "$uploaderInfo"},
			{Key: "preserveNullAndEmptyArrays", Value: true},
		}}},
		{{Key: "$unwind", Value: bson.D{
			{Key: "path", Value: "$professorInfo"},
			{Key: "preserveNullAndEmptyArrays", Value: true},
		}}},
		{{Key: "$addFields", Value: bson.D{
			{Key: "uploaderName", Value: "$uploaderInfo.name"},
			{Key: "uploaderAvatar", Value: "$uploaderInfo.avatarUrl"},
			{Key: "professorName", Value: "$professorInfo.name"},
			{Key: "professorAvatar", Value: "$professorInfo.avatarUrl"},
			{Key: "likes", Value: bson.D{{Key: "$size", Value: "$likeData"}}},
			{Key: "comments", Value: bson.D{{Key: "$size", Value: "$commentData"}}},
		}}},
	}
	cursor, err := database.ResourceCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}
	if len(results) == 0 {
		return nil, mongo.ErrNoDocuments
	}
	return results[0], nil
}

func CreateComment(comment *models.Comment) error {
	_, err := database.CommentCollection.InsertOne(context.TODO(), comment)
	return err
}

func GetCommentsByResourceID(resourceID primitive.ObjectID) ([]*models.CommentWithAuthor, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{"$match", bson.D{{"resourceId", resourceID}}}},
		{{"$lookup", bson.D{{"from", "users"}, {"localField", "userId"}, {"foreignField", "_id"}, {"as", "authorInfo"}}}},
		{{"$lookup", bson.D{{"from", "comment_likes"}, {"localField", "_id"}, {"foreignField", "commentId"}, {"as", "likeData"}}}},
		{{"$unwind", "$authorInfo"}},
		{{"$addFields", bson.D{
			{"authorName", "$authorInfo.name"},
			{"authorAvatar", "$authorInfo.avatarUrl"},
			{"likes", bson.D{{"$size", "$likeData"}}},
		}}},
		{{"$project", bson.D{{"authorInfo", 0}, {"likeData", 0}}}},
	}

	cursor, err := database.CommentCollection.Aggregate(ctx, pipeline)
	if err != nil {
		log.Printf("Erro na agregação do MongoDB: %v", err)
		return nil, err
	}
	defer cursor.Close(ctx)

	type tempComment struct {
		ID           primitive.ObjectID  `bson:"_id"`
		ParentID     *primitive.ObjectID `bson:"parentId"`
		Content      string              `bson:"content"`
		CreatedAt    time.Time           `bson:"createdAt"`
		AuthorName   string              `bson:"authorName"`
		AuthorAvatar string              `bson:"authorAvatar"`
		Replies      []tempComment       `bson:"replies,omitempty"`
		Likes        int                 `bson:"likes"`
	}

	var allComments []tempComment
	if err = cursor.All(ctx, &allComments); err != nil {
		return nil, err
	}

	commentMap := make(map[primitive.ObjectID]*models.CommentWithAuthor)

	for _, c := range allComments {
		commentMap[c.ID] = &models.CommentWithAuthor{
			ID:           c.ID,
			ParentID:     c.ParentID,
			Content:      c.Content,
			CreatedAt:    c.CreatedAt,
			AuthorName:   c.AuthorName,
			AuthorAvatar: c.AuthorAvatar,
			Replies:      []*models.CommentWithAuthor{},
			Likes:        c.Likes,
		}
	}

	var rootComments []*models.CommentWithAuthor
	for _, commentNode := range commentMap {
		if commentNode.ParentID != nil {
			if parent, ok := commentMap[*commentNode.ParentID]; ok {
				parent.Replies = append(parent.Replies, commentNode)
			}
		} else {
			rootComments = append(rootComments, commentNode)
		}
	}

	sortCommentsRecursive(rootComments)

	return rootComments, nil
}

func sortCommentsRecursive(comments []*models.CommentWithAuthor) {
	sort.Slice(comments, func(i, j int) bool {
		return comments[i].CreatedAt.After(comments[j].CreatedAt)
	})

	for _, c := range comments {
		if len(c.Replies) > 0 {
			sortCommentsRecursive(c.Replies)
		}
	}
}

func CreateNotification(notification *models.Notification) error {
	_, err := database.NotificationCollection.InsertOne(context.TODO(), notification)
	return err
}

func GetNotificationsByUserID(userID primitive.ObjectID) ([]models.Notification, error) {
	var notifications []models.Notification
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetLimit(50)

	cursor, err := database.NotificationCollection.Find(ctx, bson.M{"userId": userID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &notifications); err != nil {
		return nil, err
	}

	if notifications == nil {
		return []models.Notification{}, nil
	}

	return notifications, nil
}

func MarkNotificationAsRead(notificationID, userID primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{
		"_id":    notificationID,
		"userId": userID,
	}

	update := bson.M{
		"$set": bson.M{"isRead": true},
	}

	_, err := database.NotificationCollection.UpdateOne(ctx, filter, update)
	return err
}

func GetCommentByID(id primitive.ObjectID) (*models.Comment, error) {
	var comment models.Comment
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err := database.CommentCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&comment)
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

func GetCommentWithAuthorByID(commentID primitive.ObjectID) (*models.CommentWithAuthor, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.D{{Key: "_id", Value: commentID}}}},
		{{Key: "$lookup", Value: bson.D{{Key: "from", Value: "users"}, {Key: "localField", Value: "userId"}, {Key: "foreignField", Value: "_id"}, {Key: "as", Value: "authorInfo"}}}},
		{{Key: "$lookup", Value: bson.D{{Key: "from", Value: "comment_likes"}, {Key: "localField", Value: "_id"}, {Key: "foreignField", Value: "commentId"}, {Key: "as", Value: "likeData"}}}},
		{{Key: "$unwind", Value: "$authorInfo"}},
		{{Key: "$addFields", Value: bson.D{
			{Key: "authorName", Value: "$authorInfo.name"},
			{Key: "authorAvatar", Value: "$authorInfo.avatarUrl"},
			{Key: "likes", Value: bson.D{{Key: "$size", Value: "$likeData"}}},
		}}},
		{{Key: "$project", Value: bson.D{{Key: "authorInfo", Value: 0}, {Key: "likeData", Value: 0}}}},
	}

	cursor, err := database.CommentCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []models.CommentWithAuthor
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	if len(results) == 0 {
		return nil, mongo.ErrNoDocuments
	}

	return &results[0], nil
}

func CountUserComments(userID primitive.ObjectID) (int64, error) {
	count, err := database.CommentCollection.CountDocuments(context.TODO(), bson.M{"userId": userID})
	if err != nil {
		return 0, err
	}
	return count, nil
}

func UpdateUserByID(id primitive.ObjectID, update bson.M) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"_id": id}

	_, err := database.UserCollection.UpdateOne(ctx, filter, update)

	return err
}

type CourseInfo struct {
	Code string `json:"code" bson:"_id"`
	Name string `json:"name" bson:"name"`
}

func GetDistinctCourses() ([]CourseInfo, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{"$group", bson.D{
			{"_id", "$courseCode"},
			{"name", bson.D{{"$first", "$course"}}},
		}}},
		{{"$sort", bson.D{{"_id", 1}}}},
	}

	cursor, err := database.ResourceCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var courses []CourseInfo
	if err = cursor.All(ctx, &courses); err != nil {
		return nil, err
	}
	return courses, nil
}

func GetDistinctFieldValues(fieldName string) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	values, err := database.ResourceCollection.Distinct(ctx, fieldName, bson.M{})
	if err != nil {
		return nil, err
	}

	var stringValues []string
	for _, v := range values {
		if str, ok := v.(string); ok {
			stringValues = append(stringValues, str)
		}
	}
	sort.Strings(stringValues)
	return stringValues, nil
}

func ListCourses() ([]models.Course, error) {
	var items []models.Course
	cursor, err := database.CourseCollection.Find(context.TODO(), bson.M{}, options.Find().SetSort(bson.D{{"code", 1}}))
	if err != nil {
		return nil, err
	}
	if err = cursor.All(context.TODO(), &items); err != nil {
		return nil, err
	}
	return items, nil
}
func CreateCourse(item *models.Course) error {
	_, err := database.CourseCollection.InsertOne(context.TODO(), item)
	return err
}
func DeleteCourseByID(id primitive.ObjectID) error {
	_, err := database.CourseCollection.DeleteOne(context.TODO(), bson.M{"_id": id})
	return err
}

func ListProfessors() ([]models.Professor, error) {
	var items []models.Professor
	cursor, err := database.ProfessorCollection.Find(context.TODO(), bson.M{}, options.Find().SetSort(bson.D{{"name", 1}}))
	if err != nil {
		return nil, err
	}
	if err = cursor.All(context.TODO(), &items); err != nil {
		return nil, err
	}
	return items, nil
}
func CreateProfessor(item *models.Professor) error {
	_, err := database.ProfessorCollection.InsertOne(context.TODO(), item)
	return err
}
func DeleteProfessorByID(id primitive.ObjectID) error {
	_, err := database.ProfessorCollection.DeleteOne(context.TODO(), bson.M{"_id": id})
	return err
}

func ListTags() ([]models.Tag, error) {
	var items []models.Tag
	cursor, err := database.TagCollection.Find(context.TODO(), bson.M{}, options.Find().SetSort(bson.D{{"name", 1}}))
	if err != nil {
		return nil, err
	}
	if err = cursor.All(context.TODO(), &items); err != nil {
		return nil, err
	}
	return items, nil
}
func CreateTag(item *models.Tag) error {
	_, err := database.TagCollection.InsertOne(context.TODO(), item)
	return err
}
func DeleteTagByID(id primitive.ObjectID) error {
	_, err := database.TagCollection.DeleteOne(context.TODO(), bson.M{"_id": id})
	return err
}

func SearchUsersByNameOrEmail(query string, selfID primitive.ObjectID) ([]models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{
		"_id": bson.M{"$ne": selfID},
		"$or": []bson.M{
			{"name": bson.M{"$regex": query, "$options": "i"}},
			{"email": bson.M{"$regex": query, "$options": "i"}},
		},
	}

	projection := bson.M{"password": 0}
	opts := options.Find().SetProjection(projection).SetLimit(10)

	cursor, err := database.UserCollection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err = cursor.All(ctx, &users); err != nil {
		return nil, err
	}

	return users, nil
}

func CreateLike(like *models.Like) error {
	_, err := database.LikeCollection.InsertOne(context.TODO(), like)
	return err
}

func DeleteLike(userID, resourceID primitive.ObjectID) error {
	_, err := database.LikeCollection.DeleteOne(context.TODO(), bson.M{"userId": userID, "resourceId": resourceID})
	return err
}

func HasUserLikedResource(userID, resourceID primitive.ObjectID) (bool, error) {
	count, err := database.LikeCollection.CountDocuments(context.TODO(), bson.M{"userId": userID, "resourceId": resourceID})
	return count > 0, err
}

func CountLikesForResource(resourceID primitive.ObjectID) (int64, error) {
	return database.LikeCollection.CountDocuments(context.TODO(), bson.M{"resourceId": resourceID})
}

func CountLikesReceivedByUser(userID primitive.ObjectID) (int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{"$match", bson.D{{"userId", userID}}}},
		{{"$lookup", bson.D{
			{"from", "likes"},
			{"localField", "_id"},
			{"foreignField", "resourceId"},
			{"as", "likesData"},
		}}},
		{{"$addFields", bson.D{
			{"likeCount", bson.D{{"$size", "$likesData"}}},
		}}},
		{{"$group", bson.D{
			{"_id", nil},
			{"totalLikes", bson.D{{"$sum", "$likeCount"}}},
		}}},
	}

	cursor, err := database.ResourceCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return 0, err
	}
	defer cursor.Close(ctx)

	var results []struct {
		TotalLikes int64 `bson:"totalLikes"`
	}
	if cursor.Next(ctx) {
		if err := cursor.Decode(&results); err != nil {
			var result struct {
				TotalLikes int64 `bson:"totalLikes"`
			}
			if err := cursor.Decode(&result); err == nil {
				return result.TotalLikes, nil
			}
		}
		if len(results) > 0 {
			return results[0].TotalLikes, nil
		}
	}
	return 0, nil
}

func GetUserLikedResourceIDs(userID primitive.ObjectID) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"userId": userID}
	cursor, err := database.LikeCollection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var likedResourceIDs []string
	for cursor.Next(ctx) {
		var like models.Like
		if err := cursor.Decode(&like); err == nil {
			likedResourceIDs = append(likedResourceIDs, like.ResourceID.Hex())
		}
	}
	return likedResourceIDs, nil
}

func LikeComment(like *models.CommentLike) error {
	_, err := database.CommentLikeCollection.InsertOne(context.TODO(), like)
	return err
}

func UnlikeComment(userID, commentID primitive.ObjectID) error {
	_, err := database.CommentLikeCollection.DeleteOne(context.TODO(), bson.M{"userId": userID, "commentId": commentID})
	return err
}

func HasUserLikedComment(userID, commentID primitive.ObjectID) (bool, error) {
	count, err := database.CommentLikeCollection.CountDocuments(context.TODO(), bson.M{"userId": userID, "commentId": commentID})
	return count > 0, err
}

func CountLikesForComment(commentID primitive.ObjectID) (int64, error) {
	return database.CommentLikeCollection.CountDocuments(context.TODO(), bson.M{"commentId": commentID})
}

func GetUserLikedCommentIDs(userID primitive.ObjectID) ([]string, error) {
	var likedCommentIDs []string
	cursor, err := database.CommentLikeCollection.Find(context.TODO(), bson.M{"userId": userID})
	if err != nil {
		return nil, err
	}
	for cursor.Next(context.TODO()) {
		var like models.CommentLike
		if err := cursor.Decode(&like); err == nil {
			likedCommentIDs = append(likedCommentIDs, like.CommentID.Hex())
		}
	}
	return likedCommentIDs, nil
}

func FindRelatedResources(courseCode string, currentResourceID primitive.ObjectID) ([]bson.M, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"courseCode": courseCode,
		"_id":        bson.M{"$ne": currentResourceID},
	}

	pipeline := mongo.Pipeline{
		{{"$match", filter}},
		{{"$limit", 4}},

		{{"$lookup", bson.D{
			{"from", "professors"},
			{"localField", "professorId"},
			{"foreignField", "_id"},
			{"as", "professorInfo"},
		}}},
		{{"$unwind", bson.D{{"path", "$professorInfo"}, {"preserveNullAndEmptyArrays", true}}}},

		{{"$addFields", bson.D{
			{"id", "$_id"},
			{"professorName", "$professorInfo.name"},
			{"professorAvatar", "$professorInfo.avatarUrl"},
		}}},

		{{"$project", bson.D{
			{"title", 1},
			{"type", 1},
			{"id", 1},
			{"professorName", 1},
			{"professorAvatar", 1},
		}}},
	}

	cursor, err := database.ResourceCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	return results, nil
}

func DeleteResourceByID(resourceID, userID primitive.ObjectID) error {
	ctx := context.TODO()

	filter := bson.M{"_id": resourceID, "userId": userID}

	result, err := database.ResourceCollection.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}
	if result.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}

	_, err = database.LikeCollection.DeleteMany(ctx, bson.M{"resourceId": resourceID})
	if err != nil {
		log.Printf("Aviso: falha ao deletar likes do recurso %s: %v", resourceID.Hex(), err)
	}

	_, err = database.CommentCollection.DeleteMany(ctx, bson.M{"resourceId": resourceID})
	if err != nil {
		log.Printf("Aviso: falha ao deletar comentários do recurso %s: %v", resourceID.Hex(), err)
	}

	return nil
}
