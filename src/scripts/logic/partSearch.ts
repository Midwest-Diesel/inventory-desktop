export const getSearchedPartNum = () => {
  const altSearch = JSON.parse(localStorage.getItem('altPartSearches')!);
  const partSearch = JSON.parse(localStorage.getItem('partSearches')!);
  return (
    (altSearch && altSearch.partNum.replace('*', '')) ||
    (partSearch && partSearch.partNum.replace('*', '')) ||
    ''
  );
};

export const extractStatusColors = (part: Part): string => {
  if (part.location?.toLowerCase().includes('on engine')) return 'on-engine';
  if (part.purchasedFrom?.toLowerCase().includes('z')) return 'ziegler'; 

  const text = part.remarks;
  if (!text || text === '') return '';
  if (text.toLowerCase().includes('sold')) {
    return 'sold';
  } else if (text.toLowerCase().includes('new')) {
    return 'new';
  } else if (text.toLowerCase().includes('rebuilt')) {
    return 'rebuilt';
  } else if (text.toLowerCase().includes('recon')) {
    return 'recon';
  } else if (text.toLowerCase().includes('special')) {
    return 'special';
  } else if (text.toLowerCase().includes('nto')) {
    return 'NTO';
  } else if (text.toLowerCase().includes('humpy')) {
    return 'humpy';
  } else {
    return '';
  }
};
