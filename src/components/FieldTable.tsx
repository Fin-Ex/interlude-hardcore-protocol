import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { Theme } from '@mui/material/styles';
import { useMemo } from 'react';
import { MONO } from '../theme';
import type { FieldNode, PacketNode, WireType } from '../types';
import { DocText } from './DocText';
import { TypeBadge } from './tags';

interface Block {
  tag: string;
  tone: 'loop' | 'branch';
  title?: string;
  detail?: string;
  description?: string;
}

interface Row {
  key: string;
  depth: number;
  field?: FieldNode;
  block?: Block;
}

function flatten(nodes: PacketNode[], depth = 0, prefix = '', out: Row[] = []): Row[] {
  nodes.forEach((node, index) => {
    const key = `${prefix}${index}`;
    switch (node.kind) {
      case 'field':
        out.push({ key, depth, field: node });
        break;
      case 'loop': {
        const detail = node.count ? `× ${node.count}` : node.condition ? `пока ${node.condition}` : undefined;
        const block: Block = { tag: 'цикл', tone: 'loop', title: node.name ?? undefined, detail, description: node.description };
        out.push({ key, depth, block });
        flatten(node.fields, depth + 1, `${key}.`, out);
        break;
      }
      case 'if':
        out.push({ key, depth, block: { tag: 'если', tone: 'branch', detail: node.condition, description: node.description } });
        flatten(node.fields, depth + 1, `${key}.`, out);
        if (node.else) {
          out.push({ key: `${key}e`, depth, block: { tag: 'иначе', tone: 'branch' } });
          flatten(node.else, depth + 1, `${key}e.`, out);
        }
        break;
      case 'switch':
        out.push({ key, depth, block: { tag: 'выбор', tone: 'branch', detail: node.on, description: node.description } });
        node.cases.forEach((item, caseIndex) => {
          const caseKey = `${key}c${caseIndex}`;
          out.push({ key: caseKey, depth: depth + 1, block: { tag: 'при', tone: 'branch', detail: item.when.join(', ') } });
          flatten(item.fields, depth + 2, `${caseKey}.`, out);
        });
        break;
    }
  });
  return out;
}

const STEP = 20;

/** Отступ первой ячейки по глубине вложенности с вертикальными направляющими. */
function indent(depth: number) {
  return (theme: Theme) => {
    const line = `linear-gradient(${theme.palette.divider}, ${theme.palette.divider})`;
    const levels = Array.from({ length: depth }, (_, level) => level);
    return {
      paddingLeft: `${16 + depth * STEP}px`,
      backgroundImage: levels.map(() => line).join(', ') || 'none',
      backgroundPosition: levels.map((level) => `${22 + level * STEP}px 0`).join(', '),
      backgroundSize: '1px 100%',
      backgroundRepeat: 'no-repeat',
    };
  };
}

function formatValue(value: number | string | boolean): string {
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'number' && Number.isInteger(value) && value > 9) {
    return `0x${value.toString(16).toUpperCase().padStart(2, '0')} (${value})`;
  }
  return String(value);
}

const mono = { fontFamily: MONO, fontSize: '0.8125rem' };

export function FieldTable({ nodes, types }: { nodes: PacketNode[]; types: Record<string, WireType> }) {
  const rows = useMemo(() => flatten(nodes), [nodes]);
  const fields = rows.flatMap((row) => (row.field ? [row.field] : []));
  const showJavaType = fields.some((field) => field.javaType);
  const showValue = fields.some((field) => field.value !== undefined || field.expr);
  const showDescription = fields.some((field) => field.description);
  const columns = 2 + Number(showJavaType) + Number(showValue) + Number(showDescription);

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" sx={{ minWidth: 640, '& td': { verticalAlign: 'top' }, '& tr:last-child td': { borderBottom: 0 } }}>
        <TableHead>
          <TableRow>
            <TableCell>Тип</TableCell>
            <TableCell>Имя</TableCell>
            {showJavaType && <TableCell>Тип в DTO</TableCell>}
            {showValue && <TableCell>Значение</TableCell>}
            {showDescription && <TableCell sx={{ width: '40%' }}>Описание</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(({ key, depth, field, block }) =>
            block ? (
              <TableRow key={key} sx={{ bgcolor: 'action.hover' }}>
                <TableCell colSpan={columns} sx={indent(depth)}>
                  <Box
                    component="span"
                    sx={{
                      mr: 1,
                      typography: 'caption',
                      fontWeight: 500,
                      letterSpacing: 0.4,
                      textTransform: 'uppercase',
                      color: block.tone === 'loop' ? 'primary.main' : 'secondary.main',
                    }}
                  >
                    {block.tag}
                  </Box>
                  {block.title && (
                    <Box component="span" sx={{ ...mono, mr: 1, fontWeight: 500 }}>
                      {block.title}
                    </Box>
                  )}
                  {block.detail && (
                    <Box component="span" sx={{ ...mono, color: block.title ? 'text.secondary' : 'text.primary', overflowWrap: 'anywhere' }}>
                      {block.detail}
                    </Box>
                  )}
                  {block.description && (
                    <Box sx={{ mt: 0.5, color: 'text.secondary' }}>
                      <DocText text={block.description} dense />
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ) : field ? (
              <TableRow key={key}>
                <TableCell sx={[indent(depth), { whiteSpace: 'nowrap', width: '1%' }]}>
                  <TypeBadge type={field.type} length={field.length} info={types[field.type]} />
                </TableCell>
                <TableCell sx={{ ...mono, overflowWrap: 'anywhere', color: field.name ? 'text.primary' : 'text.disabled' }}>
                  {field.name ?? '—'}
                </TableCell>
                {showJavaType && <TableCell sx={{ ...mono, color: 'text.secondary' }}>{field.javaType}</TableCell>}
                {showValue && (
                  <TableCell sx={{ ...mono, overflowWrap: 'anywhere' }}>
                    {field.value !== undefined && <Box>{formatValue(field.value)}</Box>}
                    {field.expr && <Box sx={{ color: 'text.secondary' }}>{field.expr}</Box>}
                  </TableCell>
                )}
                {showDescription && (
                  <TableCell>{field.description && <DocText text={field.description} dense />}</TableCell>
                )}
              </TableRow>
            ) : null,
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
