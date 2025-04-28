"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { FileUploader } from "@/components/file-uploader"
import { TagInput } from "@/components/tag-input"
import { Check, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function UploadPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [course, setCourse] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [professor, setProfessor] = useState("")
  const [fileType, setFileType] = useState("")
  const [semester, setSemester] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, we would upload the file to a server here
    console.log({
      title,
      description,
      course,
      courseCode,
      professor,
      fileType,
      semester,
      isAnonymous,
      tags,
      file,
    })

    // Show success message
    setIsSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setTitle("")
      setDescription("")
      setCourse("")
      setCourseCode("")
      setProfessor("")
      setFileType("")
      setSemester("")
      setIsAnonymous(false)
      setTags([])
      setFile(null)
      setIsSubmitted(false)
    }, 3000)
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Compartilhar Material</h1>
        <p className="text-muted-foreground mb-8">
          Contribua com a comunidade USP compartilhando seus materiais de estudo
        </p>

        {isSubmitted ? (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Material enviado com sucesso!</AlertTitle>
            <AlertDescription>
              Obrigado por contribuir com a comunidade USPShare. Seu material será revisado e estará disponível em
              breve.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Informações do Material</CardTitle>
                <CardDescription>Preencha os detalhes do material que você está compartilhando</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload Section */}
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Arquivo</Label>
                  <FileUploader onFileSelect={(selectedFile) => setFile(selectedFile)} selectedFile={file} />
                  <p className="text-xs text-muted-foreground">Formatos aceitos: PDF, DOCX, JPG, PNG (máx. 10MB)</p>
                </div>

                {/* Basic Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Material*</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Prova P1 de Cálculo I"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file-type">Tipo de Material*</Label>
                    <Select value={fileType} onValueChange={setFileType} required>
                      <SelectTrigger id="file-type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prova">Prova</SelectItem>
                        <SelectItem value="lista">Lista de Exercícios</SelectItem>
                        <SelectItem value="resumo">Resumo</SelectItem>
                        <SelectItem value="enunciado">Enunciado</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva brevemente o conteúdo do material..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Course Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="course">Nome da Disciplina*</Label>
                    <Input
                      id="course"
                      placeholder="Ex: Cálculo I"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course-code">Código da Disciplina*</Label>
                    <Input
                      id="course-code"
                      placeholder="Ex: MAT0101"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="professor">Professor</Label>
                    <Input
                      id="professor"
                      placeholder="Ex: Prof. Silva"
                      value={professor}
                      onChange={(e) => setProfessor(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semestre/Ano*</Label>
                    <Select value={semester} onValueChange={setSemester} required>
                      <SelectTrigger id="semester">
                        <SelectValue placeholder="Selecione o semestre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2023-2">2023/2</SelectItem>
                        <SelectItem value="2023-1">2023/1</SelectItem>
                        <SelectItem value="2022-2">2022/2</SelectItem>
                        <SelectItem value="2022-1">2022/1</SelectItem>
                        <SelectItem value="2021-2">2021/2</SelectItem>
                        <SelectItem value="2021-1">2021/1</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <TagInput
                    tags={tags}
                    setTags={setTags}
                    placeholder="Adicione tags (ex: com-gabarito, difícil)"
                    maxTags={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Adicione até 5 tags para facilitar a busca do seu material
                  </p>
                </div>

                {/* Anonymous Switch */}
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="anonymous">Compartilhar Anonimamente</Label>
                    <p className="text-xs text-muted-foreground">
                      Seu nome não será exibido como contribuidor deste material
                    </p>
                  </div>
                  <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                </div>

                {/* Terms Alert */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Uso Ético dos Materiais</AlertTitle>
                  <AlertDescription>
                    Ao enviar este material, você confirma que ele não viola direitos autorais e concorda com os
                    <a href="/terms" className="font-medium underline underline-offset-4 ml-1">
                      termos de uso
                    </a>{" "}
                    da plataforma.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
                <Button type="submit">Enviar Material</Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </div>
  )
}
