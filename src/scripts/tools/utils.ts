import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { invoke } from '../config/tauri';


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

export const dateDiffInDays = (a: Date, b: Date, numbersOnly = false) => {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  const days = Math.abs(Math.floor((utc2 - utc1) / _MS_PER_DAY));
  if (numbersOnly)
    return days;
  else
    return days !== 0 ? days > 1 ? `${days} days ago` : 'yesterday' : 'today';
};

export const windowConfirm = (msg: string) => confirm(msg);

export const arrayOfObjectsMatch = (arr1: any[], arr2: any[]): boolean => {
  if (arr1.length !== arr2.length) return false;
  const objectsEqual = (o1: any, o2: any): boolean => {
    if (o1 instanceof Date && o2 instanceof Date) {
      return o1.getTime() === o2.getTime();
    }
    
    if (o1 !== null && typeof o1 === 'object' && o2 !== null && typeof o2 === 'object') {
      return Object.keys(o1).length === Object.keys(o2).length && Object.keys(o1).every(p => objectsEqual(o1[p], o2[p]));
    } else {
      return o1 === o2;
    }
  };

  for (let i = 0; i < arr1.length; i++) {
    if (!objectsEqual(arr1[i], arr2[i])) return false;
  }
  return true;
};

export const getYesterday = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
};

export const generatePDF = async (pages: HTMLElement[], path: string) => {
  const pdf = new jsPDF();
  const pxToMm = (px: number) => (px * 25.4) / 96;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const canvas = await html2canvas(page, {
      windowWidth: page.scrollWidth,
      scrollY: -window.scrollY
    });

    const imageData = canvas.toDataURL('image/png');
    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;
    const pdfWidth = pxToMm(imgWidthPx);
    const pdfHeight = pxToMm(imgHeightPx);

    if (i === 0) {
      pdf.deletePage(1);
      pdf.addPage([pdfWidth, pdfHeight]);
    } else {
      pdf.addPage([pdfWidth, pdfHeight]);
    }
    pdf.addImage(imageData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  }

  const pdfBytes = pdf.output('arraybuffer');
  await invoke('save_pdf', { bytes: Array.from(new Uint8Array(pdfBytes)), path });
};
