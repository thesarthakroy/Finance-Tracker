import React from 'react';
import { Box } from '@mui/material';

export default function PageTransition({ children }) {
  return (
    <Box
      sx={{
        animation: 'fadeInUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        '@keyframes fadeInUp': {
          '0%': {
            opacity: 0,
            transform: 'translateY(8px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      {children}
    </Box>
  );
}
