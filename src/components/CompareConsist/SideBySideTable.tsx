import { useEffect, useState } from "react";
import Button from "../library/Button";
import Table from "../library/Table";
import Checkbox from "../library/Checkbox";
import Input from "../library/Input";
import { formatCurrency } from "@/scripts/tools/stringUtils";
import { addQuote } from "@/scripts/services/quotesService";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";
import { invoke } from "@/scripts/config/tauri";
import { useNavState } from "../../hooks/useNavState";

interface Props {
  customer: Customer | null
  customerEngineData: CustomerEngineData | null
  mwdEngine: Engine
  setMwdEngine: (engine: Engine | null) => void
}


export default function SideBySideTable({ customer, customerEngineData, mwdEngine, setMwdEngine }: Props) {
  const { push } = useNavState();
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
    if ((customerEngineData?.headNew && customerEngineData?.headNew === mwdEngine.headNew) || (customerEngineData?.headReman && customerEngineData?.headReman === mwdEngine.headReman))
      arr.push(`Head`);
    if ((customerEngineData?.blockNew && customerEngineData?.blockNew === mwdEngine.blockNew) || (customerEngineData?.blockReman && customerEngineData?.blockReman === mwdEngine.blockReman))
      arr.push(`Block`);
    if ((customerEngineData?.crankNew && customerEngineData?.crankNew === mwdEngine.crankNew) || (customerEngineData?.crankReman && customerEngineData?.crankReman === mwdEngine.crankReman))
      arr.push(`Crank`);
    if ((customerEngineData?.pistonNew && customerEngineData?.pistonNew === mwdEngine.pistonNew) || (customerEngineData?.pistonReman && customerEngineData?.pistonReman === mwdEngine.pistonReman))
      arr.push(`Pistons`);
    if ((customerEngineData?.camNew && customerEngineData?.camNew === mwdEngine.camNew) || (customerEngineData?.camReman && customerEngineData?.camReman === mwdEngine.camReman))
      arr.push(`Cam`);
    if ((customerEngineData?.injNew && customerEngineData?.injNew === mwdEngine.injNew) || (customerEngineData?.injReman && customerEngineData?.injReman === mwdEngine.injReman))
      arr.push(`Injectors`);
    if ((customerEngineData?.turboNew && customerEngineData?.turboNew === mwdEngine.turboNew) || (customerEngineData?.turboReman && customerEngineData?.turboReman === mwdEngine.turboReman))
      arr.push(`Turbo`);
    if ((customerEngineData?.fwhNew && customerEngineData?.fwhNew === mwdEngine.fwhNew) || (customerEngineData?.fwhReman && customerEngineData?.fwhReman === mwdEngine.fwhReman))
      arr.push(`Fwh`);
    if ((customerEngineData?.frontHsngNew && customerEngineData?.frontHsngNew === mwdEngine.frontHsngNew) || (customerEngineData?.frontHsngReman && customerEngineData?.frontHsngReman === mwdEngine.frontHsngNew))
      arr.push(`FrontHsng`);
    if ((customerEngineData?.oilPanNew && customerEngineData?.oilPanNew === mwdEngine.oilPanNew) || (customerEngineData?.oilPanReman && customerEngineData?.oilPanReman === mwdEngine.oilPanReman))
      arr.push(`OilPan`);
    if ((customerEngineData?.turboHpNew && customerEngineData?.turboHpNew === mwdEngine.turboHpNew) || (customerEngineData?.turboHpReman && customerEngineData?.turboHpReman === mwdEngine.turboHpReman))
      arr.push(`TurboHp`);
    if ((customerEngineData?.turboLpNew && customerEngineData?.turboLpNew === mwdEngine.turboLpNew) || (customerEngineData?.turboLpReman && customerEngineData?.turboLpReman === mwdEngine.turboLpReman))
      arr.push(`TurboLp`);
    if ((customerEngineData?.heuiPumpNew && customerEngineData?.heuiPumpNew === mwdEngine.heuiPumpNew) || (customerEngineData?.heuiPumpReman && customerEngineData?.heuiPumpReman === mwdEngine.heuiPumpReman))
      arr.push(`HeuiPump`);
    if ((customerEngineData?.exhMnfldNew && customerEngineData?.exhMnfldNew === mwdEngine.exhMnfldNew) || (customerEngineData?.exhMnfldReman && customerEngineData?.exhMnfldReman === mwdEngine.exhMnfldReman))
      arr.push(`ExhMnfld`);
    if ((customerEngineData?.oilPumpNew && customerEngineData?.oilPumpNew === mwdEngine.oilPumpNew) || (customerEngineData?.oilPumpReman && customerEngineData?.oilPumpReman === mwdEngine.oilPumpReman))
      arr.push(`OilPump`);
    if ((customerEngineData?.waterPumpNew && customerEngineData?.waterPumpNew === mwdEngine.waterPumpNew) || (customerEngineData?.waterPumpReman && customerEngineData?.waterPumpReman === mwdEngine.waterPumpReman))
      arr.push(`WaterPump`);
    setMatchingValues(arr.map((item) => item.replaceAll('\n', '').trim()));
  };

  const sendEmail = async () => {
    const recipient = (customer && customer.email) || '';
    const additionalContent = [
      frontTimingGears ? 'Front Timing Gears' : null,
      valveMechanism ? 'Valve Mechanism' : null,
      valveCover ? 'Valve Cover' : null
    ].filter((str) => str);
    const bodyContent = [...additionalContent, ...matchingValues];

    /* eslint-disable */
    const emailArgs: Email = {
      subject: `Midwest Diesel Quote`,
      body: `
        <h2>Engine ${mwdEngine.stockNum} includes:</h2>
        <ul>
          ${bodyContent.map((item) => {
            return (
              `<li>${item}</li>`
            );
          }).join('')}
        </ul>
        <br />
        Price: ${formatCurrency(price)}
      `,
      recipients: [recipient],
      attachments: []
    };
    /* eslint-enable */
    await invoke('new_email_draft', { emailArgs });
  };

  const createQuote = async () => {
    if (!customer) return;
    const quote = {
      date: new Date(),
      source: null,
      customerId: customer.id,
      contact: customer.contact,
      phone: customer.phone,
      state: customer.billToState,
      partNum: null,
      desc: '',
      stockNum: null,
      price: price || 0,
      notes: null,
      salesmanId: user.id,
      rating: 0,
      email: customer.email,
      partId: null
    } as any;
    await addQuote(quote);
    await push('Home', '/');
  };


  return (
    <div className="side-by-side-table">
      <Button variant={['X']} onClick={() => setMwdEngine(null)}>X</Button>

      <div className="side-by-side-table__top-section">
        <div>
          <h2>{ customer && customer.company }</h2>
          <div>
            { customerEngineData?.serialNum && <p><strong>Serial Number: </strong>{ customerEngineData?.serialNum }</p> }
            { customerEngineData?.arrNum && <p><strong>Arrangement Number: </strong>{ customerEngineData?.arrNum }</p> }
          </div>
        </div>
        <div>
          <h2>Midwest Diesel | { mwdEngine.model }</h2>
          <div>
            <p><strong>Stock Number: </strong>{ mwdEngine.stockNum }</p>
            { mwdEngine.serialNum && <p><strong>Serial Number: </strong>{ mwdEngine.serialNum }</p> }
            { mwdEngine.arrNum && <p><strong>Arrangement Number: </strong>{ mwdEngine.arrNum }</p> }
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
              <th style={{ backgroundColor: `${isMatchingValues('Head') ? 'var(--blue-1)' : ''}` }}>Head</th>
              <td>{ customerEngineData?.headReman }</td>
              <td>{ customerEngineData?.headNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('Block') ? 'var(--blue-1)' : ''}` }}>Block</th>
              <td>{ customerEngineData?.blockReman }</td>
              <td>{ customerEngineData?.blockNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('Crank') ? 'var(--blue-1)' : ''}` }}>Crank</th>
              <td>{ customerEngineData?.crankReman }</td>
              <td>{ customerEngineData?.crankNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('Pistons') ? 'var(--blue-1)' : ''}` }}>Pistons</th>
              <td>{ customerEngineData?.pistonReman }</td>
              <td>{ customerEngineData?.pistonNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('Cam') ? 'var(--blue-1)' : ''}` }}>Camshaft</th>
              <td>{ customerEngineData?.camReman }</td>
              <td>{ customerEngineData?.camNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('Injectors') ? 'var(--blue-1)' : ''}` }}>Injectors</th>
              <td>{ customerEngineData?.injReman }</td>
              <td>{ customerEngineData?.injNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('Turbo') ? 'var(--blue-1)' : ''}` }}>Single Turbo</th>
              <td>{ customerEngineData?.turboReman }</td>
              <td>{ customerEngineData?.turboNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('Fwh') ? 'var(--blue-1)' : ''}` }}>FWH</th>
              <td>{ customerEngineData?.fwhReman }</td>
              <td>{ customerEngineData?.fwhNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('FrontHsng') ? 'var(--blue-1)' : ''}` }}>Front Housing</th>
              <td>{ customerEngineData?.frontHsngReman }</td>
              <td>{ customerEngineData?.frontHsngNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('OilPan') ? 'var(--blue-1)' : ''}` }}>Oil Pan</th>
              <td>{ customerEngineData?.oilPanReman }</td>
              <td>{ customerEngineData?.oilPanNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('TurboHp') ? 'var(--blue-1)' : ''}` }}>HP Turbo</th>
              <td>{ customerEngineData?.turboHpReman }</td>
              <td>{ customerEngineData?.turboHpNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('TurboLp') ? 'var(--blue-1)' : ''}` }}>LP Turbo</th>
              <td>{ customerEngineData?.turboLpReman }</td>
              <td>{ customerEngineData?.turboLpNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('HeuiPump') ? 'var(--blue-1)' : ''}` }}>HEUI Pump</th>
              <td>{ customerEngineData?.heuiPumpReman }</td>
              <td>{ customerEngineData?.heuiPumpNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('ExhMnfld') ? 'var(--blue-1)' : ''}` }}>ExhManfld</th>
              <td>{ customerEngineData?.exhMnfldReman }</td>
              <td>{ customerEngineData?.exhMnfldNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('OilPump') ? 'var(--blue-1)' : ''}` }}>Oil Pump</th>
              <td>{ customerEngineData?.oilPumpReman }</td>
              <td>{ customerEngineData?.oilPumpNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('WaterPump') ? 'var(--blue-1)' : ''}` }}>Water Pump</th>
              <td>{ customerEngineData?.waterPumpReman }</td>
              <td>{ customerEngineData?.waterPumpNew }</td>
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
              <th style={{ backgroundColor: `${isMatchingValues('Head') ? 'var(--blue-1)' : ''}` }}>Head</th>
              <td>{ mwdEngine.headReman }</td>
              <td>{ mwdEngine.headNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('Block') ? 'var(--blue-1)' : ''}` }}>Block</th>
              <td>{ mwdEngine.blockReman }</td>
              <td>{ mwdEngine.blockNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('Crank') ? 'var(--blue-1)' : ''}` }}>Crank</th>
              <td>{ mwdEngine.crankReman }</td>
              <td>{ mwdEngine.crankNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('Pistons') ? 'var(--blue-1)' : ''}` }}>Pistons</th>
              <td>{ mwdEngine.pistonReman }</td>
              <td>{ mwdEngine.pistonNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('Cam') ? 'var(--blue-1)' : ''}` }}>Camshaft</th>
              <td>{ mwdEngine.camReman }</td>
              <td>{ mwdEngine.camNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('Injectors') ? 'var(--blue-1)' : ''}` }}>Injectors</th>
              <td>{ mwdEngine.injReman }</td>
              <td>{ mwdEngine.injNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('Turbo') ? 'var(--blue-1)' : ''}` }}>Single Turbo</th>
              <td>{ mwdEngine.turboReman }</td>
              <td>{ mwdEngine.turboNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('Fwh') ? 'var(--blue-1)' : ''}` }}>FWH</th>
              <td>{ mwdEngine.fwhReman }</td>
              <td>{ mwdEngine.fwhNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('FrontHsng') ? 'var(--blue-1)' : ''}` }}>Front Housing</th>
              <td></td>
              <td>{ mwdEngine.frontHsngNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('OilPan') ? 'var(--blue-1)' : ''}` }}>Oil Pan</th>
              <td>{ mwdEngine.oilPanReman }</td>
              <td>{ mwdEngine.oilPanNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('TurboHp') ? 'var(--blue-1)' : ''}` }}>HP Turbo</th>
              <td>{ mwdEngine.turboHpReman }</td>
              <td>{ mwdEngine.turboHpNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('TurboLp') ? 'var(--blue-1)' : ''}` }}>LP Turbo</th>
              <td>{ mwdEngine.turboLpReman }</td>
              <td>{ mwdEngine.turboLpNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('HeuiPump') ? 'var(--blue-1)' : ''}` }}>HEUI Pump</th>
              <td>{ mwdEngine.heuiPumpReman }</td>
              <td>{ mwdEngine.heuiPumpNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('ExhMnfld') ? 'var(--blue-1)' : ''}` }}>ExhManfld</th>
              <td>{ mwdEngine.exhMnfldReman }</td>
              <td>{ mwdEngine.exhMnfldNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('OilPump') ? 'var(--blue-1)' : ''}` }}>Oil Pump</th>
              <td>{ mwdEngine.oilPumpReman }</td>
              <td>{ mwdEngine.oilPumpNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('WaterPump') ? 'var(--blue-1)' : ''}` }}>Water Pump</th>
              <td>{ mwdEngine.waterPumpReman }</td>
              <td>{ mwdEngine.waterPumpNew }</td>
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
          step="any"
          value={price}
          onChange={(e: any) => setPrice(e.target.value)}
        />
      </div>

      <div className="side-by-side-table__bottom-buttons">
        <Button onClick={sendEmail}>Create Email</Button>
        <Button onClick={createQuote}>Create Quote</Button>
      </div>
    </div>
  );
}
