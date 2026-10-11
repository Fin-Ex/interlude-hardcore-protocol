export interface WireType {
  size: number | null;
  description: string;
}

export interface FieldNode {
  kind: 'field';
  name: string | null;
  type: string;
  length?: number | string;
  value?: number | string | boolean;
  javaType?: string;
  expr?: string;
  description?: string;
}

export interface LoopNode {
  kind: 'loop';
  name: string | null;
  count?: string;
  condition?: string;
  description?: string;
  fields: PacketNode[];
}

export interface IfNode {
  kind: 'if';
  condition: string;
  description?: string;
  fields: PacketNode[];
  else?: PacketNode[];
}

export interface SwitchNode {
  kind: 'switch';
  on: string;
  description?: string;
  cases: { when: string[]; fields: PacketNode[] }[];
}

export type PacketNode = FieldNode | LoopNode | IfNode | SwitchNode;

export interface Packet {
  name: string;
  opcode: string | null;
  opcodes: number[];
  direction: string;
  format: string;
  description: string | null;
  serder: string;
  dto: string;
  fields: PacketNode[];
}

/** Файл в том виде, в котором его выгружает extract_packets.py. */
export interface ProtocolFile {
  source: string;
  types: Record<string, WireType>;
  groups: {
    id: string;
    package: string;
    title: string;
    packets: Record<string, Packet[]>;
  }[];
}
