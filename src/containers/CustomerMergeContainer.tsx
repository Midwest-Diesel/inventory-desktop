import Button from "@/components/Library/Button";
import CustomerDropdownId from "@/components/Library/Dropdown/CustomerDropdownId";
import CustomerSelectId from "@/components/Library/Select/CustomerSelectId";
import { useToast } from "@/hooks/useToast";
import { customerMerge } from "@/scripts/services/customerService";
import { FormEvent, useState } from "react";


export default function CustomerMergeContainer() {
  const toast = useToast();
  const [badId, setBadId] = useState(0);
  const [goodId, setGoodId] = useState(0);

  const handleMerge = async (e: FormEvent) => {
    e.preventDefault();
    if (badId === 0 || goodId === 0) {
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
  );
}
