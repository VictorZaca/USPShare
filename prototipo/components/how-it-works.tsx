import { ArrowRight, FileUp, Search, UserCheck } from "lucide-react"

export default function HowItWorks() {
  return (
    <div className="grid gap-8 md:grid-cols-3 mt-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 mb-4">
          <UserCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">1. Crie sua conta</h3>
        <p className="text-muted-foreground">
          Registre-se usando seu e-mail USP para ter acesso completo à plataforma.
        </p>
      </div>

      <div className="flex flex-col items-center text-center relative">
        <div className="hidden md:block absolute left-0 top-8 w-full">
          <ArrowRight className="h-6 w-6 text-muted-foreground mx-auto" />
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 mb-4">
          <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">2. Explore materiais</h3>
        <p className="text-muted-foreground">Busque provas, listas e resumos por disciplina, professor ou código.</p>
      </div>

      <div className="flex flex-col items-center text-center relative">
        <div className="hidden md:block absolute left-0 top-8 w-full">
          <ArrowRight className="h-6 w-6 text-muted-foreground mx-auto" />
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 mb-4">
          <FileUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">3. Compartilhe conhecimento</h3>
        <p className="text-muted-foreground">Contribua com seus próprios materiais e ajude outros estudantes.</p>
      </div>
    </div>
  )
}
