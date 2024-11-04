import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Table from "@/components/Library/Table";
import { getShippingList } from "@/scripts/controllers/shippingListController";
import { formatDate } from "@/scripts/tools/stringUtils";
import { useEffect, useState } from "react";


export default function ShippingList() {
  const [shippingList, setShippingList] = useState<ShippingList[]>([]);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const date = new Date();

  useEffect(() => {
    const fetchData = async () => {
      const res = await getShippingList();
      setShippingList(res);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    
  };


  return (
    <Layout title="Shipping List">
      <div className="shipping-list">
        <div className="shipping-list__header">
          <h2>Shipping List: { days[date.getDay() - 1] } { formatDate(date) }</h2>
          <div className="header__btn-container">
            <Button
              variant={['save']}
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>

        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Initials</th>
              <th>Ship Via</th>
              <th>Customer</th>
              <th>Attn To</th>
              <th>Part Number</th>
              <th>Desc</th>
              <th>Stock Number</th>
              <th>Location</th>
              <th>MP</th>
              <th>BR</th>
              <th>CAP</th>
              <th>FL</th>
              <th>Pulled</th>
              <th>Packaged</th>
              <th>Gone</th>
              <th>Ready</th>
              <th>Weight</th>
              <th>Dims</th>
            </tr>
          </thead>
          <tbody>
            {shippingList.map((row, i) => {
              return (
                <tr key={row.id}>
                  <td>{ row.handwrittenId }</td>
                  <td>{ row.initials }</td>
                  <td>{ row.shipVia }</td>
                  <td>{ row.customer }</td>
                  <td>{ row.attnTo }</td>
                  <td>{ row.partNum }</td>
                  <td>{ row.desc }</td>
                  <td>{ row.stockNum }</td>
                  <td>{ row.location }</td>
                  <td>{ row.mp }</td>
                  <td>{ row.br }</td>
                  <td>{ row.cap }</td>
                  <td>{ row.fl }</td>
                  <td>{ row.pulled }</td>
                  <td>{ row.packaged }</td>
                  <td>{ row.gone }</td>
                  <td>{ row.ready }</td>
                  <td>{ row.weight }</td>
                  <td>{ row.dims }</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </Layout>
  );
}
