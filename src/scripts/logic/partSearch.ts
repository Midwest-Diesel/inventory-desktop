export const getSearchedPartNum = () => {
  const altSearch = JSON.parse(localStorage.getItem('altPartSearches')!);
  const partSearch = JSON.parse(localStorage.getItem('partSearches')!);
  return (
    (altSearch && altSearch.partNum.replace('*', '')) ||
    (partSearch && partSearch.partNum.replace('*', '')) ||
    ''
  );
};
