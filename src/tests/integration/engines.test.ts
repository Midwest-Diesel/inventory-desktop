import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { resetDb } from '../resetDatabase';
import { setApiBaseUrl } from '@/scripts/config/axios';
import { loginUser } from '@/scripts/services/accountService';
import { editEngineCorePartsTableByArrNum, editEnginePartsTableByArrNum, getEngineByStockNum } from '@/scripts/services/enginesService';
import { getEnginePartsFromEngine } from '@/scripts/logic/engines';

beforeAll(async () => {
  setApiBaseUrl('http://localhost:8001');
});

beforeEach(async () => {
  await resetDb();
  await loginUser({ username: 'test', password: 'mwdup' });
});


describe('Engines Integration', () => {
  it('Set all parts table for matching arrNum', async () => {
    const engine1 = await getEngineByStockNum(7260);
    expect(engine1).toBeTruthy();

    const engine1Parts = getEnginePartsFromEngine(engine1!);
    if (engine1?.arrNum) await editEnginePartsTableByArrNum(engine1Parts, engine1.arrNum);

    const engine2 = await getEngineByStockNum(7261);
    const engine2Parts = getEnginePartsFromEngine(engine2!);
    expect(engine1Parts).toEqual(engine2Parts);
  });

  it('Set core parts table for matching arrNum', async () => {
    const engine1 = await getEngineByStockNum(7260);
    expect(engine1).toBeTruthy();

    const engine1Parts = getEnginePartsFromEngine(engine1!);
    if (engine1?.arrNum) await editEngineCorePartsTableByArrNum(engine1Parts, engine1.arrNum);

    const engine2 = await getEngineByStockNum(7261);
    const engine2Parts = getEnginePartsFromEngine(engine2!);
    const expectedParts = {
      blockReman: engine2Parts.blockReman,
      blockNew: engine2Parts.blockNew,
      crankReman: engine2Parts.crankReman,
      crankNew: engine2Parts.crankNew,
      camReman: engine2Parts.camReman,
      camNew: engine2Parts.camNew,
      injReman: engine2Parts.injReman,
      injNew: engine2Parts.injNew,
      headReman: engine2Parts.headReman,
      headNew: engine2Parts.headNew,
      pistonReman: engine2Parts.pistonReman,
      pistonNew: engine2Parts.pistonNew,
      ragNew: engine2Parts.ragNew,
      oilPumpReman: engine2Parts.oilPumpReman,
      oilPumpNew: engine2Parts.oilPumpNew,
      waterPumpReman: engine2Parts.waterPumpReman,
      waterPump: engine2Parts.waterPump
    };

    expect(engine1Parts).toMatchObject(expectedParts);
  });
});
