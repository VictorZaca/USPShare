"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface CommentCardProps {
  comment: {
    id: string
    user: {
      name: string
      avatar?: string
    }
    content: string
    date: string
    likes: number
  }
}

export function CommentCard({ comment }: CommentCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(comment.likes)

  const handleLike = () => {
    if (liked) {
      setLikeCount((prev) => prev - 1)
    } else {
      setLikeCount((prev) => prev + 1)
    }
    setLiked(!liked)
  }

  return (
    <div className="flex gap-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
        <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">{comment.user.name}</span>
            <span className="text-xs text-muted-foreground">{new Date(comment.date).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1" onClick={handleLike}>
            <ThumbsUp className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
            <span>{likeCount > 0 ? likeCount : ""}</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
            Responder
          </Button>
        </div>
      </div>
    </div>
  )
}
