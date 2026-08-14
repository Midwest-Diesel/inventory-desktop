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

export const getEnginePartsFromEngine = (engine: Engine): EnginePartsTable => {
  return {
    blockReman: engine.blockReman,
    blockNew: engine.blockNew,
    blockCasting: engine.blockCasting,
    blockActual: engine.blockActual,
    crankReman: engine.crankReman,
    crankNew: engine.crankNew,
    crankActual: engine.crankActual,
    camReman: engine.camReman,
    camNew: engine.camNew,
    camActual: engine.camActual,
    injReman: engine.injReman,
    injNew: engine.injNew,
    injActual: engine.injActual,
    turboReman: engine.turboReman,
    turboNew: engine.turboNew,
    turboActual: engine.turboActual,
    turboHpReman: engine.turboHpReman,
    turboHpNew: engine.turboHpNew,
    turboHpActual: engine.turboHpActual,
    turboLpReman: engine.turboLpReman,
    turboLpNew: engine.turboLpNew,
    turboLpActual: engine.turboLpActual,
    headReman: engine.headReman,
    headNew: engine.headNew,
    headActual: engine.headActual,
    pistonReman: engine.pistonReman,
    pistonNew: engine.pistonNew,
    pistonActual: engine.pistonActual,
    fwhNew: engine.fwhNew,
    fwhActual: engine.fwhActual,
    fwhReman: engine.fwhReman,
    flywheelNew: engine.flywheelNew,
    flywheelActual: engine.flywheelActual,
    ragNew: engine.ragNew,
    ragActual: engine.ragActual,
    oilPanReman: engine.oilPanReman,
    oilPanNew: engine.oilPanNew,
    oilPanActual: engine.oilPanActual,
    oilCoolerReman: engine.oilCoolerReman,
    oilCoolerNew: engine.oilCoolerNew,
    oilCoolerActual: engine.oilCoolerActual,
    frontHousingNew: engine.frontHousingNew,
    frontHousingActual: engine.frontHousingActual,
    heuiPumpReman: engine.heuiPumpReman,
    heuiPumpNew: engine.heuiPumpNew,
    heuiPumpActual: engine.heuiPumpActual,
    oilPumpReman: engine.oilPumpReman,
    oilPumpNew: engine.oilPumpNew,
    oilPumpActual: engine.oilPumpActual,
    waterPumpReman: engine.waterPumpReman,
    waterPump: engine.waterPumpNew,
    waterPumpActual: engine.waterPumpActual,
    exhManifoldNew: engine.exhManifoldNew,
    exhManifoldActual: engine.exhManifoldActual,
    exhManifoldReman: engine.exhManifoldReman
  };
};
