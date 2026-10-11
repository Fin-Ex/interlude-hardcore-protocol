import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { directionLabel, directionShort, type Group } from '../protocol';
import { MONO } from '../theme';
import type { WireType } from '../types';

export function DirectionTag({ group, direction, full }: { group: Group; direction: string; full?: boolean }) {
  const color = group.directions.indexOf(direction) === 0 ? 'primary.main' : 'secondary.main';
  return (
    <Box component="span" sx={{ typography: 'body2', fontWeight: 500, color, whiteSpace: 'nowrap' }}>
      {full ? directionLabel(direction) : directionShort(direction)}
    </Box>
  );
}

export function TypeBadge({ type, length, info }: { type: string; length?: number | string; info?: WireType }) {
  const badge = (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: 0.75,
        borderRadius: 0.5,
        bgcolor: 'action.hover',
        fontFamily: MONO,
        fontSize: '0.8125rem',
        lineHeight: 1.6,
        whiteSpace: 'nowrap',
      }}
    >
      {length === undefined ? type : `${type}[${length}]`}
    </Box>
  );
  return info ? (
    <Tooltip title={info.description} placement="top" arrow>
      {badge}
    </Tooltip>
  ) : (
    badge
  );
}
