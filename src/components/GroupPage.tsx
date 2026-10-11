import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { Suspense, use, useDeferredValue, useEffect, useLayoutEffect, useMemo } from 'react';
import { Link as RouterLink, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { directionLabel, findGroup, loadGroup, packetPath, type GroupMeta } from '../protocol';
import { MONO } from '../theme';
import type { Packet } from '../types';
import { ClearIcon, SearchIcon } from './icons';
import { Loading, Message } from './Message';
import { DirectionTag } from './tags';

const ALL = 'all';

// Позиция прокрутки таблицы на момент перехода к пакету, по ключу записи истории.
const scrollPositions = new Map<string, number>();

export function GroupPage() {
  const { group: slug } = useParams();
  const meta = findGroup(slug);
  if (!meta) {
    return <Message title="Группа не найдена" />;
  }
  return (
    <Suspense key={meta.slug} fallback={<Loading />}>
      <GroupTable meta={meta} />
    </Suspense>
  );
}

/** Варианты записи опкода, по началу которых ищется пакет: 0xfe:0x20, fe:20, fe20, 20 и т.д. */
function opcodeForms(opcodes: number[]): string[] {
  const bytes = opcodes.map((opcode) => opcode.toString(16).padStart(2, '0'));
  const prefixed = bytes.map((byte) => `0x${byte}`);
  return [prefixed.join(':'), bytes.join(':'), bytes.join(''), `0x${bytes.join('')}`, ...bytes, ...prefixed];
}

function GroupTable({ meta }: { meta: GroupMeta }) {
  const group = use(loadGroup(meta));
  const location = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const requested = params.get('dir');
  const direction = requested && group.directions.includes(requested) ? requested : ALL;
  const query = params.get('q') ?? '';
  const deferredQuery = useDeferredValue(query);

  const index = useMemo(
    () =>
      group.packets.map((packet) => ({
        packet,
        name: packet.name.toLowerCase(),
        opcodes: opcodeForms(packet.opcodes),
      })),
    [group],
  );

  const rows = useMemo(() => {
    const needle = deferredQuery.toLowerCase().replace(/\s+/g, '');
    return index
      .filter((entry) => direction === ALL || entry.packet.direction === direction)
      .filter(
        (entry) => !needle || entry.name.includes(needle) || entry.opcodes.some((form) => form.startsWith(needle)),
      )
      .map((entry) => entry.packet);
  }, [index, direction, deferredQuery]);

  useEffect(() => {
    document.title = `${meta.label} — Interlude Hardcore`;
  }, [meta]);

  useLayoutEffect(() => {
    window.scrollTo(0, scrollPositions.get(location.key) ?? 0);
    // Позиция восстанавливается один раз при открытии таблицы.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (key: string, value: string) => {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        return next;
      },
      { replace: true },
    );
  };

  const rememberScroll = () => scrollPositions.set(location.key, window.scrollY);
  const open = (packet: Packet) => {
    rememberScroll();
    navigate(packetPath(meta, packet), { state: { fromTable: true } });
  };

  const showDirection = direction === ALL;
  const columns = showDirection ? 4 : 3;

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2, alignItems: { sm: 'center' } }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          color="primary"
          value={direction}
          onChange={(_, value: string | null) => value && update('dir', value === ALL ? '' : value)}
        >
          <ToggleButton value={ALL} sx={{ px: 2 }}>
            Все
          </ToggleButton>
          {group.directions.map((item) => (
            <ToggleButton key={item} value={item} sx={{ px: 2 }}>
              {directionLabel(item)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <TextField
          size="small"
          placeholder="Имя или опкод"
          value={query}
          onChange={(event) => update('q', event.target.value)}
          sx={{ ml: { sm: 'auto !important' }, width: { sm: 300 } }}
          slotProps={{
            htmlInput: { 'aria-label': 'Поиск по имени или опкоду' },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton size="small" edge="end" aria-label="Очистить поиск" onClick={() => update('q', '')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 130 }}>Опкод</TableCell>
              {showDirection && <TableCell sx={{ width: 130 }}>Направление</TableCell>}
              <TableCell>Пакет</TableCell>
              <TableCell sx={{ width: '42%' }}>Формат</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((packet) => (
              <TableRow
                key={`${packet.direction}/${packet.name}`}
                hover
                onClick={() => open(packet)}
                sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 } }}
              >
                <TableCell sx={{ fontFamily: MONO, whiteSpace: 'nowrap' }}>{packet.opcode ?? '—'}</TableCell>
                {showDirection && (
                  <TableCell>
                    <DirectionTag group={group} direction={packet.direction} />
                  </TableCell>
                )}
                <TableCell>
                  <Link
                    component={RouterLink}
                    to={packetPath(meta, packet)}
                    state={{ fromTable: true }}
                    underline="hover"
                    color="text.primary"
                    sx={{ fontWeight: 500 }}
                    onClick={(event) => {
                      event.stopPropagation();
                      rememberScroll();
                    }}
                  >
                    {packet.name}
                  </Link>
                </TableCell>
                <TableCell
                  title={packet.format}
                  sx={{
                    maxWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontFamily: MONO,
                    color: 'text.secondary',
                  }}
                >
                  {packet.format || '—'}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns} align="center" sx={{ py: 6, color: 'text.secondary', borderBottom: 0 }}>
                  Ничего не найдено
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 1.5, textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary">
          Показано {rows.length} из {group.packets.length}
        </Typography>
      </Box>
    </>
  );
}
