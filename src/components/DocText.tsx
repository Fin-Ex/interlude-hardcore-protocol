import Box from '@mui/material/Box';
import { MONO } from '../theme';

/** Текст описания: абзацы как есть, блоки между ``` — моноширинным шрифтом. */
export function DocText({ text, dense }: { text: string; dense?: boolean }) {
  const parts = text.split('```');
  return (
    <Box sx={{ typography: dense ? 'body2' : 'body1' }}>
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <Box
              key={index}
              component="pre"
              sx={{
                m: 0,
                my: 1,
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'action.hover',
                fontFamily: MONO,
                fontSize: '0.8125rem',
                overflowX: 'auto',
              }}
            >
              {part.replace(/^[a-z]*\n/, '').replace(/\n+$/, '')}
            </Box>
          );
        }
        const paragraph = part.trim();
        return paragraph ? (
          <Box key={index} sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {paragraph}
          </Box>
        ) : null;
      })}
    </Box>
  );
}
