import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { resetDb } from '../resetDatabase';
import { setApiBaseUrl } from '@/scripts/config/axios';
import { loginUser } from '@/scripts/services/accountService';
import { editEnginePartsTableByArrNum, getEngineByStockNum } from '@/scripts/services/enginesService';
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
});
