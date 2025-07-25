import Button from "@/components/Library/Button";
import CustomerSelectId from "@/components/Library/Select/CustomerSelectId";
import { useToast } from "@/hooks/useToast";
import { customerMerge } from "@/scripts/services/customerService";
import { FormEvent, useState } from "react";


export default function CustomerMergeContainer() {
  const toast = useToast();
  const [badId, setBadId] = useState<number | null>(null);
  const [goodId, setGoodId] = useState<number | null>(null);

  const handleMerge = async (e: FormEvent) => {
    e.preventDefault();
    if (!badId || !goodId) {
      alert('Select customer');
      return;
    }
    await customerMerge(badId, goodId);
    toast.sendToast('Customer merged', 'success');
  };


  return (
    <div className="customer-merge">
      <h1>Customer Merge</h1>
      
      <form className="customer-merge-form" onSubmit={handleMerge}>
        <CustomerSelectId
          variant={['label-bold', 'label-stack']}
          label="Customer to Destroy"
          value={badId?.toString()}
          onChange={(e: any) => setBadId(e.target.value)}
        />
        <CustomerSelectId
          variant={['label-bold', 'label-stack']}
          label="Customer to Keep"
          value={goodId?.toString()}
          onChange={(e: any) => setGoodId(e.target.value)}
        />
        <Button variant={['fit']} type="submit">Merge</Button>
      </form>
    </div>
  );
}
