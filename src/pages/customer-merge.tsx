import { Layout } from "@/components/Layout";
import Button from "@/components/library/Button";
import CustomerDropdownId from "@/components/library/dropdown/CustomerDropdownId";
import { useToast } from "@/hooks/useToast";
import { customerMerge } from "@/scripts/services/customerService";
import { FormEvent, useState } from "react";


export default function CustomerMerge() {
  const toast = useToast();
  const [badId, setBadId] = useState(0);
  const [goodId, setGoodId] = useState(0);

  const handleMerge = async (e: FormEvent) => {
    e.preventDefault();
    if (badId === 0 || goodId === 0) {
      return alert('Select customer');
    }
    if (badId === goodId) {
      return alert('Cannot select the same customer twice');
    }

    await customerMerge(badId, goodId);
    toast.sendToast('Customer merged', 'success');
    setBadId(0);
    setGoodId(0);
  };


  return (
    <Layout title="Customer Merge">
      <div className="customer-merge">
        <h1>Customer Merge</h1>
        
        <form className="customer-merge-form" onSubmit={handleMerge}>
          <CustomerDropdownId
            variant={['label-bold', 'label-stack']}
            label="Customer to Destroy"
            value={badId?.toString()}
            onChange={(id: number) => setBadId(id)}
          />
          <CustomerDropdownId
            variant={['label-bold', 'label-stack']}
            label="Customer to Keep"
            value={goodId?.toString()}
            onChange={(id: number) => setGoodId(id)}
          />
          <Button variant={['fit']} type="submit">Merge</Button>
        </form>
      </div>
    </Layout>
  );
}
