import { FormEvent, useState } from "react";
import CustomerSearchDialog from "../Dialogs/dashboard/CustomerSearchDialog";
import Button from "../Library/Button";
import Input from "../Library/Input";
import { addCustomer, getCustomerByName } from "@/scripts/services/customerService";
import { addHandwritten } from "@/scripts/services/handwrittensService";
import { isObjectNull } from "@/scripts/tools/utils";
import { useNavState } from "../Navbar/useNavState";
import { userAtom } from "@/scripts/atoms/state";
import { useAtom } from "jotai";
import Toast from "../Library/Toast";

interface Props {
  selectedCustomer: Customer
  setSelectedCustomer: (customer: Customer) => void
  expandedDetailsOpen: boolean
  setExpandedDetailsOpen: (value: boolean) => void
}


export default function CustomerSearch({ selectedCustomer, setSelectedCustomer, expandedDetailsOpen, setExpandedDetailsOpen }: Props) {
  const { push, newTab } = useNavState();
  const [user] = useAtom<User>(userAtom);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  const handleCustomerSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearchDialogOpen(true);
  };

  const handleAddCustomer = async () => {
    const name = prompt('Enter customer name');
    if (!name) return;
    await addCustomer(name);
    const res = await getCustomerByName(name);
    if (res) await push('customer', `/customer/${res.id}`);
  };

  const deselectCustomer = () => {
    localStorage.removeItem('customerId');
    setSelectedCustomer({} as Customer);
  };

  const handleNewHandwritten = async () => {
    const newHandwritten = {
      customer: selectedCustomer,
      date: new Date(),
      poNum: '',
      billToCompany: selectedCustomer.company,
      billToAddress: selectedCustomer.billToAddress,
      billToAddress2: selectedCustomer.billToAddress2,
      billToCity: selectedCustomer.billToCity,
      billToState: selectedCustomer.billToState,
      billToZip: selectedCustomer.billToZip,
      billToCountry: null,
      billToPhone: selectedCustomer.billToPhone,
      fax: '',
      shipToCompany: selectedCustomer.company,
      shipToAddress: selectedCustomer.shipToAddress,
      shipToAddress2: selectedCustomer.shipToAddress2,
      shipToCity: selectedCustomer.shipToCity,
      shipToState: selectedCustomer.shipToState,
      shipToZip: selectedCustomer.shipToZip,
      source: null,
      contactName: '',
      payment: selectedCustomer.paymentType,
      salesmanId: user.id,
      phone: '',
      cell: null,
      engineSerialNum: '',
      isBlindShipment: false,
      isNoPriceInvoice: false,
      isTaxable: selectedCustomer.isTaxable,
      shipVia: '',
      cardNum: '',
      expDate: '',
      cvv: null,
      cardZip: null,
      cardName: '',
      invoiceStatus: 'INVOICE PENDING',
      accountingStatus: '',
      shippingStatus: '',
    } as any;
    const handwrittenId = await addHandwritten(newHandwritten);
    await newTab([{ name: 'Handwritten', url: `/handwrittens/${handwrittenId}` }]);
    setToastOpen(true);
  };
  
    
  return (
    <div style={{ display: 'flex' }}>
      <h2 className="no-select">Customer Search</h2>

      <div className="customer-search__buttons">
        { isObjectNull(selectedCustomer) && <Button variant={['x-small']} onClick={handleAddCustomer}>Add Customer</Button> }
        {!isObjectNull(selectedCustomer) &&
          <>
            <Button variant={['x-small']} onClick={handleAddCustomer}>Add Customer</Button>
            <Button variant={['x-small']} onClick={deselectCustomer} data-testid="unselect">Unselect</Button>
            <Button
              variant={['x-small']}
              onClick={() => setExpandedDetailsOpen(!expandedDetailsOpen)}
              data-testid="expand"
            >
              { expandedDetailsOpen ? 'Collapse' : 'Expand' }
            </Button>
            <Button variant={['x-small']} onClick={handleNewHandwritten}>New Handwritten</Button>
          </>
        }
      </div>

      <form onSubmit={(e) => handleCustomerSearch(e)}>
        <Input
          style={{ margin: 0 }}
          variant={['search', 'label-space-between']}
          onChange={(e: any) => setSearchTerm(e.target.value)}
          value={searchTerm}
          data-testid="customer-input"
        >
          <Button variant={['search']} style={{ height: '2.1rem' }} data-testid="customer-search">Search</Button>
        </Input>
      </form>

      <Toast msg="Created handwritten" type="success" open={toastOpen} setOpen={setToastOpen} />
      <CustomerSearchDialog open={searchDialogOpen} setOpen={setSearchDialogOpen} searchTerm={searchTerm} />
    </div>
  );
}
