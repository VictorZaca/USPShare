import React, { useEffect, useState } from 'react';
import { Typography, Box, Stack } from '@mui/material';

interface StatsCounterProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}

export const StatsCounter: React.FC<StatsCounterProps> = ({ icon, value, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const duration = 1500; 
    const incrementTime = Math.floor(duration / end);

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <Stack spacing={1} alignItems="center">
        {icon}
        <Typography variant="h3" component="p" fontWeight="bold">
            {count.toLocaleString('pt-BR')}
        </Typography>
        <Typography color="text.secondary">{label}</Typography>
    </Stack>
  );
};