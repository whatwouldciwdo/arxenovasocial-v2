export function nextFaqIndex(current: number | null, selected: number): number | null {
  return current === selected ? null : selected;
}
