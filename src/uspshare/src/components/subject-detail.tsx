"use client"

import { FileCard } from "@/components/file-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

interface SubjectDetailProps {
  subject: {
    courseCode: string
    course: string
    files: any[]
  }
  selectedFileType: string
  activeFilters: string[]
  sortBy?: "recent" | "popular" | "default"
}

export function SubjectDetail({ subject, selectedFileType, activeFilters, sortBy = "default" }: SubjectDetailProps) {
  const [activeTab, setActiveTab] = useState<string>("all")
  const [showAll, setShowAll] = useState(false)

  // Get unique file types in this subject
  const fileTypes = Array.from(new Set(subject.files.map((file) => file.type)))

  // Filter files based on selected type and active filters
  let filteredFiles = subject.files.filter((file) => {
    const matchesType = selectedFileType === "all" || file.type === selectedFileType
    const matchesActiveTab = activeTab === "all" || file.type === activeTab
    const matchesFilters = activeFilters.length === 0 || activeFilters.some((filter) => file.tags.includes(filter))

    return matchesType && matchesActiveTab && matchesFilters
  })

  // Sort files based on sortBy prop
  if (sortBy === "recent") {
    filteredFiles = [...filteredFiles].sort(
      (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(),
    )
  } else if (sortBy === "popular") {
    filteredFiles = [...filteredFiles].sort((a, b) => b.likes - a.likes)
  }

  // Limit displayed files unless showAll is true
  const displayedFiles = showAll ? filteredFiles : filteredFiles.slice(0, 6)
  const hasMoreFiles = filteredFiles.length > 6 && !showAll

  return (
    <div className="bg-muted/30 rounded-lg p-4 mt-1 border animate-in fade-in-50 slide-in-from-top-2 duration-300">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">Todos ({subject.files.length})</TabsTrigger>
          {fileTypes.map((type) => {
            const count = subject.files.filter((file) => file.type === type).length
            return (
              <TabsTrigger key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}s ({count})
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {displayedFiles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedFiles.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>

          {hasMoreFiles && (
            <div className="flex justify-center mt-6">
              <Button variant="outline" onClick={() => setShowAll(true)}>
                Ver todos os {filteredFiles.length} materiais
              </Button>
            </div>
          )}

          {showAll && (
            <div className="flex justify-center mt-6">
              <Button variant="outline" onClick={() => setShowAll(false)}>
                Mostrar menos
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum material encontrado com os filtros selecionados.</p>
        </div>
      )}
    </div>
  )
}
