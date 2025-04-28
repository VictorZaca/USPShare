import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, FileText, MessageSquare, ThumbsUp, User } from "lucide-react"

interface FileCardProps {
  file: {
    id: string
    title: string
    description?: string
    type: string
    course: string
    courseCode: string
    professor: string
    semester: string
    uploadDate: string
    uploader?: string
    tags: string[]
    likes: number
    comments: number
  }
}

export function FileCard({ file }: FileCardProps) {
  return (
    <Card className="overflow-hidden file-card-hover">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <Badge variant="outline" className="mb-2">
              {file.type}
            </Badge>
            <Link href={`/file/${file.id}`} className="hover:underline">
              <h3 className="font-semibold line-clamp-2">{file.title}</h3>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 pb-2">
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            <span>
              {file.course} ({file.courseCode})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            <span>{file.professor}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>{file.semester}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          {file.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {file.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{file.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex items-center justify-between border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{file.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{file.comments}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Avatar className="h-5 w-5">
            <AvatarImage src="/placeholder.svg" alt="Avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <span>{file.uploader || "Anônimo"}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
