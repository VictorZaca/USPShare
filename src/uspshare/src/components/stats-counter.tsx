import { useEffect, useState } from "react"
import { Box, Typography } from "@mui/material"

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
    <Box textAlign="center">
      <Typography variant="h4" fontWeight="bold" color="primary">
        {count.toLocaleString()}+
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={0.5}>
        {label}
      </Typography>
    </Box>
  )
}
