import type { Packet, ProtocolFile, WireType } from './types';

export interface GroupMeta {
  slug: string;
  file: string;
  label: string;
}

export interface Group {
  meta: GroupMeta;
  types: Record<string, WireType>;
  directions: string[];
  packets: Packet[];
}

export const GROUPS: GroupMeta[] = [
  { slug: 'auth-client', file: 'authserver.client.json', label: 'Auth ↔ Client' },
  { slug: 'gameserver-client', file: 'gameserver.client.json', label: 'GameServer ↔ Client' },
  { slug: 'gameserver-auth', file: 'gameserver.authserver.json', label: 'GameServer ↔ Auth' },
];

export const DEFAULT_GROUP = 'gameserver-client';

const DIRECTIONS: Record<string, { short: string; label: string }> = {
  c2s: { short: 'C → S', label: 'Клиент → Сервер' },
  s2c: { short: 'S → C', label: 'Сервер → Клиент' },
  gs2ls: { short: 'GS → Auth', label: 'GameServer → Auth' },
  ls2gs: { short: 'Auth → GS', label: 'Auth → GameServer' },
};

export function directionShort(direction: string): string {
  return DIRECTIONS[direction]?.short ?? direction;
}

export function directionLabel(direction: string): string {
  return DIRECTIONS[direction]?.label ?? direction;
}

export function findGroup(slug: string | undefined): GroupMeta | undefined {
  return GROUPS.find((group) => group.slug === slug);
}

const files = import.meta.glob<ProtocolFile>('../data/*.json', { import: 'default' });
const cache = new Map<string, Promise<Group>>();

export function loadGroup(meta: GroupMeta): Promise<Group> {
  let promise = cache.get(meta.slug);
  if (!promise) {
    const load = files[`../data/${meta.file}`];
    promise = load
      ? load().then((file) => toGroup(meta, file))
      : Promise.reject(new Error(`Файл data/${meta.file} не найден при сборке`));
    cache.set(meta.slug, promise);
  }
  return promise;
}

function toGroup(meta: GroupMeta, file: ProtocolFile): Group {
  const directions: string[] = [];
  const packets: Packet[] = [];
  for (const group of file.groups) {
    for (const [direction, list] of Object.entries(group.packets)) {
      if (!directions.includes(direction)) {
        directions.push(direction);
      }
      packets.push(...list);
    }
  }
  return { meta, types: file.types, directions, packets };
}

export function packetPath(meta: GroupMeta, packet: Packet): string {
  return `/${meta.slug}/${packet.direction}/${encodeURIComponent(packet.name)}`;
}
