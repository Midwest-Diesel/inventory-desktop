export const getSalesByYear = (sales: Part[]): { year: number, amount: number }[] => {
  const salesByYear: { [year: number]: { year: number, amount: number } } = {};
  sales.forEach((sale) => {
    const year = sale.soldToDate?.getUTCFullYear();
    if (!year) return;
    if (salesByYear.hasOwnProperty(year)) {
      salesByYear[year].amount += (sale.qtySold ?? 0);
    } else {
      salesByYear[year] = { year, amount: sale.qtySold ?? 0 };
    }
  });
  const salesArray = Object.values(salesByYear);
  return salesArray.sort((a, b) => b.year - a.year);
};
