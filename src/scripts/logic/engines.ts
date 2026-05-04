const EXCLUDED_STATUSES = ['sold', 'toredown', 'coreengine'];

export const getEngineModels = (engines: Engine[]): string[] => {
  return Array.from(
    new Set(
      engines
        .filter((e) => !EXCLUDED_STATUSES.includes(e.currentStatus?.toLowerCase().trim() ?? ''))
        .map((e) => e.model ?? '')
    )
  ).sort((a, b) => {
    const numA = parseFloat(a.match(/[\d]+/)?.[0] || 'Infinity');
    const numB = parseFloat(b.match(/[\d]+/)?.[0] || 'Infinity');
    const textA = a.match(/[a-zA-Z]+/)?.[0] || '';
    const textB = b.match(/[a-zA-Z]+/)?.[0] || '';
    const startsWithNumberA = /^\d/.test(a);
    const startsWithNumberB = /^\d/.test(b);
    if (startsWithNumberA === startsWithNumberB) {
      if (textA < textB) return -1;
      if (textA > textB) return 1;
      if (numA < numB) return -1;
      if (numA > numB) return 1;
      return 0;
    }
    return startsWithNumberA ? 1 : -1;
  });
};

export const getTotalEngineCostIn = (engine: Engine) => {
  return engine.costIn
    .filter((row) => row.cost !== 0.04 && row.cost !== 0.01 && !row.engineStockNum?.toString().startsWith('UP'))
    .reduce((acc, val) => acc + Number(val.cost), 0);
};

export const getTotalEngineCostOut = (engine: Engine) => {
  return engine.costOut
    .filter((row) => row.cost !== 0.04 && row.cost !== 0.01 && !row.engineStockNum?.toString().startsWith('UP'))
    .reduce((acc, val) => acc + Number(val.cost), 0);
};

export const getEnginePurchaseCost = (engine: Engine) => {
  return engine.costIn
    .filter((row) => row.costType === 'PurchasePrice' && row.cost !== 0.01 && !row.engineStockNum?.toString().startsWith('UP'))
    .reduce((acc, val) => acc + (val?.cost ?? 0), 0);
};
