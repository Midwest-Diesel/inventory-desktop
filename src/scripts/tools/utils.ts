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
