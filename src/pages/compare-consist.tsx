import { Layout } from "@/components/Layout";
import CompareEngineTable from "@/components/compareConsist/CompareEngineTable";
import SideBySideTable from "@/components/compareConsist/SideBySideTable";
import Checkbox from "@/components/library/Checkbox";
import Input from "@/components/library/Input";
import Table from "@/components/library/Table";
import Button from "@/components/library/Button";
import { customersAtom } from "@/scripts/atoms/state";
import { addCompareData, getCompareDataById, searchCompareData } from "@/scripts/services/compareConsistService";
import { getCustomerById, getCustomers } from "@/scripts/services/customerService";
import { useNavState } from "@/hooks/useNavState";
import { useAtom } from "jotai";
import { FormEvent, useCallback, useEffect, useState } from "react";
import CompareConsistHistoryDialog from "@/components/compareConsist/dialogs/CompareConsistHistoryDialog";
import CustomerSelect from "@/components/library/select/CustomerSelect";
import { useToast } from "@/hooks/useToast";


const ENGINE_PARTS = [
  'head',
  'block',
  'crank',
  'piston',
  'cam',
  'inj',
  'turbo',
  'fwh',
  'frontHsng',
  'oilPan',
  'turboHp',
  'turboLp',
  'heuiPump',
  'exhMnfld',
  'oilPump',
  'waterPump'
];

