// utils.ts
import type { NoteKey } from './constants';

export function getOrderedStrings(
  strings: NoteKey[],
  handedness: 'left' | 'right'
): NoteKey[] {
  return handedness === 'left' ? [...strings] : [...strings];
}
