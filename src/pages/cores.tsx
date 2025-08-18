import CoreSearchDialog, { CoreSearch } from "@/components/Dialogs/CoreSearchDialog";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Link from "@/components/Library/Link";
import Loading from "@/components/Library/Loading";
import Table from "@/components/Library/Table";
import { getAllCores, searchCores } from "@/scripts/services/coresService";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";


export default function Cores() {
  const [isCoreSearchOpen, setIsOpenCoreSearchOpen] = useState(false);
  const [searchData, setSearchData] = useState<CoreSearch | null>(null);

  const { data: cores = [], isFetching } = useQuery<Core[]>({
    queryKey: ['cores', searchData],
    queryFn: async () => {
      if (searchData) {
        return await searchCores(searchData);
      } else {
        return await getAllCores();
      }
    },
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });

  const onSearch = (search: CoreSearch) => {
    setSearchData(search);
  };


  return (
    <Layout title="Cores">
      <CoreSearchDialog open={isCoreSearchOpen} setOpen={setIsOpenCoreSearchOpen} cores={cores} onSearch={onSearch} />

      <div className="cores-page">
        <h1>Cores</h1>
        <div className="cores-page__top-bar">
          <Button onClick={() => setIsOpenCoreSearchOpen(true)}>Search</Button>
        </div>

        { isFetching && <Loading /> }

        <div className="cores-page__table-container">
          <Table>
            <thead>
              <tr>
                <th>Handwritten</th>
                <th>Date</th>
                <th>Bill to Company</th>
                <th>Ship to Company</th>
                <th>Part Number</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Charge</th>
                <th>Priority</th>
                <th>Salesperson</th>
              </tr>
            </thead>
            <tbody>
              {cores.map((core: Core) => {
                const part = core.part;
                return (
                  <tr key={core.id}>
                    <td><Link href={`/handwrittens/${core.handwrittenId}`}>{ core.handwrittenId }</Link></td>
                    <td>{ formatDate(core.date) }</td>
                    <td>{ core.billToCompany }</td>
                    <td>{ core.shipToCompany }</td>
                    <td data-testid="part-num">{ part ? <Link href={`/part/${part.id}`}>{ part.partNum }</Link> : core.partNum }</td>
                    <td>{ part ? part.desc : core.desc }</td>
                    <td>{ core.qty }</td>
                    <td>{ formatCurrency(core.charge) }</td>
                    <td>{ core.priority }</td>
                    <td>{ core.initials }</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
