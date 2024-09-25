export const getSalesByYear = (sales: Part[]): { year: number, amount: number }[] => {
  const salesByYear: { [year: number]: { year: number, amount: number } } = {};
  sales.forEach((sale) => {
    const year = sale.soldToDate && sale.soldToDate.getFullYear();
    if (salesByYear.hasOwnProperty(year)) {
      salesByYear[year].amount += sale.qtySold;
    } else {
      salesByYear[year] = { year, amount: sale.qtySold };
    }
  });
  const salesArray = Object.values(salesByYear);
  return salesArray.sort((a, b) => b.year - a.year);
};

export const getSearchedPartNum = () => {
  const altSearch = JSON.parse(localStorage.getItem('altPartSearches'));
  const partSearch = JSON.parse(localStorage.getItem('partSearches'));
  return (
    (altSearch && altSearch.partNum.replace('*', '')) ||
    (partSearch && partSearch.partNum.replace('*', '')) ||
    ''
  );
};
