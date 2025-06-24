import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Avatar,
  Box,
  Stack,
  Link as MuiLink,
  Divider,
} from '@mui/material';

// Ícones do Material-UI
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';

// A interface de props permanece a mesma
interface FileCardProps {
  file: {
    id: string;
    title: string;
    description?: string;
    type: string;
    course: string;
    courseCode: string;
    professor: string;
    semester: string;
    uploadDate: string;
    uploader?: string;
    tags: string[];
    likes: number;
    comments: number;
  };
}

export function FileCard({ file }: FileCardProps) {
  return (
    // O Card Action Area torna toda a área do card (exceto os botões) clicável
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 4, // Elevação no hover para dar feedback
        },
      }}
    >
      {/* Cabeçalho com Tipo e Título Clicável */}
      <CardContent sx={{ pb: 1 }}>
        <Chip label={file.type} variant="outlined" size="small" sx={{ mb: 1.5 }} />
        <MuiLink
          component={RouterLink}
          to={`/file/${file.id}`}
          underline="hover"
          color="inherit"
          sx={{
            fontWeight: 'semibold',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {/* Lógica para limitar o título a 2 linhas com CSS */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
            }}
          >
            {file.title}
          </Typography>
        </MuiLink>
      </CardContent>

      {/* Conteúdo com Informações da Disciplina e Tags */}
      <CardContent sx={{ flexGrow: 1, py: 1 }}>
        <Stack spacing={1.5} sx={{ color: 'text.secondary' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2">{file.course} ({file.courseCode})</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PersonOutlineOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2">{file.professor}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2">{file.semester}</Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
          {file.tags.slice(0, 3).map((tag) => (
            <Chip key={tag} label={tag} size="small" />
          ))}
          {file.tags.length > 3 && (
            <Chip label={`+${file.tags.length - 3}`} size="small" />
          )}
        </Stack>
      </CardContent>

      <Divider />

      {/* Rodapé com Likes, Comentários e Uploader */}
      <CardActions sx={{ p: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={2} color="text.secondary">
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <ThumbUpOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2">{file.likes}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2">{file.comments}</Typography>
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
            {file.uploader ? file.uploader.charAt(0) : 'A'}
          </Avatar>
          <Typography variant="body2">{file.uploader || 'Anônimo'}</Typography>
        </Stack>
      </CardActions>
    </Card>
  );
}