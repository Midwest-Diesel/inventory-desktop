import NewSurplusPartDialog from "@/components/Dialogs/NewSurplusPartDialog";
import RemainingSurplusDialog from "@/components/Dialogs/RemainingSurplusDialog";
import SoldSurplusPartsDialog from "@/components/Dialogs/SoldSurplusPartsDialog";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Loading from "@/components/Library/Loading";
import Table from "@/components/Library/Table";
import { userAtom } from "@/scripts/atoms/state";
import { getAllSurplus } from "@/scripts/services/surplusService";
import { formatCurrency, formatDate } from "@/scripts/tools/stringUtils";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useState } from "react";


export default function Surplus() {
  const [user] = useAtom<User>(userAtom);
  const [soldPartsOpen, setSoldPartsOpen] = useState(false);
  const [soldPartsCode, setSoldPartsCode] = useState('');
  const [remainingPartsOpen, setRemainingPartsOpen] = useState(false);
  const [newSurplusOpen, setNewSurplusOpen] = useState(false);
  const [remainingPartsCode, setRemainingPartsCode] = useState('');

  const { data: surplus = [], isFetching, refetch } = useQuery<Surplus[]>({
    queryKey: ['surplus'],
    queryFn: getAllSurplus,
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });

  const getCostRemaining = (surplus: Surplus) => {
    return surplus.price - (surplus.costApplied ?? 0);
  };


  return (
    <Layout title="Surplus Purchases">
      <SoldSurplusPartsDialog open={soldPartsOpen} setOpen={setSoldPartsOpen} code={soldPartsCode} />
      <RemainingSurplusDialog open={remainingPartsOpen} setOpen={setRemainingPartsOpen} code={remainingPartsCode} />
      <NewSurplusPartDialog open={newSurplusOpen} setOpen={setNewSurplusOpen} refetch={refetch} />

      <h1>Surplus Purchases</h1>
      {user.type === 'office' &&
        <div className="surplus__top-bar">
          <Button onClick={() => setNewSurplusOpen(true)}>New Purchase</Button>
        </div>
      }

      { isFetching && <Loading /> }

      <div className="surplus__table">
        <Table>
          <thead>
            <tr>
              <th>Purchase Code</th>
              <th>Purchase Name</th>
              <th>Date</th>
              <th>Total Price</th>
              <th>Cost Applied</th>
              <th>Cost Remaining</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {surplus.map((s: Surplus) => {
              return (
                <tr key={s.id}>
                  <td>{ s.code }</td>
                  <td>{ s.name }</td>
                  <td>{ formatDate(s.date) }</td>
                  <td>{ formatCurrency(s.price) }</td>
                  <td>{ formatCurrency(s.costApplied) }</td>
                  <td style={{ padding: 0 }}>
                    <span className={`surplus__cost-color surplus__cost-color${getCostRemaining(s) > 0 ? '--red' : ''}`}></span>
                    { formatCurrency(getCostRemaining(s)) }
                  </td>
                  <td>
                    <Button
                      variant={['x-small']}
                      onClick={() => {
                        setSoldPartsOpen(true);
                        setSoldPartsCode(s.code);
                      }}
                    >
                      Sold Parts
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant={['x-small']}
                      onClick={() => {
                        setRemainingPartsOpen(true);
                        setRemainingPartsCode(s.code);
                      }}
                    >
                      Remaining
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </Layout>
  );
}
