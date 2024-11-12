import CompareEngineTable from "@/components/CompareConsist/CompareEngineTable";
import SideBySideTable from "@/components/CompareConsist/SideBySideTable";
import CustomerSelect from "@/components/Library/Select/CustomerSelect";
import { Layout } from "@/components/Layout";
import Checkbox from "@/components/Library/Checkbox";
import Input from "@/components/Library/Input";
import Table from "@/components/Library/Table";
import { customersAtom } from "@/scripts/atoms/state";
import { getCompareDataById } from "@/scripts/controllers/compareConsistController";
import { getCustomerById, getCustomers } from "@/scripts/controllers/customerController";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function CompareConsist() {
  const router = useRouter();
  const [customerData, setCustomersData] = useAtom<Customer[]>(customersAtom);
  const [customer, setCustomer] = useState<Customer>(null);
  const [company, setCompany] = useState('');
  const [model, setModel] = useState('');
  const [serialNum, setSerialNum] = useState('');
  const [arrNum, setArrNum] = useState('');
  const [horsePower, setHorsePower] = useState('');
  const [changeCustomer, setChangeCustomer] = useState(false);
  const [notes, setNotes] = useState('');

  const [newHead, setNewHead] = useState('');
  const [newBlock, setNewBlock] = useState('');
  const [newCrank, setNewCrank] = useState('');
  const [newPistons, setNewPistons] = useState('');
  const [newCam, setNewCam] = useState('');
  const [newInjectors, setNewInjectors] = useState('');
  const [newSingleTurbo, setNewSingleTurbo] = useState('');
  const [newFWH, setNewFWH] = useState('');
  const [newFrontHsng, setNewFrontHsng] = useState('');
  const [newOilPan, setNewOilPan] = useState('');
  const [newHPTurbo, setNewHPTurbo] = useState('');
  const [newLPTurbo, setNewLPTurbo] = useState('');
  const [newHEUIPump, setNewHEUIPump] = useState('');
  const [newExhMnfld, setNewExhMnfld] = useState('');
  const [newOilPump, setNewOilPump] = useState('');
  const [newWtrPump, setNewWtrPump] = useState('');
  
  const [remanHead, setRemanHead] = useState('');
  const [remanBlock, setRemanBlock] = useState('');
  const [remanCrank, setRemanCrank] = useState('');
  const [remanPistons, setRemanPistons] = useState('');
  const [remanCam, setRemanCam] = useState('');
  const [remanInjectors, setRemanInjectors] = useState('');
  const [remanSingleTurbo, setRemanSingleTurbo] = useState('');
  const [remanFWH, setRemanFWH] = useState('');
  const [remanFrontHsng, setRemanFrontHsng] = useState('');
  const [remanOilPan, setRemanOilPan] = useState('');
  const [remanHPTurbo, setRemanHPTurbo] = useState('');
  const [remanLPTurbo, setRemanLPTurbo] = useState('');
  const [remanHEUIPump, setRemanHEUIPump] = useState('');
  const [remanExhMnfld, setRemanExhMnfld] = useState('');
  const [remanOilPump, setRemanOilPump] = useState('');
  const [remanWtrPump, setRemanWtrPump] = useState('');

  const [headChecked, setHeadChecked] = useState(false);
  const [blockChecked, setBlockChecked] = useState(false);
  const [crankChecked, setCrankChecked] = useState(false);
  const [pistonsChecked, setPistonsChecked] = useState(false);
  const [camChecked, setCamChecked] = useState(false);
  const [injectorsChecked, setInjectorsChecked] = useState(false);
  const [singleTurboChecked, setSingleTurboChecked] = useState(false);
  const [fwhChecked, setFwhChecked] = useState(false);
  const [frontHousingChecked, setFrontHousingChecked] = useState(false);
  const [oilPanChecked, setOilPanChecked] = useState(false);
  const [hpTurboChecked, setHpTurboChecked] = useState(false);
  const [lpTurboChecked, setLpTurboChecked] = useState(false);
  const [heuiPumpChecked, setHeuiPumpChecked] = useState(false);
  const [exhManChecked, setExhManChecked] = useState(false);
  const [oilPumpChecked, setOilPumpChecked] = useState(false);
  const [waterPumpChecked, setWaterPumpChecked] = useState(false);

  const [customerEngineData, setCustomerEngineData] = useState<CustomerEngineData>(null);
  const [mwdEngine, setMwdEngine] = useState<Engine>(null);
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params: any = Object.fromEntries(urlSearchParams.entries());


  useEffect(() => {
    const fetchData = async () => {
      if (params.c) {
        const res = await getCustomerById(params.c);
        setCustomer(res);
        setCompany(res.company);
        setModel(res.model);
      }
      if (params.r) {
        const res = await getCompareDataById(params.r);
        loadCompareData(res);
      }
      if (customerData.length === 0) setCustomersData(await getCustomers());
    };
    fetchData();
  }, [params.c]);

  const openSideBySide = (engine: Engine) => {
    setCustomerEngineData(getEngineData());
    setMwdEngine(engine);
  };

  const getEngineData = () => {
    const data = {
      serialNum,
      arrNum,
      newHead: headChecked ? newHead : '',
      headChecked,
      newBlock: blockChecked ? newBlock : '',
      blockChecked,
      newCrank: crankChecked ? newCrank : '',
      crankChecked,
      newPistons: pistonsChecked ? newPistons : '',
      pistonsChecked,
      newCam: camChecked ? newCam : '',
      camChecked,
      newInjectors: injectorsChecked ? newInjectors : '',
      injectorsChecked,
      newSingleTurbo: singleTurboChecked ? newSingleTurbo : '',
      singleTurboChecked,
      newFWH: fwhChecked ? newFWH : '',
      fwhChecked,
      newFrontHsng: frontHousingChecked ? newFrontHsng : '',
      frontHousingChecked,
      newOilPan: oilPanChecked ? newOilPan : '',
      oilPanChecked,
      newHPTurbo: hpTurboChecked ? newHPTurbo : '',
      hpTurboChecked,
      newLPTurbo: lpTurboChecked ? newLPTurbo : '',
      lpTurboChecked,
      newHEUIPump: heuiPumpChecked ? newHEUIPump : '',
      heuiPumpChecked,
      newExhMnfld: exhManChecked ? newExhMnfld : '',
      exhManChecked,
      newOilPump: oilPumpChecked ? newOilPump : '',
      oilPumpChecked,
      newWtrPump: waterPumpChecked ? newWtrPump : '',
      waterPumpChecked,
      remanHead: headChecked ? remanHead : '',
      remanBlock: blockChecked ? remanBlock : '',
      remanCrank: crankChecked ? remanCrank : '',
      remanPistons: pistonsChecked ? remanPistons : '',
      remanCam: camChecked ? remanCam : '',
      remanInjectors: injectorsChecked ? remanInjectors : '',
      remanSingleTurbo: singleTurboChecked ? remanSingleTurbo : '',
      remanFWH: fwhChecked ? remanFWH : '',
      remanFrontHsng: frontHousingChecked ? remanFrontHsng : '',
      remanOilPan: oilPanChecked ? remanOilPan : '',
      remanHPTurbo: hpTurboChecked ? remanHPTurbo : '',
      remanLPTurbo: lpTurboChecked ? remanLPTurbo : '',
      remanHEUIPump: heuiPumpChecked ? remanHEUIPump : '',
      remanExhMnfld: exhManChecked ? remanExhMnfld : '',
      remanOilPump: oilPumpChecked ? remanOilPump : '',
      remanWtrPump: waterPumpChecked ? remanWtrPump : ''
    };
    return Object.fromEntries(Object.entries(data).map((d) => d[1] ? d : [d[0], null])) as any;
  };

  const handleChangeCustomer = (value: string) => {
    setCompany(value);
    setChangeCustomer(false);
    const id = customerData.find((c) => c.company === value).id;
    router.replace(`/compare-consist?c=${id}`);
  };

  const loadCompareData = (data: CompareConsist) => {
    setNewHead(data.headNew);
    setNewBlock(data.blockNew);
    setNewCrank(data.crankNew);
    setNewPistons(data.pistonNew);
    setNewCam(data.camNew);
    setNewInjectors(data.injectorNew);
    setNewSingleTurbo(data.turboNew);
    setNewFWH(data.fwhNew);
    setNewFrontHsng(data.frontHsngNew);
    setNewOilPan(data.oilPanNew);
    setNewHPTurbo(data.hpTurboNew);
    setNewLPTurbo(data.lpTurboNew);
    setNewHEUIPump(data.heuiPumpNew);
    setNewExhMnfld(data.exhMnfldNew);
    setNewOilPump(data.oilPumpNew);
    setNewWtrPump(data.waterPumpNew);

    setRemanHead(data.headReman);
    setRemanBlock(data.blockReman);
    setRemanCrank(data.crankReman);
    setRemanPistons(data.pistonReman);
    setRemanCam(data.camReman);
    setRemanInjectors(data.injectorReman);
    setRemanSingleTurbo(data.turboReman);
    setRemanFWH(data.fwhReman);
    setRemanFrontHsng(data.frontHsngReman);
    setRemanOilPan(data.oilPanReman);
    setRemanHPTurbo(data.hpTurboReman);
    setRemanLPTurbo(data.lpTurboReman);
    setRemanHEUIPump(data.heuiPumpReman);
    setRemanExhMnfld(data.exhMnfldReman);
    setRemanOilPump(data.oilPumpReman);
    setRemanWtrPump(data.waterPumpNew);

    setHeadChecked(data.headCheck);
    setBlockChecked(data.blockCheck);
    setCrankChecked(data.crankCheck);
    setPistonsChecked(data.pistonCheck);
    setCamChecked(data.camCheck);
    setInjectorsChecked(data.injectorCheck);
    setSingleTurboChecked(data.turboCheck);
    setFwhChecked(data.fwhCheck);
    setFrontHousingChecked(data.frontHsngCheck);
    setOilPanChecked(data.oilPanCheck);
    setHpTurboChecked(data.hpTurboCheck);
    setLpTurboChecked(data.lpTurboCheck);
    setHeuiPumpChecked(data.heuiPumpCheck);
    setExhManChecked(data.exhMnfldCheck);
    setOilPumpChecked(data.oilPumpCheck);
    setWaterPumpChecked(data.waterPumpCheck);
  };


  return (
    <Layout title="Compare">
      <div className="compare-consist">
        {!mwdEngine ?
          <>
            <div className="compare-consist__top-bar">
              <CustomerSelect
                label="Customer"
                variant={['label-stack', 'label-bold']}
                value={company}
                onChange={(value: any) => handleChangeCustomer(value)}
                maxHeight="15rem"
              />
              {/* <Select
                label="Model"
                variant={['label-stack']}
                value={model}
                onChange={(e: any) => setModel(e.target.value)}
              >
                <option value="C-7">C-7</option>
                <option value="C-9">C-9</option>
                <option value="C-10">C-10</option>
                <option value="C-11">C-11</option>
                <option value="C-12">C-12</option>
                <option value="C-13">C-13</option>
                <option value="C-15">C-15</option>
                <option value="C-16">C-16</option>
                <option value="C-18">C-18</option>
                <option value="3116">3116</option>
                <option value="3126">3126</option>
                <option value="3176">3176</option>
                <option value="3406A">3406A</option>
                <option value="3406B">3406B</option>
                <option value="3406C">3406C</option>
                <option value="3406E">3406E</option>
                <option value="ISB">ISB</option>
                <option value="ISM">ISM</option>
                <option value="ISX">ISX</option>
                <option value="M11">M11</option>
                <option value="M14">M14</option>
              </Select> */}
              <Input
                label="Serial Number"
                variant={['label-stack', 'label-no-margin', 'thin']}
                value={serialNum}
                onChange={(e: any) => setSerialNum(e.target.value)}
              />
              <Input
                label="Arrangement Number"
                variant={['label-stack', 'label-no-margin', 'thin']}
                value={arrNum}
                onChange={(e: any) => setArrNum(e.target.value)}
              />
              {/* <Input
                label="Horse Power"
                variant={['label-stack', 'label-no-margin', 'thin', 'x-small']}
                value={horsePower}
                onChange={(e: any) => setHorsePower(e.target.value)}
              /> */}

              {/* <Input
                label="Notes"
                variant={['label-stack', 'text-area']}
                rows={2}
                cols={30}
                value={notes}
                onChange={(e: any) => setNotes(e.target.value)}
              /> */}
            </div>
  
            <div className="compare-consist__compare-section">
              <Table variant={['plain']}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Head</th>
                    <th>Block</th>
                    <th>Crank</th>
                    <th>Pistons</th>
                    <th>Cam</th>
                    <th>Injectors</th>
                    <th>Single Turbo</th>
                    <th>FWH</th>
                    <th>Front Hsng</th>
                    <th>Oil Pan</th>
                    <th>HP Turbo</th>
                    <th>LP Turbo</th>
                    <th>HEUI Pump</th>
                    <th>ExhMnfld</th>
                    <th>Oil Pump</th>
                    <th>Water Pump</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><p>New</p></td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={newHead}
                        onChange={(e: any) => setNewHead(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={newBlock}
                        onChange={(e: any) => setNewBlock(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={newCrank}
                        onChange={(e: any) => setNewCrank(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={newPistons}
                        onChange={(e: any) => setNewPistons(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={newCam}
                        onChange={(e: any) => setNewCam(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={newInjectors}
                        onChange={(e: any) => setNewInjectors(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'no-style']}
                        value={newSingleTurbo}
                        onChange={(e: any) => setNewSingleTurbo(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={newFWH}
                        onChange={(e: any) => setNewFWH(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={newFrontHsng}
                        onChange={(e: any) => setNewFrontHsng(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={newOilPan}
                        onChange={(e: any) => setNewOilPan(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={newHPTurbo}
                        onChange={(e: any) => setNewHPTurbo(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={newLPTurbo}
                        onChange={(e: any) => setNewLPTurbo(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={newHEUIPump}
                        onChange={(e: any) => setNewHEUIPump(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={newExhMnfld}
                        onChange={(e: any) => setNewExhMnfld(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={newOilPump}
                        onChange={(e: any) => setNewOilPump(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={newWtrPump}
                        onChange={(e: any) => setNewWtrPump(e.target.value)}
                      />
                    </td>
                  </tr>
  
                  <tr>
                    <td><p>Reman</p></td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={remanHead}
                        onChange={(e: any) => setRemanHead(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={remanBlock}
                        onChange={(e: any) => setRemanBlock(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={remanCrank}
                        onChange={(e: any) => setRemanCrank(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={remanPistons}
                        onChange={(e: any) => setRemanPistons(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={remanCam}
                        onChange={(e: any) => setRemanCam(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={remanInjectors}
                        onChange={(e: any) => setRemanInjectors(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'no-style']}
                        value={remanSingleTurbo}
                        onChange={(e: any) => setRemanSingleTurbo(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={remanFWH}
                        onChange={(e: any) => setRemanFWH(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={remanFrontHsng}
                        onChange={(e: any) => setRemanFrontHsng(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={remanOilPan}
                        onChange={(e: any) => setRemanOilPan(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={remanHPTurbo}
                        onChange={(e: any) => setRemanHPTurbo(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={remanLPTurbo}
                        onChange={(e: any) => setRemanLPTurbo(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={remanHEUIPump}
                        onChange={(e: any) => setRemanHEUIPump(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={remanExhMnfld}
                        onChange={(e: any) => setRemanExhMnfld(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={remanOilPump}
                        onChange={(e: any) => setRemanOilPump(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={remanWtrPump}
                        onChange={(e: any) => setRemanWtrPump(e.target.value)}
                      />
                    </td>
                  </tr>
  
                  <tr className="compare-consist__compare-section--no-border">
                    <td></td>
                    <td><Checkbox checked={headChecked} onChange={() => setHeadChecked(!headChecked)} /></td>
                    <td><Checkbox checked={blockChecked} onChange={() => setBlockChecked(!blockChecked)} /></td>
                    <td><Checkbox checked={crankChecked} onChange={() => setCrankChecked(!crankChecked)} /></td>
                    <td><Checkbox checked={pistonsChecked} onChange={() => setPistonsChecked(!pistonsChecked)} /></td>
                    <td><Checkbox checked={camChecked} onChange={() => setCamChecked(!camChecked)} /></td>
                    <td><Checkbox checked={injectorsChecked} onChange={() => setInjectorsChecked(!injectorsChecked)} /></td>
                    <td><Checkbox checked={singleTurboChecked} onChange={() => setSingleTurboChecked(!singleTurboChecked)} /></td>
                    <td><Checkbox checked={fwhChecked} onChange={() => setFwhChecked(!fwhChecked)} /></td>
                    <td><Checkbox checked={frontHousingChecked} onChange={() => setFrontHousingChecked(!frontHousingChecked)} /></td>
                    <td><Checkbox checked={oilPanChecked} onChange={() => setOilPanChecked(!oilPanChecked)} /></td>
                    <td><Checkbox checked={hpTurboChecked} onChange={() => setHpTurboChecked(!hpTurboChecked)} /></td>
                    <td><Checkbox checked={lpTurboChecked} onChange={() => setLpTurboChecked(!lpTurboChecked)} /></td>
                    <td><Checkbox checked={heuiPumpChecked} onChange={() => setHeuiPumpChecked(!heuiPumpChecked)} /></td>
                    <td><Checkbox checked={exhManChecked} onChange={() => setExhManChecked(!exhManChecked)} /></td>
                    <td><Checkbox checked={oilPumpChecked} onChange={() => setOilPumpChecked(!oilPumpChecked)} /></td>
                    <td><Checkbox checked={waterPumpChecked} onChange={() => setWaterPumpChecked(!waterPumpChecked)} /></td>
                  </tr>
                </tbody>
              </Table>
  
              <CompareEngineTable openSideBySide={openSideBySide} getEngineData={getEngineData} customerId={params.c} />
            </div>
          </>
          :
          <SideBySideTable customer={customer} customerEngineData={customerEngineData} mwdEngine={mwdEngine} setMwdEngine={setMwdEngine} />
        }
      </div>
    </Layout>
  );
}
