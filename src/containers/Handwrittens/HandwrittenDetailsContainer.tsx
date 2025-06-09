import AddQtyDialog from "@/components/Dialogs/handwrittens/AddQtyDialog";
import EditHandwrittenDetails from "@/components/Handwrittens/EditHandwrittenDetails";
import HandwrittenDetails from "@/components/Handwrittens/HandwrittenDetails";
import Toast from "@/components/Library/Toast";
import { useNavState } from "@/components/Navbar/useNavState";
import { confirm } from "@/scripts/config/tauri";
import { addAltShipAddress, getAltShipByCustomerId } from "@/scripts/services/altShipService";
import { getHandwrittenById } from "@/scripts/services/handwrittensService";
import { setTitle } from "@/scripts/tools/utils";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


export default function HandwrittenDetailsContainer() {
  const params = useParams();
  const router = useRouter();
  const { push } = useNavState();
  const [handwritten, setHandwritten] = useState<Handwritten | null>(null);
  const [cardNum, setCardNum] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardZip, setCardZip] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardAddress, setCardAddress] = useState('');
  const [payment, setPayment] = useState('');
  const [promptLeaveWindow, setPromptLeaveWindow] = useState(false);
  const [addQtyDialogOpen, setAddQtyDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [msg, setToastMsg] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!params) return;
      const res = await getHandwrittenById(Number(params.handwritten));
      setTitle(`${res?.id} Handwritten`);
      setHandwritten(res);
      if (res?.invoiceStatus === 'INVOICE PENDING') {
        setIsEditing(true);
      }

      const itemsWithChildren = res?.handwrittenItems.filter((item) => item.invoiceItemChildren && item.invoiceItemChildren.length > 0) ?? [];
      itemsWithChildren.forEach((item) => {
        const res = item.invoiceItemChildren.find((child) => child.cost === 0.04);
        if (res) {
          setToastMsg(`Cost still detected on item <span style="color: var(--orange-1)">${res.partNum}</span>!`);
          setToastOpen(true);
        }
      });
    };
    fetchData();
  }, [params]);

  useEffect(() => {
    const fetchData = async () => {
      if (!handwritten) return;
      const res = await getHandwrittenById(Number(params.handwritten));
      setHandwritten(res);
    };
    fetchData();
  }, [isEditing]);

  useEffect(() => {
    const handleRouteChangeStart = async (url: string) => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      if (!promptLeaveWindow) {
        router.push(url);
        return;
      }
      router.replace(location.href);
      const exit = await confirm("Leave the page before printing the credit card label?");
      if (exit) {
        await push(url, url);
      }
    };
    
    router.events.on('routeChangeStart', handleRouteChangeStart);  
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [promptLeaveWindow]);

  useEffect(() => {
    if (!promptLeaveWindow) return;
    function confirmLeave(e: any) {
      e.preventDefault();
      e.returnValue = '';
    }

    window.addEventListener('beforeunload', confirmLeave);
    return () => {
      window.removeEventListener('beforeunload', confirmLeave);
    };
  }, [promptLeaveWindow]);

  const handleAltShip = async () => {
    if (!handwritten) return;
    const altShip = await getAltShipByCustomerId(handwritten.customer.id);
    if (altShip.some((a: AltShip) => (
      a.shipToAddress === handwritten.shipToAddress &&
      a.shipToAddress2 === handwritten.shipToAddress2 &&
      a.shipToCity === handwritten.shipToCity &&
      a.shipToState === handwritten.shipToState &&
      a.shipToZip === handwritten.shipToZip &&
      a.shipToCompany === handwritten.shipToCompany
    ))) return;
    await addAltShipAddress({
      customerId: handwritten.customer.id,
      shipToAddress: handwritten.shipToAddress ?? '',
      shipToAddress2: handwritten.shipToAddress2 ?? '',
      shipToCity: handwritten.shipToCity ?? '',
      shipToState: handwritten.shipToState ?? '',
      shipToZip: handwritten.shipToZip ?? '',
      shipToCompany: handwritten.shipToCompany ?? ''
    } as AltShip);
  };


  return (
    <div>
      <Toast msg={msg} type="error" open={toastOpen} setOpen={setToastOpen} duration={6000} />

      {handwritten &&
        <AddQtyDialog
          open={addQtyDialogOpen}
          setOpen={setAddQtyDialogOpen}
          handwritten={handwritten}
          setHandwritten={setHandwritten}
          setIsEditing={setIsEditing}
        />
      }

      {handwritten && !isEditing &&
        <HandwrittenDetails
          handwritten={handwritten}
          setHandwritten={setHandwritten}
          handleAltShip={handleAltShip}
          setIsEditing={setIsEditing}
          setPromptLeaveWindow={setPromptLeaveWindow}
          cardNum={cardNum}
          expDate={expDate}
          cvv={cvv}
          cardZip={cardZip}
          cardName={cardName}
          cardAddress={cardAddress}
          payment={payment}
          setPayment={setPayment}
          setCardNum={setCardNum}
          setExpDate={setExpDate}
          setCvv={setCvv}
          setCardZip={setCardZip}
          setCardName={setCardName}
          setCardAddress={setCardAddress}
          setAddQtyDialogOpen={setAddQtyDialogOpen}
        />
      }

      {handwritten && isEditing &&
        <EditHandwrittenDetails
          handwritten={handwritten}
          setHandwritten={setHandwritten}
          handleAltShip={handleAltShip}
          setIsEditing={setIsEditing}
          setPromptLeaveWindow={setPromptLeaveWindow}
          cardNum={cardNum}
          expDate={expDate}
          cvv={cvv}
          cardZip={cardZip}
          cardName={cardName}
          cardAddress={cardAddress}
          payment={payment}
          setPayment={setPayment}
          setCardNum={setCardNum}
          setExpDate={setExpDate}
          setCvv={setCvv}
          setCardZip={setCardZip}
          setCardName={setCardName}
          setCardAddress={setCardAddress}
          setAddQtyDialogOpen={setAddQtyDialogOpen}
        />
      }
    </div>
  );
}
