"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, CheckCircle2, Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const validateUspEmail = (email: string) => {
    return email.endsWith("@usp.br")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Basic validation
      if (!email) {
        setError("Por favor, informe seu e-mail USP.")
        setIsLoading(false)
        return
      }

      if (!validateUspEmail(email)) {
        setError("Por favor, utilize um e-mail USP válido (@usp.br).")
        setIsLoading(false)
        return
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success message
      setSuccess(true)
    } catch (err) {
      setError("Falha ao enviar e-mail de recuperação. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4 md:px-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center">
          <BookOpen className="h-12 w-12 text-blue-600 mb-2" />
          <h1 className="text-3xl font-bold">USPShare</h1>
          <p className="text-muted-foreground mt-1">Recuperação de senha</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Esqueceu sua senha?</CardTitle>
            <CardDescription>Informe seu e-mail USP e enviaremos instruções para redefinir sua senha.</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <h2 className="text-xl font-semibold">E-mail enviado!</h2>
                <p className="text-muted-foreground">
                  Enviamos instruções para recuperação de senha para {email}. Verifique sua caixa de entrada.
                </p>
                <p className="text-sm">
                  Não recebeu o e-mail? Verifique sua pasta de spam ou{" "}
                  <button
                    onClick={handleSubmit}
                    className="text-blue-600 hover:underline font-medium"
                    disabled={isLoading}
                  >
                    tente novamente
                  </button>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

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

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar instruções"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center">
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Voltar para o login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
