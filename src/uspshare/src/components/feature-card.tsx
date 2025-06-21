import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, Typography, Box } from "@mui/material"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card elevation={3} sx={{ height: "100%", transition: "0.2s", ":hover": { boxShadow: 6 } }}>
      <CardHeader
        title={
          <Box display="flex" flexDirection="column" gap={1}>
            <Box>{icon}</Box>
            <Typography variant="h6">{title}</Typography>
          </Box>
        }
        sx={{ pb: 0 }}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  )
}
