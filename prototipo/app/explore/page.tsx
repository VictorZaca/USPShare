"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileCard } from "@/components/file-card"
import { Search, SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { mockFiles } from "@/lib/mock-data"

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [selectedFileType, setSelectedFileType] = useState<string>("all")

  const filteredFiles = mockFiles.filter((file) => {
    // Filter by search query
    const matchesSearch =
      file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.courseCode.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by file type
    const matchesType = selectedFileType === "all" || file.type === selectedFileType

    // Filter by active filters
    const matchesFilters = activeFilters.length === 0 || activeFilters.some((filter) => file.tags.includes(filter))

    return matchesSearch && matchesType && matchesFilters
  })

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  const clearFilters = () => {
    setActiveFilters([])
    setSelectedFileType("all")
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Explorar Materiais</h1>
        <p className="text-muted-foreground">
          Encontre provas, listas, resumos e outros materiais compartilhados pela comunidade USP
        </p>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por disciplina, código ou título..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={selectedFileType} onValueChange={setSelectedFileType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de Material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="prova">Provas</SelectItem>
                <SelectItem value="lista">Listas</SelectItem>
                <SelectItem value="resumo">Resumos</SelectItem>
                <SelectItem value="enunciado">Enunciados</SelectItem>
              </SelectContent>
            </Select>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtros</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtros Avançados</SheetTitle>
                  <SheetDescription>Refine sua busca com filtros específicos</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Ano/Semestre</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="2023-2" onCheckedChange={() => toggleFilter("2023-2")} />
                        <Label htmlFor="2023-2">2023/2</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="2023-1" onCheckedChange={() => toggleFilter("2023-1")} />
                        <Label htmlFor="2023-1">2023/1</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="2022-2" onCheckedChange={() => toggleFilter("2022-2")} />
                        <Label htmlFor="2022-2">2022/2</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="2022-1" onCheckedChange={() => toggleFilter("2022-1")} />
                        <Label htmlFor="2022-1">2022/1</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Tags</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="com-gabarito"
                          checked={activeFilters.includes("com-gabarito")}
                          onCheckedChange={() => toggleFilter("com-gabarito")}
                        />
                        <Label htmlFor="com-gabarito">Com Gabarito</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="dificil"
                          checked={activeFilters.includes("dificil")}
                          onCheckedChange={() => toggleFilter("dificil")}
                        />
                        <Label htmlFor="dificil">Difícil</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="conceitual"
                          checked={activeFilters.includes("conceitual")}
                          onCheckedChange={() => toggleFilter("conceitual")}
                        />
                        <Label htmlFor="conceitual">Conceitual</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pratico"
                          checked={activeFilters.includes("pratico")}
                          onCheckedChange={() => toggleFilter("pratico")}
                        />
                        <Label htmlFor="pratico">Prático</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Professores</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="prof-silva" onCheckedChange={() => toggleFilter("prof-silva")} />
                        <Label htmlFor="prof-silva">Prof. Silva</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="prof-santos" onCheckedChange={() => toggleFilter("prof-santos")} />
                        <Label htmlFor="prof-santos">Prof. Santos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="prof-oliveira" onCheckedChange={() => toggleFilter("prof-oliveira")} />
                        <Label htmlFor="prof-oliveira">Prof. Oliveira</Label>
                      </div>
                    </div>
                  </div>

                  <Button onClick={clearFilters} variant="outline" className="w-full">
                    Limpar Filtros
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {activeFilters.map((filter) => (
              <Badge key={filter} variant="secondary" className="cursor-pointer" onClick={() => toggleFilter(filter)}>
                {filter} ×
              </Badge>
            ))}
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearFilters}>
              Limpar todos
            </Button>
          </div>
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="relevantes" className="mt-6">
          <TabsList>
            <TabsTrigger value="relevantes">Mais Relevantes</TabsTrigger>
            <TabsTrigger value="recentes">Mais Recentes</TabsTrigger>
            <TabsTrigger value="populares">Mais Populares</TabsTrigger>
          </TabsList>

          <TabsContent value="relevantes" className="mt-6">
            {filteredFiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFiles.map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">Nenhum material encontrado</h3>
                <p className="text-muted-foreground mt-2">Tente ajustar seus filtros ou buscar por outro termo</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recentes" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...filteredFiles]
                .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
                .map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="populares" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...filteredFiles]
                .sort((a, b) => b.likes - a.likes)
                .map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
