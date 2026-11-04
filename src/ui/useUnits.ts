import type { Unit } from '../content/types.ts';
import { unitsIn } from '../content/units.ts';
import { useLanguage } from '../i18n/index.ts';

/** The units in the language on screen; components using it re-render when it changes. */
export function useUnits(): Unit[] {
  return unitsIn(useLanguage());
}

/** The title of the unit `unitId` in `units`, or `''` for an unknown id. */
export function unitTitle(units: readonly Unit[], unitId: string): string {
  return units.find((unit) => unit.id === unitId)?.title ?? '';
}
