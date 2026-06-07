// A block as held in the editor. `key` is a stable client id for React/dnd;
// `id` is the DB id (absent for blocks not yet persisted).
export interface EditorBlock {
  key: string;
  id?: string;
  type: string;
  isVisible: boolean;
  data: unknown;
}

let counter = 0;
export function newKey(): string {
  counter += 1;
  return `b_${counter}_${Math.round(performance.now())}`;
}
