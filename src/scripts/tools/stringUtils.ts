export const formatDate = (date: Date): string => {
  if (!date || typeof date === 'string') return '';
  return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const parseResDate = (date: string): Date => {
  if (!date || typeof date !== 'string') return null;
  const [datePart, timePart] = date.split('T');
  const dateChars = datePart.split('-');
  const timeChars = timePart ? timePart.split(':') : [0, 0, 0];
  const parsedDate = new Date(
    Number(dateChars[0]),
    Number(dateChars[1]) - 1,
    Number(dateChars[2]),
    Number(timeChars[0]),
    Number(timeChars[1]),
  );
  return parsedDate;
};

export const formatTime = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

export const parseDateInputValue = (date: Date): string => {
  return date && typeof date === 'object' && !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
};

export const cap = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatCurrency = (amount: any): string => {
  amount = parseFloat(amount);
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  if (!amount) return '$0.00';
  let [integerPart, decimalPart] = amount.toFixed(2).split('.');
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${integerPart}.${decimalPart}`;
};

export const formatPhone = (value: string, noParens?: boolean) => {
  if (!value || value === '') return '';
  if (value === '+') return value;

  // Separate the country code and the rest of the number
  let countryCode = '';
  let restOfNumber = value;
  
  if (value.charAt(0) === '+') {
    const match = value.match(/\+\d*/);
    countryCode = match ? match[0].slice(0, 2) + ' ' : '';
    restOfNumber = value.slice(countryCode.length);
  } else if (value.length === 10) {
    restOfNumber = value;
  } else if (value.length === 11) {
    countryCode = '+' + value.slice(0, 1) + ' ';
    restOfNumber = value.slice(1);
  } else if (value.length >= 15) {
    countryCode = '+' + value.slice(-1) + ' ';
    restOfNumber = value.slice(0, -1);
  }

  const pattern = /\(\d{1,3}$/;
  if (pattern.test(restOfNumber)) restOfNumber = restOfNumber.slice(0, -1);

  // Remove all non-digit characters from the rest of the number
  const digits = restOfNumber.replace(/\D/g, '');

  // Format the local number based on its length
  let formattedLocalNumber = '';
  if (digits.length < 3) {
    formattedLocalNumber = `(${digits})`;
  } else if (digits.length <= 6) {
    formattedLocalNumber = `(${digits.slice(0, 3)})` + (digits.length > 3 ? ` ${digits.slice(3)}` : '');
  } else {
    formattedLocalNumber = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  let result = countryCode + formattedLocalNumber;
  if (result === '()') return '';
  else if (/^\+\d+ \(\)$/.test(result)) return result.split(' ')[0];

  if (noParens) {
    result = result.replace(/\(/g, '').replace(/\)/g, '').replace(' ', '-');
  }
  return result;
};

export const parsePhone = (value: string) => {
  return value.replace(/\D/g, '');
};

export const extractStatusColors = (text: string): string => {
  if (!text || text === '') return '';
  if (text.toLowerCase().includes('new')) {
    return 'new';
  } else if (text.toLowerCase().includes('rebuilt')) {
    return 'rebuilt';
  } else if (text.toLowerCase().includes('recon')) {
    return 'recon';
  } else if (text.toLowerCase().includes('special')) {
    return 'special';
  } else if (text.toLowerCase().includes('nto')) {
    return 'NTO';
  } else if (text.toLowerCase().includes('sold')) {
    return 'sold';
  } else if (text.toLowerCase().includes('humpy')) {
    return 'humpy';
  } else {
    return '';
  }
};
