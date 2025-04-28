"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Calendar, Download, FileText, MessageSquare, Share2, ThumbsUp, User } from "lucide-react"
import { mockFiles } from "@/lib/mock-data"
import { CommentCard } from "@/components/comment-card"
import { mockComments } from "@/lib/mock-data"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function FilePage({ params }: { params: { id: string } }) {
  const [comment, setComment] = useState("")
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  // In a real app, we would fetch the file data from an API
  const file = mockFiles.find((f) => f.id === params.id) || mockFiles[0]

  const handleLike = () => {
    if (liked) {
      setLikeCount((prev) => prev - 1)
    } else {
      setLikeCount((prev) => prev + 1)
    }
    setLiked(!liked)
  }

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, we would send the comment to an API
    console.log("Comment submitted:", comment)
    setComment("")
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-6 md:grid-cols-3">
          {/* File Preview */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex flex-col space-y-2">
              <h1 className="text-2xl font-bold">{file.title}</h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{file.type}</Badge>
                {file.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center p-4">
                <FileText className="h-16 w-16 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Pré-visualização do arquivo</p>
                <Button variant="outline" className="mt-4">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Abrir Visualização
                </Button>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" className="gap-2" onClick={handleLike}>
                <ThumbsUp className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                Útil ({likeCount + file.likes})
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Descrição</h2>
              <p className="text-gray-700 dark:text-gray-300">{file.description || "Sem descrição disponível."}</p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Comentários</h2>
                <Badge variant="outline" className="gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {mockComments.length}
                </Badge>
              </div>

              <form onSubmit={handleComment} className="space-y-4">
                <Textarea
                  placeholder="Adicione um comentário..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={!comment.trim()}>
                    Comentar
                  </Button>
                </div>
              </form>

              <div className="space-y-4 pt-4">
                {mockComments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </div>
            </div>
          </div>

          {/* File Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
              <h2 className="font-semibold">Informações do Material</h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Disciplina</p>
                    <p className="font-medium">
                      {file.course} ({file.courseCode})
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Professor</p>
                    <p className="font-medium">{file.professor}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Semestre</p>
                    <p className="font-medium">{file.semester}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Enviado por</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src="/placeholder.svg" alt="Avatar" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{file.uploader || "Anônimo"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Data de upload</p>
                    <p className="font-medium">{new Date(file.uploadDate).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900">
              <AlertDescription>
                Encontrou algum problema com este material?
                <a href="/report" className="font-medium underline underline-offset-4 ml-1">
                  Reportar
                </a>
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
              <h2 className="font-semibold">Materiais Relacionados</h2>
              <div className="space-y-3">
                {mockFiles
                  .filter((f) => f.courseCode === file.courseCode && f.id !== file.id)
                  .slice(0, 3)
                  .map((relatedFile) => (
                    <a
                      key={relatedFile.id}
                      href={`/file/${relatedFile.id}`}
                      className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-0.5 text-gray-500" />
                        <div>
                          <p className="font-medium line-clamp-1">{relatedFile.title}</p>
                          <p className="text-xs text-gray-500">
                            {relatedFile.type} • {relatedFile.semester}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
