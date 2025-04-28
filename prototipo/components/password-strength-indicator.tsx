"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState(0)
  const [message, setMessage] = useState("")
  const [color, setColor] = useState("bg-red-500")

  useEffect(() => {
    calculateStrength(password)
  }, [password])

  const calculateStrength = (password: string) => {
    let score = 0
    let feedback = ""

    // Length check
    if (password.length >= 8) {
      score += 25
    }

    // Contains lowercase
    if (/[a-z]/.test(password)) {
      score += 25
    }

    // Contains uppercase
    if (/[A-Z]/.test(password)) {
      score += 25
    }

    // Contains number or special char
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 25
    }

    // Set color based on score
    if (score < 50) {
      setColor("bg-red-500")
      feedback = "Fraca"
    } else if (score < 75) {
      setColor("bg-yellow-500")
      feedback = "Média"
    } else {
      setColor("bg-green-500")
      feedback = "Forte"
    }

    setStrength(score)
    setMessage(feedback)
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <Progress value={strength} className={`h-2 ${color}`} />
        <span className="text-xs ml-2">{message}</span>
      </div>
      <ul className="text-xs text-muted-foreground space-y-1">
        <li className={password.length >= 8 ? "text-green-500 dark:text-green-400" : ""}>• Mínimo de 8 caracteres</li>
        <li className={/[a-z]/.test(password) ? "text-green-500 dark:text-green-400" : ""}>
          • Pelo menos uma letra minúscula
        </li>
        <li className={/[A-Z]/.test(password) ? "text-green-500 dark:text-green-400" : ""}>
          • Pelo menos uma letra maiúscula
        </li>
        <li className={/[0-9!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-500 dark:text-green-400" : ""}>
          • Pelo menos um número ou caractere especial
        </li>
      </ul>
    </div>
  )
}