export default function CompareConsist() {
  const [customerData, setCustomersData] = useAtom<Customer[]>(customersAtom);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [company, setCompany] = useState('');
  const [serialNum, setSerialNum] = useState('');
  const [arrNum, setArrNum] = useState('');
  const [engineNew, setEngineNew] = useState<Record<string, string>>({});
  const [engineReman, setEngineReman] = useState<Record<string, string>>({});
  const [engineChecks, setEngineChecks] = useState<Record<string, boolean>>({});
  const [engineData, setEngineData] = useState<CustomerEngineData | null>(null);
  const [customerEngineData, setCustomerEngineData] = useState<CustomerEngineData | null>(null);
  const [mwdEngine, setMwdEngine] = useState<Engine | null>(null);
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params: any = Object.fromEntries(urlSearchParams.entries());
  const [searchData, setSearchData] = useState<CompareConsist[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const { push } = useNavState();
  const toast = useToast();

  useEffect(() => {
    setEngineData(getEngineData());
  }, []);

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
  }, [params.c, params.r]);

  const openSideBySide = (engine: Engine) => {
    setCustomerEngineData(getEngineData());
    setMwdEngine(engine);
  };

  const getEngineData = useCallback((noChecks = false) => {
    const data: any = {
      serialNum,
      arrNum
    };

    ENGINE_PARTS.forEach((part) => {
      data[`${part}New`] = (engineChecks[part] || noChecks) ? engineNew[part] || null : null;
      data[`${part}Reman`] = (engineChecks[part] || noChecks) ? engineReman[part] || null : null;
      data[`${part}Check`] = !!engineChecks[part];
    });
    return data;
  }, [serialNum, arrNum, engineNew, engineReman, engineChecks]);

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
    const newVals: Record<string, string> = {};
    const remanVals: Record<string, string> = {};
    const checkVals: Record<string, boolean> = {};

    ENGINE_PARTS.forEach((part: string) => {
      newVals[part] = (data?.[`${part}New` as keyof CompareConsist] as string) || '';
      remanVals[part] = (data?.[`${part}Reman` as keyof CompareConsist] as string) || '';
      checkVals[part] = (data?.[`${part}Check` as keyof CompareConsist] as boolean) || false;
    });

    setSerialNum(data?.serialNum ?? '');
    setArrNum(data?.arrNum ?? '');
    setEngineNew(newVals);
    setEngineReman(remanVals);
    setEngineChecks(checkVals);
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    const res = await searchCompareData(customer?.id ?? 0, serialNum, arrNum);
    setSearchData(res);
    if (res.length > 0) {
      setShowSearchHistory(true);
    } else {
      toast.sendToast('No results', 'warning', 1500);
    }
  };

  const handleResetSearch = () => {
    setSearchData([]);
    setShowSearchHistory(false);
    setEngineNew({});
    setEngineReman({});
    setEngineChecks({});
    setCustomer(null);
    setSerialNum('');
    setArrNum('');
  };

  const handleSaveSearch = async () => {
    const data = {
      customerId: params.c,
      hp: '',
      model: '',
      notes: '',
      dateCreated: new Date(),
      ...getEngineData(true)
    } as CompareConsist;
    await addCompareData(data);
    toast.sendToast('Saved search', 'success');
  };


  return (
    <Layout title="Compare">
      <div className="compare-consist">
        {!mwdEngine ? (
          <>
            <CompareConsistHistoryDialog
              open={showSearchHistory}
              setOpen={setShowSearchHistory}
              searchData={searchData}
              setSearchData={setSearchData}
            />

            <form onSubmit={handleSearch} className="compare-consist__top-bar">
              <CustomerSelect
                label="Customer"
                variant={['label-stack', 'label-bold']}
                value={company}
                onChange={(e) => handleChangeCustomer(e.target.value)}
              />
              <Button onClick={() => handleChangeCustomer('')}>Clear Customer</Button>
              <Input
                label="Serial Number"
                variant={['label-stack', 'label-no-margin', 'thin', 'label-bold']}
                value={serialNum}
                onChange={(e) => setSerialNum(e.target.value)}
              />
              <Input
                label="Arrangement Number"
                variant={['label-stack', 'label-no-margin', 'thin', 'label-bold']}
                value={arrNum}
                onChange={(e) => setArrNum(e.target.value)}
              />

              <Button variant={['fit']} type="submit">Search</Button>
              <Button variant={['fit']} onClick={handleResetSearch}>Reset Search</Button>
              <Button variant={['fit']} onClick={handleSaveSearch}>Save Search</Button>
            </form>

            <div className="compare-consist__compare-section">
              <Table variant={['plain']}>
                <thead>
                  <tr>
                    <th></th>
                    {ENGINE_PARTS.map((part) => (
                      <th key={part}>{ part }</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><p>New</p></td>
                    {ENGINE_PARTS.map((part) => (
                      <td key={part}>
                        <Input
                          variant={['thin', 'x-small', 'no-style']}
                          value={engineNew[part] || ''}
                          onChange={(e) =>
                            setEngineNew((prev) => ({ ...prev, [part]: e.target.value }))
                          }
                        />
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td><p>Reman</p></td>
                    {ENGINE_PARTS.map((part) => (
                      <td key={part}>
                        <Input
                          variant={['thin', 'x-small', 'no-style']}
                          value={engineReman[part] || ''}
                          onChange={(e) =>
                            setEngineReman((prev) => ({ ...prev, [part]: e.target.value }))
                          }
                        />
                      </td>
                    ))}
                  </tr>

                  <tr className="compare-consist__compare-section--no-border">
                    <td></td>
                    {ENGINE_PARTS.map((part) => (
                      <td key={part}>
                        <Checkbox
                          checked={!!engineChecks[part]}
                          onChange={() =>
                            setEngineChecks((prev) => ({ ...prev, [part]: !prev[part] }))
                          }
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </Table>

              <div className="compare-consist__compare-btn-row">
                <Button onClick={() => setEngineData(getEngineData())}>Find Comparable Engines</Button>
                <Button>Search Arr Number Only</Button>
              </div>

              {engineData &&
                <CompareEngineTable
                  openSideBySide={openSideBySide}
                  engineData={engineData}
                />
              }
            </div>
          </>
        ) : (
          <SideBySideTable
            customer={customer}
            customerEngineData={customerEngineData}
            mwdEngine={mwdEngine}
            setMwdEngine={setMwdEngine}
          />
        )}
      </div>
    </Layout>
  );
}
