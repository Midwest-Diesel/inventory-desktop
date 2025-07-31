import CompareEngineTable from "@/components/CompareConsist/CompareEngineTable";
import SideBySideTable from "@/components/CompareConsist/SideBySideTable";
import CustomerDropdown from "@/components/Library/Dropdown/CustomerDropdown";
import { Layout } from "@/components/Layout";
import Checkbox from "@/components/Library/Checkbox";
import Input from "@/components/Library/Input";
import Table from "@/components/Library/Table";
import { customersAtom } from "@/scripts/atoms/state";
import { getCompareDataById, searchCompareData } from "@/scripts/services/compareConsistService";
import { getCustomerById, getCustomers } from "@/scripts/services/customerService";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import Button from "@/components/Library/Button";
import { useNavState } from "@/hooks/useNavState";


export default function CompareConsist() {
  const { push } = useNavState();
  const [customerData, setCustomersData] = useAtom<Customer[]>(customersAtom);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [company, setCompany] = useState('');
  const [serialNum, setSerialNum] = useState('');
  const [arrNum, setArrNum] = useState('');

  const [headNew, setNewHead] = useState('');
  const [blockNew, setNewBlock] = useState('');
  const [crankNew, setNewCrank] = useState('');
  const [pistonNew, setNewPistons] = useState('');
  const [camNew, setNewCam] = useState('');
  const [injNew, setNewInjectors] = useState('');
  const [turboNew, setNewSingleTurbo] = useState('');
  const [fwhNew, setNewFWH] = useState('');
  const [frontHsngNew, setNewFrontHsng] = useState('');
  const [oilPanNew, setNewOilPan] = useState('');
  const [turboHpNew, setNewHPTurbo] = useState('');
  const [turboLpNew, setNewLPTurbo] = useState('');
  const [heuiPumpNew, setNewHEUIPump] = useState('');
  const [exhMnfldNew, setNewExhMnfld] = useState('');
  const [oilPumpNew, setNewOilPump] = useState('');
  const [waterPumpNew, setNewWtrPump] = useState('');
  
  const [headReman, setRemanHead] = useState('');
  const [blockReman, setRemanBlock] = useState('');
  const [crankReman, setRemanCrank] = useState('');
  const [pistonReman, setRemanPistons] = useState('');
  const [camReman, setRemanCam] = useState('');
  const [injReman, setRemanInjectors] = useState('');
  const [turboReman, setRemanSingleTurbo] = useState('');
  const [fwhReman, setRemanFWH] = useState('');
  const [frontHsngReman, setRemanFrontHsng] = useState('');
  const [oilPanReman, setRemanOilPan] = useState('');
  const [turboHpReman, setRemanHPTurbo] = useState('');
  const [turboLpReman, setRemanLPTurbo] = useState('');
  const [heuiPumpReman, setRemanHEUIPump] = useState('');
  const [exhMnfldReman, setRemanExhMnfld] = useState('');
  const [oilPumpReman, setRemanOilPump] = useState('');
  const [waterPumpReman, setRemanWtrPump] = useState('');

  const [headCheck, setHeadCheck] = useState(false);
  const [blockCheck, setBlockCheck] = useState(false);
  const [crankCheck, setCrankCheck] = useState(false);
  const [pistonCheck, setPistonsCheck] = useState(false);
  const [camCheck, setCamCheck] = useState(false);
  const [injCheck, setInjectorsCheck] = useState(false);
  const [turboCheck, setSingleTurboCheck] = useState(false);
  const [fwhCheck, setFwhCheck] = useState(false);
  const [frontHsngCheck, setFrontHousingCheck] = useState(false);
  const [oilPanCheck, setOilPanCheck] = useState(false);
  const [turboHpCheck, setHpTurboCheck] = useState(false);
  const [turboLpCheck, setLpTurboCheck] = useState(false);
  const [heuiPumpCheck, setHeuiPumpCheck] = useState(false);
  const [exhMnfldCheck, setExhManCheck] = useState(false);
  const [oilPumpCheck, setOilPumpCheck] = useState(false);
  const [waterPumpCheck, setWaterPumpCheck] = useState(false);

  const [customerEngineData, setCustomerEngineData] = useState<CustomerEngineData | null>(null);
  const [mwdEngine, setMwdEngine] = useState<Engine | null>(null);
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params: any = Object.fromEntries(urlSearchParams.entries());
  const [searchData, setSearchData] = useState<CompareConsist[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      if (params.c) {
        const res = await getCustomerById(params.c);
        setCustomer(res);
        setCompany(res.company);
      } else {
        setCustomer(null);
      }
      if (params.r) {
        const res = await getCompareDataById(params.r);
        loadCompareData(res);
      }
      if (customerData.length < 100) setCustomersData(await getCustomers());
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
      headNew: headCheck ? headNew : null,
      headCheck,
      blockNew: blockCheck ? blockNew : null,
      blockCheck,
      crankNew: crankCheck ? crankNew : null,
      crankCheck,
      pistonNew: pistonCheck ? pistonNew : null,
      pistonCheck,
      camNew: camCheck ? camNew : null,
      camCheck,
      injNew: injCheck ? injNew : null,
      injCheck,
      turboNew: turboCheck ? turboNew : null,
      turboCheck,
      fwhNew: fwhCheck ? fwhNew : null,
      fwhCheck,
      frontHsngNew: frontHsngCheck ? frontHsngNew : null,
      frontHsngCheck,
      oilPanNew: oilPanCheck ? oilPanNew : null,
      oilPanCheck,
      turboHpNew: turboHpCheck ? turboHpNew : null,
      turboHpCheck,
      turboLpNew: turboLpCheck ? turboLpNew : null,
      turboLpCheck,
      heuiPumpNew: heuiPumpCheck ? heuiPumpNew : null,
      heuiPumpCheck,
      exhMnfldNew: exhMnfldCheck ? exhMnfldNew : null,
      exhMnfldCheck,
      oilPumpNew: oilPumpCheck ? oilPumpNew : null,
      oilPumpCheck,
      waterPumpNew: waterPumpCheck ? waterPumpNew : null,
      waterPumpCheck,
      headReman: headCheck ? headReman : null,
      blockReman: blockCheck ? blockReman : null,
      crankReman: crankCheck ? crankReman : null,
      pistonReman: pistonCheck ? pistonReman : null,
      camReman: camCheck ? camReman : null,
      injReman: injCheck ? injReman : null,
      turboReman: turboCheck ? turboReman : null,
      fwhReman: fwhCheck ? fwhReman : null,
      frontHsngReman: frontHsngCheck ? frontHsngReman : null,
      oilPanReman: oilPanCheck ? oilPanReman : null,
      turboHpReman: turboHpCheck ? turboHpReman : null,
      turboLpReman: turboLpCheck ? turboLpReman : null,
      heuiPumpReman: heuiPumpCheck ? heuiPumpReman : null,
      exhMnfldReman: exhMnfldCheck ? exhMnfldReman : null,
      oilPumpReman: oilPumpCheck ? oilPumpReman : null,
      waterPumpReman: waterPumpCheck ? waterPumpReman : null
    };
    return Object.fromEntries(Object.entries(data).map((d: any) => d[1] || d[0].includes('Check') ? d : [d[0], null])) as any;
  };

  const handleChangeCustomer = (value: string) => {
    setCompany(value);
    if (!value) {
      push('Compare Consist', '/compare-consist');
      return;
    }
    const id = customerData.find((c) => c.company === value)?.id;
    push('Compare Consist', `/compare-consist?c=${id}`);
  };

  const loadCompareData = (data: CompareConsist | null) => {
    setNewHead(data?.headNew || '');
    setNewBlock(data?.blockNew || '');
    setNewCrank(data?.crankNew || '');
    setNewPistons(data?.pistonNew || '');
    setNewCam(data?.camNew || '');
    setNewInjectors(data?.injNew || '');
    setNewSingleTurbo(data?.turboNew || '');
    setNewFWH(data?.fwhNew || '');
    setNewFrontHsng(data?.frontHsngNew || '');
    setNewOilPan(data?.oilPanNew || '');
    setNewHPTurbo(data?.turboHpNew || '');
    setNewLPTurbo(data?.turboLpNew || '');
    setNewHEUIPump(data?.heuiPumpNew || '');
    setNewExhMnfld(data?.exhMnfldNew || '');
    setNewOilPump(data?.oilPumpNew || '');
    setNewWtrPump(data?.waterPumpNew || '');

    setRemanHead(data?.headReman || '');
    setRemanBlock(data?.blockReman || '');
    setRemanCrank(data?.crankReman || '');
    setRemanPistons(data?.pistonReman || '');
    setRemanCam(data?.camReman || '');
    setRemanInjectors(data?.injReman || '');
    setRemanSingleTurbo(data?.turboReman || '');
    setRemanFWH(data?.fwhReman || '');
    setRemanFrontHsng(data?.frontHsngReman || '');
    setRemanOilPan(data?.oilPanReman || '');
    setRemanHPTurbo(data?.turboHpReman || '');
    setRemanLPTurbo(data?.turboLpReman || '');
    setRemanHEUIPump(data?.heuiPumpReman || '');
    setRemanExhMnfld(data?.exhMnfldReman || '');
    setRemanOilPump(data?.oilPumpReman || '');
    setRemanWtrPump(data?.waterPumpNew || '');

    setHeadCheck(data?.headCheck || false);
    setBlockCheck(data?.blockCheck || false);
    setCrankCheck(data?.crankCheck || false);
    setPistonsCheck(data?.pistonCheck || false);
    setCamCheck(data?.camCheck || false);
    setInjectorsCheck(data?.injCheck || false);
    setSingleTurboCheck(data?.turboCheck || false);
    setFwhCheck(data?.fwhCheck || false);
    setFrontHousingCheck(data?.frontHsngCheck || false);
    setOilPanCheck(data?.oilPanCheck || false);
    setHpTurboCheck(data?.turboHpCheck || false);
    setLpTurboCheck(data?.turboLpCheck || false);
    setHeuiPumpCheck(data?.heuiPumpCheck || false);
    setExhManCheck(data?.exhMnfldCheck || false);
    setOilPumpCheck(data?.oilPumpCheck || false);
    setWaterPumpCheck(data?.waterPumpCheck || false);
  };

  const handleSearch = async () => {
    const res = await searchCompareData(customer?.id ?? 0, serialNum, arrNum);
    setSearchData(res);
    if (res[0]) {
      loadCompareData(res[0]);
    } else {
      loadCompareData(null);
    }
  };


  return (
    <Layout title="Compare">
      <div className="compare-consist">
        {!mwdEngine ?
          <>
            <div className="compare-consist__top-bar">
              <CustomerDropdown
                label="Customer"
                variant={['label-stack', 'label-bold']}
                value={company}
                onChange={(value: any) => handleChangeCustomer(value)}
                maxHeight="15rem"
              />
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
              <Button variant={['fit']} onClick={handleSearch}>Search</Button>
              <Button variant={['fit']} onClick={() => location.reload()}>Reset Search</Button>
              { searchData.length > 0 && <h3>{ searchData.length } search results { customer ? ` For ${customer.company}` : ' For all customers' }</h3> }
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
                        value={headNew}
                        onChange={(e: any) => setNewHead(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={blockNew}
                        onChange={(e: any) => setNewBlock(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={crankNew}
                        onChange={(e: any) => setNewCrank(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={pistonNew}
                        onChange={(e: any) => setNewPistons(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={camNew}
                        onChange={(e: any) => setNewCam(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={injNew}
                        onChange={(e: any) => setNewInjectors(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'no-style']}
                        value={turboNew}
                        onChange={(e: any) => setNewSingleTurbo(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={fwhNew}
                        onChange={(e: any) => setNewFWH(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={frontHsngNew}
                        onChange={(e: any) => setNewFrontHsng(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={oilPanNew}
                        onChange={(e: any) => setNewOilPan(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={turboHpNew}
                        onChange={(e: any) => setNewHPTurbo(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={turboLpNew}
                        onChange={(e: any) => setNewLPTurbo(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={heuiPumpNew}
                        onChange={(e: any) => setNewHEUIPump(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={exhMnfldNew}
                        onChange={(e: any) => setNewExhMnfld(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={oilPumpNew}
                        onChange={(e: any) => setNewOilPump(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={waterPumpNew}
                        onChange={(e: any) => setNewWtrPump(e.target.value)}
                      />
                    </td>
                  </tr>
  
                  <tr>
                    <td><p>Reman</p></td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={headReman}
                        onChange={(e: any) => setRemanHead(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={blockReman}
                        onChange={(e: any) => setRemanBlock(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={crankReman}
                        onChange={(e: any) => setRemanCrank(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={pistonReman}
                        onChange={(e: any) => setRemanPistons(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={camReman}
                        onChange={(e: any) => setRemanCam(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={injReman}
                        onChange={(e: any) => setRemanInjectors(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'no-style']}
                        value={turboReman}
                        onChange={(e: any) => setRemanSingleTurbo(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={fwhReman}
                        onChange={(e: any) => setRemanFWH(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={frontHsngReman}
                        onChange={(e: any) => setRemanFrontHsng(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={oilPanReman}
                        onChange={(e: any) => setRemanOilPan(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={turboHpReman}
                        onChange={(e: any) => setRemanHPTurbo(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={turboLpReman}
                        onChange={(e: any) => setRemanLPTurbo(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={heuiPumpReman}
                        onChange={(e: any) => setRemanHEUIPump(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={exhMnfldReman}
                        onChange={(e: any) => setRemanExhMnfld(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={oilPumpReman}
                        onChange={(e: any) => setRemanOilPump(e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        variant={['thin', 'x-small', 'no-style']}
                        value={waterPumpReman}
                        onChange={(e: any) => setRemanWtrPump(e.target.value)}
                      />
                    </td>
                  </tr>
  
                  <tr className="compare-consist__compare-section--no-border">
                    <td></td>
                    <td><Checkbox checked={headCheck} onChange={() => setHeadCheck(!headCheck)} /></td>
                    <td><Checkbox checked={blockCheck} onChange={() => setBlockCheck(!blockCheck)} /></td>
                    <td><Checkbox checked={crankCheck} onChange={() => setCrankCheck(!crankCheck)} /></td>
                    <td><Checkbox checked={pistonCheck} onChange={() => setPistonsCheck(!pistonCheck)} /></td>
                    <td><Checkbox checked={camCheck} onChange={() => setCamCheck(!camCheck)} /></td>
                    <td><Checkbox checked={injCheck} onChange={() => setInjectorsCheck(!injCheck)} /></td>
                    <td><Checkbox checked={turboCheck} onChange={() => setSingleTurboCheck(!turboCheck)} /></td>
                    <td><Checkbox checked={fwhCheck} onChange={() => setFwhCheck(!fwhCheck)} /></td>
                    <td><Checkbox checked={frontHsngCheck} onChange={() => setFrontHousingCheck(!frontHsngCheck)} /></td>
                    <td><Checkbox checked={oilPanCheck} onChange={() => setOilPanCheck(!oilPanCheck)} /></td>
                    <td><Checkbox checked={turboHpCheck} onChange={() => setHpTurboCheck(!turboHpCheck)} /></td>
                    <td><Checkbox checked={turboLpCheck} onChange={() => setLpTurboCheck(!turboLpCheck)} /></td>
                    <td><Checkbox checked={heuiPumpCheck} onChange={() => setHeuiPumpCheck(!heuiPumpCheck)} /></td>
                    <td><Checkbox checked={exhMnfldCheck} onChange={() => setExhManCheck(!exhMnfldCheck)} /></td>
                    <td><Checkbox checked={oilPumpCheck} onChange={() => setOilPumpCheck(!oilPumpCheck)} /></td>
                    <td><Checkbox checked={waterPumpCheck} onChange={() => setWaterPumpCheck(!waterPumpCheck)} /></td>
                  </tr>
                </tbody>
              </Table>
  
              <CompareEngineTable
                openSideBySide={openSideBySide}
                getEngineData={getEngineData}
                customerId={params.c}
              />
            </div>
          </>
          :
          <SideBySideTable customer={customer} customerEngineData={customerEngineData} mwdEngine={mwdEngine} setMwdEngine={setMwdEngine} />
        }
      </div>
    </Layout>
  );
}
