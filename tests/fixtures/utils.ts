// This file should be skipped by the analyzer
export function formatDate(date: Date): string {
  return date.toISOString();
}

export function debounce(fn: Function, ms: number) {
  let timer: any;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
