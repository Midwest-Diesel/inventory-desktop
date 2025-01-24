export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export const generateClasses = (className: string, variantList: string[], elmt: string): string => {
  const variants = variantList ? variantList.map((i) => `${elmt}--${i}`).join(' ') : '';
  return [className ? [elmt, className].join(' ') : elmt, variants && variants].filter(Boolean).join(' ');
};

export const parseClasses = (classes: string): object => {
  return classes ? { className: classes } : {};
};

export const generateRandId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const isObjectNull = (obj: any) => Object.values(obj).filter((value) => value !== '' && value !== null).length === 0;

export const filterNullObjValuesArr = (arr: any[]) => arr.filter((obj) => !isObjectNull(obj));

export const setTitle = (title: string) => { 
  document.title = `${title} | Inventory`;
};

function getStartOfWeek(date: Date) {
  const dayOfWeek = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  return start;
}

export const isDateInCurrentOrNextWeek = (date: Date) => {
  const now = new Date();
  
  const currentWeekStart = getStartOfWeek(now);
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
  currentWeekEnd.setHours(23, 59, 59, 999);

  const nextWeekStart = new Date(currentWeekEnd);
  nextWeekStart.setDate(currentWeekEnd.getDate() + 1);
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
  nextWeekEnd.setHours(23, 59, 59, 999);

  if (date >= currentWeekStart && date <= currentWeekEnd) {
    return "current";
  } else if (date >= nextWeekStart && date <= nextWeekEnd) {
    return "next";
  } else {
    return "other";
  }
};

export const getRatingFromRemarks = (string: string): string => {
  const str = string.trim();
  const start = str.indexOf('(') + 1;
  const end = str.indexOf(')');
  if (start !== 1 || end < 0) return '0.0';
  
  const rating = str.slice(start, end);
  if (rating.split('.').length > 1) {
    return rating;
  } else {
    return `${rating.replaceAll('.', '')}.0`;
  }
};
