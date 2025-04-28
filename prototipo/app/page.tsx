import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, FileText, Search, Upload, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import StatsCounter from "@/components/stats-counter"
import FeatureCard from "@/components/feature-card"
import HowItWorks from "@/components/how-it-works"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  USPShare: Compartilhe e Acesse Materiais Acadêmicos
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Uma rede colaborativa criada por e para estudantes da Universidade de São Paulo. Democratizando o
                  acesso a provas, listas, resumos e enunciados.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/explore">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600">
                    Explorar Materiais
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/upload">
                  <Button variant="outline" className="dark:border-gray-700 dark:hover:bg-gray-800">
                    Compartilhar Material
                    <Upload className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px] aspect-video rounded-xl overflow-hidden shadow-xl dark:shadow-gray-900/30">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Estudantes da USP compartilhando materiais"
                  width={600}
                  height={400}
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-slate-950">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatsCounter value={5000} label="Arquivos Compartilhados" />
            <StatsCounter value={3500} label="Usuários Ativos" />
            <StatsCounter value={120} label="Cursos Cobertos" />
            <StatsCounter value={25000} label="Downloads Realizados" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Principais Recursos</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Tudo o que você precisa para planejar seus estudos de forma eficiente
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <FeatureCard
              icon={<Upload className="h-10 w-10 text-blue-600 dark:text-blue-500" />}
              title="Compartilhamento de Arquivos"
              description="Faça upload de provas antigas, listas, enunciados e resumos em diversos formatos."
            />
            <FeatureCard
              icon={<Search className="h-10 w-10 text-blue-600 dark:text-blue-500" />}
              title="Busca Inteligente"
              description="Encontre materiais por código ou nome da disciplina, com filtros adicionais."
            />
            <FeatureCard
              icon={<FileText className="h-10 w-10 text-blue-600 dark:text-blue-500" />}
              title="Visualização e Download"
              description="Visualize e baixe arquivos disponíveis para estudo com facilidade."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-blue-600 dark:text-blue-500" />}
              title="Sistema de Conta e Login"
              description="Crie uma conta com e-mail USP para garantir autenticidade."
            />
            <FeatureCard
              icon={<BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-500" />}
              title="Interação Social"
              description="Comente, curta e interaja com outros estudantes sobre os materiais."
            />
            <FeatureCard
              icon={<Upload className="h-10 w-10 text-blue-600 dark:text-blue-500" />}
              title="Moderação Híbrida"
              description="Combinação de revisão automática e equipe de voluntários da USP."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Como Funciona</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Três passos simples para começar a usar o USPShare
              </p>
            </div>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Junte-se à Comunidade USPShare
              </h2>
              <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed opacity-90">
                Compartilhe conhecimento, ajude outros estudantes e melhore sua experiência acadêmica
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/signup">
                <Button className="bg-white text-blue-600 hover:bg-gray-100 dark:bg-white dark:text-blue-700 dark:hover:bg-gray-200">
                  Criar Conta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" className="text-white border-white hover:bg-blue-700 dark:hover:bg-blue-800">
                  Saiba Mais
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
