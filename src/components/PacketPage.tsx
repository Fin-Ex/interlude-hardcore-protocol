import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Suspense, use, useEffect, useLayoutEffect, type MouseEvent, type ReactNode } from 'react';
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { findGroup, loadGroup, type GroupMeta } from '../protocol';
import { MONO } from '../theme';
import type { PacketNode } from '../types';
import { DocText } from './DocText';
import { FieldTable } from './FieldTable';
import { ArrowBackIcon } from './icons';
import { Loading, Message } from './Message';
import { DirectionTag, TypeBadge } from './tags';

export function PacketPage() {
  const { group: slug, direction, name } = useParams();
  const meta = findGroup(slug);
  if (!meta || !direction || !name) {
    return <Message title="Пакет не найден" />;
  }
  return (
    <Suspense key={meta.slug} fallback={<Loading />}>
      <PacketDetails meta={meta} direction={direction} name={name} />
    </Suspense>
  );
}

function usedTypes(nodes: PacketNode[], out: string[] = []): string[] {
  for (const node of nodes) {
    if (node.kind === 'field') {
      if (!out.includes(node.type)) {
        out.push(node.type);
      }
    } else if (node.kind === 'switch') {
      node.cases.forEach((item) => usedTypes(item.fields, out));
    } else {
      usedTypes(node.fields, out);
      if (node.kind === 'if' && node.else) {
        usedTypes(node.else, out);
      }
    }
  }
  return out;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box component="section" sx={{ mt: 4 }}>
      <Typography variant="overline" color="text.secondary" component="h2" sx={{ display: 'block', mb: 0.5 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function PacketDetails({ meta, direction, name }: { meta: GroupMeta; direction: string; name: string }) {
  const group = use(loadGroup(meta));
  const location = useLocation();
  const navigate = useNavigate();
  const packet = group.packets.find((item) => item.direction === direction && item.name === name);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [direction, name]);

  useEffect(() => {
    document.title = `${name} — ${meta.label}`;
  }, [name, meta]);

  // Возврат через историю сохраняет фильтры и позицию прокрутки таблицы.
  const cameFromTable = Boolean((location.state as { fromTable?: boolean } | null)?.fromTable);
  const back = (event: MouseEvent) => {
    if (cameFromTable) {
      event.preventDefault();
      navigate(-1);
    }
  };

  const backButton = (
    <Button
      component={RouterLink}
      to={`/${meta.slug}`}
      onClick={back}
      color="inherit"
      startIcon={<ArrowBackIcon />}
      sx={{ ml: -1, color: 'text.secondary' }}
    >
      {meta.label}
    </Button>
  );

  if (!packet) {
    return <Message title="Пакет не найден">{backButton}</Message>;
  }

  const types = usedTypes(packet.fields);
  const hasLoops = packet.format.includes('[');
  const hasBranches = packet.format.includes('(');

  return (
    <>
      {backButton}

      <Stack direction="row" spacing={2} useFlexGap sx={{ mt: 1.5, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 500, overflowWrap: 'anywhere' }}>
          {packet.name}
        </Typography>
        <Typography sx={{ fontFamily: MONO, color: 'text.secondary' }}>{packet.opcode ?? '—'}</Typography>
        <DirectionTag group={group} direction={packet.direction} full />
      </Stack>

      {packet.description && (
        <Box sx={{ mt: 1.5, maxWidth: 860 }}>
          <DocText text={packet.description} />
        </Box>
      )}

      <Section title="Формат">
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ fontFamily: MONO, wordBreak: 'break-all' }}>{packet.format || '—'}</Box>
          {types.length > 0 && (
            <Stack direction="row" useFlexGap sx={{ mt: 1.5, columnGap: 3, rowGap: 0.75, flexWrap: 'wrap' }}>
              {types.map((type) => (
                <Typography key={type} variant="body2" color="text.secondary">
                  <TypeBadge type={type} /> {group.types[type]?.description ?? 'неизвестный тип'}
                </Typography>
              ))}
              {hasLoops && (
                <Typography variant="body2" color="text.secondary">
                  <TypeBadge type="[…]" /> цикл
                </Typography>
              )}
              {hasBranches && (
                <Typography variant="body2" color="text.secondary">
                  <TypeBadge type="(a|b)" /> варианты по условию
                </Typography>
              )}
            </Stack>
          )}
        </Paper>
      </Section>

      <Section title="Поля">
        {packet.fields.length > 0 ? (
          <FieldTable nodes={packet.fields} types={group.types} />
        ) : (
          <Paper variant="outlined" sx={{ p: 2, color: 'text.secondary' }}>
            Пакет состоит только из опкода.
          </Paper>
        )}
      </Section>

      <Section title="Исходники">
        <Paper variant="outlined" sx={{ p: 2, display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 2, rowGap: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Serder
          </Typography>
          <Box sx={{ fontFamily: MONO, fontSize: '0.8125rem', overflowWrap: 'anywhere' }}>{packet.serder}</Box>
          <Typography variant="body2" color="text.secondary">
            DTO
          </Typography>
          <Box sx={{ fontFamily: MONO, fontSize: '0.8125rem', overflowWrap: 'anywhere' }}>{packet.dto}</Box>
        </Paper>
      </Section>
    </>
  );
}
