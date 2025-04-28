"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, CheckCircle2, Info, Loader2 } from "lucide-react"
import { PasswordStrengthIndicator } from "@/components/password-strength-indicator"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const validateUspEmail = (email: string) => {
    return email.endsWith("@usp.br")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Basic validation
      if (!name || !email || !password || !confirmPassword) {
        setError("Por favor, preencha todos os campos.")
        setIsLoading(false)
        return
      }

      if (!validateUspEmail(email)) {
        setError("Por favor, utilize um e-mail USP válido (@usp.br).")
        setIsLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError("As senhas não coincidem.")
        setIsLoading(false)
        return
      }

      if (password.length < 8) {
        setError("A senha deve ter pelo menos 8 caracteres.")
        setIsLoading(false)
        return
      }

      if (!agreeTerms) {
        setError("Você precisa concordar com os termos de uso.")
        setIsLoading(false)
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success message
      setSuccess(true)

      // Redirect after a delay
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err) {
      setError("Falha ao criar conta. Por favor, tente novamente.")
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4 md:px-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center">
          <BookOpen className="h-12 w-12 text-blue-600 mb-2" />
          <h1 className="text-3xl font-bold">USPShare</h1>
          <p className="text-muted-foreground mt-1">Crie sua conta para compartilhar materiais</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar Conta</CardTitle>
            <CardDescription>Preencha os dados abaixo para se cadastrar</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <h2 className="text-xl font-semibold">Cadastro realizado com sucesso!</h2>
                <p className="text-muted-foreground">
                  Um e-mail de confirmação foi enviado para {email}. Verifique sua caixa de entrada para ativar sua
                  conta.
                </p>
                <p className="text-sm">Redirecionando para a página de login...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail USP</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.nome@usp.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={
                      email && !validateUspEmail(email) ? "border-red-500 focus-visible:ring-red-500" : undefined
                    }
                  />
                  {email && !validateUspEmail(email) && (
                    <p className="text-sm text-red-500">Por favor, utilize um e-mail USP válido (@usp.br).</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {password && <PasswordStrengthIndicator password={password} />}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={
                      confirmPassword && password !== confirmPassword
                        ? "border-red-500 focus-visible:ring-red-500"
                        : undefined
                    }
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-sm text-red-500">As senhas não coincidem.</p>
                  )}
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(!!checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                    Eu concordo com os{" "}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      termos de uso
                    </Link>{" "}
                    e{" "}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      política de privacidade
                    </Link>
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Criar Conta"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Faça login
              </Link>
            </div>

            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                O USPShare é exclusivo para estudantes da USP. Seu e-mail institucional será verificado durante o
                processo de cadastro.
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
