import React, { useState } from 'react';
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
  IconButton,
} from '@mui/material';

import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';

import { useLikes } from '../context/LikesContext';

interface FileCardProps {
  file: {
    id: string;
    title: string;
    description?: string;
    type: string;
    course: string;
    courseCode: string;
    professorName: string;
    semester: string;
    uploadDate: string;
    tags: string[];
    likes: number;
    comments: number;

    uploaderName?: string; 
    uploaderAvatar?: string; 
    professorAvatar?: string; 
  };
}

export function FileCard({ file }: FileCardProps) {
  const { hasLiked, toggleLike } = useLikes();
  const [likeCount, setLikeCount] = useState(file.likes);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    const { likes } = await toggleLike(file.id);
    setLikeCount(likes);
  };
  
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 4, 
        },
      }}
    >
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

      <CardContent sx={{ flexGrow: 1, py: 1 }}>
        <Stack spacing={1.5} sx={{ color: 'text.secondary' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2">{file.course} ({file.courseCode})</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }} src={'http://localhost:8080' + file.professorAvatar}>
              {file.professorAvatar ? '' : 'A'}
            </Avatar>
            <Typography variant="body2">{file.professorName || 'Não informado'}</Typography>
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

      <CardActions sx={{ p: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={2} color="text.secondary">
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton size="small" onClick={handleLikeClick}>
                  <ThumbUpOutlinedIcon fontSize="small" color={hasLiked(file.id) ? "primary" : "action"} />
            </IconButton>
            <Typography variant="body2">{likeCount}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2">{file.comments}</Typography>
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }} src={'http://localhost:8080' + file.uploaderAvatar}>
            {file.uploaderAvatar ? '' : 'A'}
          </Avatar>
          <Typography variant="body2">{file.uploaderName || 'Anônimo'}</Typography>
        </Stack>
      </CardActions>
    </Card>
  );
}