"use client"

import { useEffect, useState } from "react"

interface StatsCounterProps {
  value: number
  label: string
  duration?: number
}

export default function StatsCounter({ value, label, duration = 2000 }: StatsCounterProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrameId: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * value))

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step)
      }
    }

    animationFrameId = window.requestAnimationFrame(step)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [value, duration])

  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">{count.toLocaleString()}+</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
