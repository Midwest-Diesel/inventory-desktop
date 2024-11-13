import { useEffect, useState } from "react";
import Button from "../Library/Button";
import Table from "../Library/Table";
import Checkbox from "../Library/Checkbox";
import Input from "../Library/Input";
import { formatCurrency } from "@/scripts/tools/stringUtils";
import { addQuote } from "@/scripts/controllers/quotesController";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";
import { invoke } from "@tauri-apps/api/tauri";

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
    if (customerEngineData.headNew === mwdEngine.headNew || customerEngineData.headReman === mwdEngine.headReman) arr.push(`Head`);
    if (customerEngineData.blockNew === mwdEngine.blockNew || customerEngineData.blockReman === mwdEngine.blockReman) arr.push(`Block`);
    if (customerEngineData.crankNew === mwdEngine.crankNew || customerEngineData.crankReman === mwdEngine.crankReman) arr.push(`Crank`);
    if (customerEngineData.pistonNew === mwdEngine.pistonNew || customerEngineData.pistonReman === mwdEngine.pistonReman) arr.push(`Pistons`);
    if (customerEngineData.camNew === mwdEngine.camNew || customerEngineData.camReman === mwdEngine.camReman) arr.push(`Cam`);
    if (customerEngineData.injNew === mwdEngine.injNew || customerEngineData.injReman === mwdEngine.injReman) arr.push(`Injectors`);
    if (customerEngineData.turboNew === mwdEngine.turboNew || customerEngineData.turboReman === mwdEngine.turboReman) arr.push(`Turbo`);
    if (customerEngineData.fwhNew === mwdEngine.fwhNew || customerEngineData.fwhReman === mwdEngine.fwhReman) arr.push(`Fwh`);
    if (customerEngineData.frontHsngNew === mwdEngine.frontHsngNew || customerEngineData.frontHsngReman === mwdEngine.frontHsngNew) arr.push(`FrontHsng`);
    if (customerEngineData.oilPanNew === mwdEngine.oilPanNew || customerEngineData.oilPanReman === mwdEngine.oilPanReman) arr.push(`OilPan`);
    if (customerEngineData.turboHpNew === mwdEngine.turboHpNew || customerEngineData.turboHpReman === mwdEngine.turboHpReman) arr.push(`TurboHp`);
    if (customerEngineData.turboLpNew === mwdEngine.turboLpNew || customerEngineData.turboLpReman === mwdEngine.turboLpReman) arr.push(`TurboLp`);
    if (customerEngineData.heuiPumpNew === mwdEngine.heuiPumpNew || customerEngineData.heuiPumpReman === mwdEngine.heuiPumpReman) arr.push(`HeuiPump`);
    if (customerEngineData.exhMnfldNew === mwdEngine.exhMnfldNew || customerEngineData.exhMnfldReman === mwdEngine.exhMnfldReman) arr.push(`ExhMnfld`);
    if (customerEngineData.oilPumpNew === mwdEngine.oilPumpNew || customerEngineData.oilPumpReman === mwdEngine.oilPumpReman) arr.push(`OilPump`);
    if (customerEngineData.waterPumpNew === mwdEngine.waterPumpNew || customerEngineData.waterPumpReman === mwdEngine.waterPumpReman) arr.push(`WtrPump`);
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
    await invoke('new_email_draft', { emailArgs });
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
            { customerEngineData.serialNum && <p><strong>Serial Number: </strong>{ customerEngineData.serialNum }</p> }
            { customerEngineData.arrNum && <p><strong>Arrangement Number: </strong>{ customerEngineData.arrNum }</p> }
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
              <th style={{ backgroundColor: `${isMatchingValues('head') ? 'var(--blue-1)' : ''}` }}>Head</th>
              <td>{ customerEngineData.headReman }</td>
              <td>{ customerEngineData.headNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('block') ? 'var(--blue-1)' : ''}` }}>Block</th>
              <td>{ customerEngineData.blockReman }</td>
              <td>{ customerEngineData.blockNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('crank') ? 'var(--blue-1)' : ''}` }}>Crank</th>
              <td>{ customerEngineData.crankReman }</td>
              <td>{ customerEngineData.crankNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('pistons') ? 'var(--blue-1)' : ''}` }}>Pistons</th>
              <td>{ customerEngineData.pistonReman }</td>
              <td>{ customerEngineData.pistonNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('cam') ? 'var(--blue-1)' : ''}` }}>Camshaft</th>
              <td>{ customerEngineData.camReman }</td>
              <td>{ customerEngineData.camNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('injs') ? 'var(--blue-1)' : ''}` }}>Injectors</th>
              <td>{ customerEngineData.injReman }</td>
              <td>{ customerEngineData.injNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('turbo') ? 'var(--blue-1)' : ''}` }}>Single Turbo</th>
              <td>{ customerEngineData.turboReman }</td>
              <td>{ customerEngineData.turboNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('fwh') ? 'var(--blue-1)' : ''}` }}>FWH</th>
              <td>{ customerEngineData.fwhReman }</td>
              <td>{ customerEngineData.fwhNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('frontHsng') ? 'var(--blue-1)' : ''}` }}>Front Housing</th>
              <td>{ customerEngineData.frontHsngReman }</td>
              <td>{ customerEngineData.frontHsngNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('oilPan') ? 'var(--blue-1)' : ''}` }}>Oil Pan</th>
              <td>{ customerEngineData.oilPanReman }</td>
              <td>{ customerEngineData.oilPanNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('turboHp') ? 'var(--blue-1)' : ''}` }}>HP Turbo</th>
              <td>{ customerEngineData.turboHpReman }</td>
              <td>{ customerEngineData.turboHpNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('turboLp') ? 'var(--blue-1)' : ''}` }}>LP Turbo</th>
              <td>{ customerEngineData.turboLpReman }</td>
              <td>{ customerEngineData.turboLpNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('heuiPump') ? 'var(--blue-1)' : ''}` }}>HEUI Pump</th>
              <td>{ customerEngineData.heuiPumpReman }</td>
              <td>{ customerEngineData.heuiPumpNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('exhMnfld') ? 'var(--blue-1)' : ''}` }}>ExhManfld</th>
              <td>{ customerEngineData.exhMnfldReman }</td>
              <td>{ customerEngineData.exhMnfldNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('oilPump') ? 'var(--blue-1)' : ''}` }}>Oil Pump</th>
              <td>{ customerEngineData.oilPumpReman }</td>
              <td>{ customerEngineData.oilPumpNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('wtrPump') ? 'var(--blue-1)' : ''}` }}>Water Pump</th>
              <td>{ customerEngineData.waterPumpReman }</td>
              <td>{ customerEngineData.waterPumpNew }</td>
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
              <td>{ mwdEngine.headReman }</td>
              <td>{ mwdEngine.headNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('block') ? 'var(--blue-1)' : ''}` }}>Block</th>
              <td>{ mwdEngine.blockReman }</td>
              <td>{ mwdEngine.blockNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('crank') ? 'var(--blue-1)' : ''}` }}>Crank</th>
              <td>{ mwdEngine.crankReman }</td>
              <td>{ mwdEngine.crankNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('pistons') ? 'var(--blue-1)' : ''}` }}>Pistons</th>
              <td>{ mwdEngine.pistonReman }</td>
              <td>{ mwdEngine.pistonNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('cam') ? 'var(--blue-1)' : ''}` }}>Camshaft</th>
              <td>{ mwdEngine.camReman }</td>
              <td>{ mwdEngine.camNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('injs') ? 'var(--blue-1)' : ''}` }}>Injectors</th>
              <td>{ mwdEngine.injReman }</td>
              <td>{ mwdEngine.injNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('turbo') ? 'var(--blue-1)' : ''}` }}>Single Turbo</th>
              <td>{ mwdEngine.turboReman }</td>
              <td>{ mwdEngine.turboNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('fwh') ? 'var(--blue-1)' : ''}` }}>FWH</th>
              <td>{ mwdEngine.fwhReman }</td>
              <td>{ mwdEngine.fwhNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('fronthsng') ? 'var(--blue-1)' : ''}` }}>Front Housing</th>
              <td>{ mwdEngine.frontHsngNew }</td>
              <td>{ mwdEngine.frontHsngNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('oilpan') ? 'var(--blue-1)' : ''}` }}>Oil Pan</th>
              <td>{ mwdEngine.oilPanReman }</td>
              <td>{ mwdEngine.oilPanNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('turbohp') ? 'var(--blue-1)' : ''}` }}>HP Turbo</th>
              <td>{ mwdEngine.turboHpReman }</td>
              <td>{ mwdEngine.turboHpNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('turbolp') ? 'var(--blue-1)' : ''}` }}>LP Turbo</th>
              <td>{ mwdEngine.turboLpReman }</td>
              <td>{ mwdEngine.turboLpNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('heuipump') ? 'var(--blue-1)' : ''}` }}>HEUI Pump</th>
              <td>{ mwdEngine.heuiPumpReman }</td>
              <td>{ mwdEngine.heuiPumpNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('exhmnfld') ? 'var(--blue-1)' : ''}` }}>ExhManfld</th>
              <td>{ mwdEngine.exhMnfldReman }</td>
              <td>{ mwdEngine.exhMnfldNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('oilpump') ? 'var(--blue-1)' : ''}` }}>Oil Pump</th>
              <td>{ mwdEngine.oilPumpReman }</td>
              <td>{ mwdEngine.oilPumpNew }</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: `${isMatchingValues('wtrpump') ? 'var(--blue-1)' : ''}` }}>Water Pump</th>
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
          value={price}
          onChange={(e: any) => setPrice(e.target.value)}
        />
      </div>

      <div className="side-by-side-table__bottom-buttons">
        <Button onClick={sendEmail}>Create Email</Button>
        {/* <Button onClick={createQuote}>Create Quote</Button> */}
      </div>
    </div>
  );
}
