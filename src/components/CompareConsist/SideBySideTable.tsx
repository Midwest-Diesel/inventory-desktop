import { useEffect, useState } from "react";
import Button from "../Library/Button";
import Table from "../Library/Table";
import Checkbox from "../Library/Checkbox";
import Input from "../Library/Input";
import { formatCurrency } from "@/scripts/tools/stringUtils";
import { addQuote } from "@/scripts/controllers/quotesController";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";

interface Props {
  customer: Customer
  customerEngineData: CustomerEngineData
  mwdEngine: Engine
  setMwdEngine: (engine: Engine) => void
}


export default function SideBySideTable({ customer, customerEngineData, mwdEngine, setMwdEngine }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [matchingValues, setMatchingValues] = useState<string[]>([]);
  const isMatchingValues = (key: string) => matchingValues.includes(key);
  const [price, setPrice] = useState('' as any);

  const [frontTimingGears, setFrontTimingGears] = useState(false);
  const [valveMechanism, setValveMechanism] = useState(false);
  const [valveCover, setValveCover] = useState(false);

  useEffect(() => {
    determineMatchingValues();
  }, []);

  const determineMatchingValues = () => {
    const arr = [];
    if (customerEngineData.newHead === mwdEngine.headPartNum || customerEngineData.remanHead === mwdEngine.headRemanPartNum) arr.push('head');
    if (customerEngineData.newBlock === mwdEngine.blockPartNum || customerEngineData.remanBlock === mwdEngine.blockRemanPartNum) arr.push('block');
    if (customerEngineData.newCrank === mwdEngine.crankPartNum || customerEngineData.remanCrank === mwdEngine.crankRemanPartNum) arr.push('crank');
    if (customerEngineData.newPistons === mwdEngine.pistonsPartNum || customerEngineData.remanPistons === mwdEngine.pistonsRemanPartNum) arr.push('pistons');
    if (customerEngineData.newCam === mwdEngine.camPartNum || customerEngineData.remanCam === mwdEngine.camRemanPartNum) arr.push('cam');
    if (customerEngineData.newInjectors === mwdEngine.injPartNum || customerEngineData.remanInjectors === mwdEngine.injRemanPartNum) arr.push('injectors');
    if (customerEngineData.newSingleTurbo === mwdEngine.turboPartNum || customerEngineData.remanSingleTurbo === mwdEngine.turboRemanPartNum) arr.push('turbo');
    if (customerEngineData.newFWH === mwdEngine.fwhPartNum || customerEngineData.remanFWH === mwdEngine.fwhRemanPartNum) arr.push('fwh');
    if (customerEngineData.newFrontHsng === mwdEngine.frontHousingPartNum || customerEngineData.remanFrontHsng === mwdEngine.frontHousingPartNum) arr.push('frontHsng');
    // if (customerEngineData.newFrontHsng === mwdEngine.frontHousingPartNum || customerEngineData.remanFrontHsng === mwdEngine.frontHousingPartNum) arr.push('frontHousing');
    if (customerEngineData.newOilPan === mwdEngine.oilPanPartNum || customerEngineData.remanOilPan === mwdEngine.oilPanRemanPartNum) arr.push('oilPan');
    if (customerEngineData.newHPTurbo === mwdEngine.turboHP || customerEngineData.remanHPTurbo === mwdEngine.turboHPReman) arr.push('turboHp');
    if (customerEngineData.newLPTurbo === mwdEngine.turboLP || customerEngineData.remanLPTurbo === mwdEngine.turboLPReman) arr.push('turboLp');
    if (customerEngineData.newHEUIPump === mwdEngine.heuiPumpPartNum || customerEngineData.remanHEUIPump === mwdEngine.heuiPumpRemanPartNum) arr.push('heuiPump');
    if (customerEngineData.newExhMnfld === mwdEngine.exhMnfldNew || customerEngineData.remanExhMnfld === mwdEngine.exhMnfldReman) arr.push('exhMnfld');
    if (customerEngineData.newOilPump === mwdEngine.oilPumpNew || customerEngineData.remanOilPump === mwdEngine.oilPumpReman) arr.push('oilPump');
    if (customerEngineData.newWtrPump === mwdEngine.waterPump || customerEngineData.remanWtrPump === mwdEngine.waterPumpReman) arr.push('wtrPump');
    setMatchingValues(arr);
  };

  const sendEmail = () => {
    const recipient = (customer && customer.email) || '';
    const subject = 'Midwest%20Diesel%20Quote';
    const additionalContent = [
      frontTimingGears ? 'Front%20Timing%20Gears' : null,
      valveMechanism ? 'Valve%20Mechanism' : null,
      valveCover ? 'Valve%20Cover' : null
    ].filter((str) => str);
    const bodyContent = [...additionalContent, ...matchingValues].join('%0A');
    window.location.href = `mailto:${recipient}?subject=${subject}&body=Long%20Block%20(${mwdEngine.stockNum})%20includes:%0A${bodyContent}%0A%0APrice: ${formatCurrency(price)}`;
  };

  const createQuote = async () => {
    if (!customer) return;
    const inputPrice = prompt('Quote Price:', price);
    if (!inputPrice) return;
    const quote = {
      date: new Date(),
      source: null,
      customer: customer,
      contact: customer.contact,
      phone: customer.phone,
      state: customer.billToState,
      partNum: null,
      desc: null,
      stockNum: null,
      price: inputPrice || 0,
      notes: null,
      salesman: null,
      sale: false,
      followedUp: false,
      followUpDate: null,
      rating: null,
      toFollowUp: false,
      followUpNotes: null,
      email: customer.email,
      invoiceItem: null,
      createdAfter: false
    } as any;
    await addQuote(quote, user.id);
  };


  return (
    <div className="side-by-side-table">
      <Button variant={['X']} onClick={() => setMwdEngine(null)}>X</Button>

      <div className="side-by-side-table__top-section">
        <div>
          <h2>{ customer && customer.company }</h2>
          <div>
            <p>{ customerEngineData.serialNumber }</p>
            <p>{ customerEngineData.arrangementNumber }</p>
          </div>
        </div>
        <div>
          <h2>Midwest Diesel | { mwdEngine.model }</h2>
          <div>
            <p>{ mwdEngine.stockNum }</p>
            <p>{ mwdEngine.serialNumber }</p>
            <p>{ mwdEngine.arrangementNumber }</p>
          </div>
        </div>
      </div>

      <div className="side-by-side-table__tables">
        <Table>
          <thead>
            <tr>
              <th></th>
              <th>Reman</th>
              <th>New</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('head') ? 'var(--blue-1)' : ''}` }}>Head</th>
              <td>{ customerEngineData.remanHead }</td>
              <td>{ customerEngineData.newHead }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('block') ? 'var(--blue-1)' : ''}` }}>Block</th>
              <td>{ customerEngineData.remanBlock }</td>
              <td>{ customerEngineData.newBlock }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('crank') ? 'var(--blue-1)' : ''}` }}>Crank</th>
              <td>{ customerEngineData.remanCrank }</td>
              <td>{ customerEngineData.newCrank }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('pistons') ? 'var(--blue-1)' : ''}` }}>Pistons</th>
              <td>{ customerEngineData.remanPistons }</td>
              <td>{ customerEngineData.newPistons }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('cam') ? 'var(--blue-1)' : ''}` }}>Camshaft</th>
              <td>{ customerEngineData.remanCam }</td>
              <td>{ customerEngineData.newCam }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('injectors') ? 'var(--blue-1)' : ''}` }}>Injectors</th>
              <td>{ customerEngineData.remanInjectors }</td>
              <td>{ customerEngineData.newInjectors }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('turbo') ? 'var(--blue-1)' : ''}` }}>Single Turbo</th>
              <td>{ customerEngineData.remanSingleTurbo }</td>
              <td>{ customerEngineData.newSingleTurbo }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('fwh') ? 'var(--blue-1)' : ''}` }}>FWH</th>
              <td>{ customerEngineData.remanFWH }</td>
              <td>{ customerEngineData.newFWH }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('frontHsng') ? 'var(--blue-1)' : ''}` }}>Front Housing</th>
              <td>{ customerEngineData.remanFrontHsng }</td>
              <td>{ customerEngineData.newFrontHsng }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('oilPan') ? 'var(--blue-1)' : ''}` }}>Oil Pan</th>
              <td>{ customerEngineData.remanOilPan }</td>
              <td>{ customerEngineData.newOilPan }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('turboHp') ? 'var(--blue-1)' : ''}` }}>HP Turbo</th>
              <td>{ customerEngineData.remanHPTurbo }</td>
              <td>{ customerEngineData.newHPTurbo }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('turboLp') ? 'var(--blue-1)' : ''}` }}>LP Turbo</th>
              <td>{ customerEngineData.remanLPTurbo }</td>
              <td>{ customerEngineData.newLPTurbo }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('heuiPump') ? 'var(--blue-1)' : ''}` }}>HEUI Pump</th>
              <td>{ customerEngineData.remanHEUIPump }</td>
              <td>{ customerEngineData.newHEUIPump }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('exhMnfld') ? 'var(--blue-1)' : ''}` }}>ExhManfld</th>
              <td>{ customerEngineData.remanExhMnfld }</td>
              <td>{ customerEngineData.newExhMnfld }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('oilPump') ? 'var(--blue-1)' : ''}` }}>Oil Pump</th>
              <td>{ customerEngineData.remanOilPump }</td>
              <td>{ customerEngineData.newOilPump }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('wtrPump') ? 'var(--blue-1)' : ''}` }}>Water Pump</th>
              <td>{ customerEngineData.remanWtrPump }</td>
              <td>{ customerEngineData.newWtrPump }</td>
            </tr>
          </tbody>
        </Table>

        <Table>
          <thead>
            <tr>
              <th></th>
              <th>Reman</th>
              <th>New</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('head') ? 'var(--blue-1)' : ''}` }}>Head</th>
              <td>{ mwdEngine.headRemanPartNum }</td>
              <td>{ mwdEngine.headPartNum }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('block') ? 'var(--blue-1)' : ''}` }}>Block</th>
              <td>{ mwdEngine.blockRemanPartNum }</td>
              <td>{ mwdEngine.blockPartNum }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('crank') ? 'var(--blue-1)' : ''}` }}>Crank</th>
              <td>{ mwdEngine.crankRemanPartNum }</td>
              <td>{ mwdEngine.crankPartNum }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('pistons') ? 'var(--blue-1)' : ''}` }}>Pistons</th>
              <td>{ mwdEngine.pistonsRemanPartNum }</td>
              <td>{ mwdEngine.pistonsPartNum }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('cam') ? 'var(--blue-1)' : ''}` }}>Camshaft</th>
              <td>{ mwdEngine.camRemanPartNum }</td>
              <td>{ mwdEngine.camPartNum }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('injectors') ? 'var(--blue-1)' : ''}` }}>Injectors</th>
              <td>{ mwdEngine.injRemanPartNum }</td>
              <td>{ mwdEngine.injPartNum }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('turbo') ? 'var(--blue-1)' : ''}` }}>Single Turbo</th>
              <td>{ mwdEngine.turboRemanPartNum }</td>
              <td>{ mwdEngine.turboPartNum }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('fwh') ? 'var(--blue-1)' : ''}` }}>FWH</th>
              <td>{ mwdEngine.fwhRemanPartNum }</td>
              <td>{ mwdEngine.fwhPartNum }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('frontHsng') ? 'var(--blue-1)' : ''}` }}>Front Housing</th>
              <td>{ mwdEngine.frontHousingPartNum }</td>
              <td>{ mwdEngine.frontHousingPartNum }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('oilPan') ? 'var(--blue-1)' : ''}` }}>Oil Pan</th>
              <td>{ mwdEngine.oilPanRemanPartNum }</td>
              <td>{ mwdEngine.oilPanPartNum }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('turboHp') ? 'var(--blue-1)' : ''}` }}>HP Turbo</th>
              <td>{ mwdEngine.turboHPReman }</td>
              <td>{ mwdEngine.turboHP }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('turboLp') ? 'var(--blue-1)' : ''}` }}>LP Turbo</th>
              <td>{ mwdEngine.turboLPReman }</td>
              <td>{ mwdEngine.turboLP }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('heuiPump') ? 'var(--blue-1)' : ''}` }}>HEUI Pump</th>
              <td>{ mwdEngine.heuiPumpRemanPartNum }</td>
              <td>{ mwdEngine.heuiPumpPartNum }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('exhMnfld') ? 'var(--blue-1)' : ''}` }}>ExhManfld</th>
              <td>{ mwdEngine.exhMnfldReman }</td>
              <td>{ mwdEngine.exhMnfldNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('oilPump') ? 'var(--blue-1)' : ''}` }}>Oil Pump</th>
              <td>{ mwdEngine.oilPumpReman }</td>
              <td>{ mwdEngine.oilPumpNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('wtrPump') ? 'var(--blue-1)' : ''}` }}>Water Pump</th>
              <td>{ mwdEngine.waterPumpReman }</td>
              <td>{ mwdEngine.waterPump }</td>
            </tr>
          </tbody>
        </Table>
      </div>

      <div className="side-by-side-table__include-in-email">
        <h2>Include in Email:</h2>
        <div style={{ display: 'flex' }}>
          <Checkbox checked={frontTimingGears} onChange={() => setFrontTimingGears(!frontTimingGears)} />
          <p>Front Timing Gears</p>
        </div>
        <div style={{ display: 'flex' }}>
          <Checkbox checked={valveMechanism} onChange={() => setValveMechanism(!valveMechanism)} />
          <p>Valve Mechanism</p>
        </div>
        <div style={{ display: 'flex' }}>
          <Checkbox checked={valveCover} onChange={() => setValveCover(!valveCover)} />
          <p>Valve Cover</p>
        </div>

        <Input
          label="Price"
          variant={['label-stack', 'small']}
          type="number"
          value={price}
          onChange={(e: any) => setPrice(e.target.value)}
        />
      </div>

      <div className="side-by-side-table__bottom-buttons">
        <Button onClick={sendEmail}>Send Email</Button>
        <Button onClick={createQuote}>Create Quote</Button>
      </div>
    </div>
  );
}
