import AddQtyDialog from "@/components/Dialogs/handwrittens/AddQtyDialog";
import EditHandwrittenDetails from "@/components/Handwrittens/EditHandwrittenDetails";
import HandwrittenDetails from "@/components/Handwrittens/HandwrittenDetails";
import { useToast } from "@/hooks/useToast";
import { addAltShipAddress, getAltShipByCustomerId } from "@/scripts/services/altShipService";
import { getHandwrittenById } from "@/scripts/services/handwrittensService";
import { setTitle } from "@/scripts/tools/utils";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { PreventNavigation } from "@/components/PreventNavigation";
import Loading from "@/components/Library/Loading";
import { useNavState } from "@/hooks/useNavState";


export default function HandwrittenDetailsContainer() {
  const params = useParams();
  const toast = useToast();
  const { tabs } = useNavState();
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const tab = tabs.find((t) => t.selected);
      if (!params || tab?.history[tab.history.length - 1].url !== `/handwrittens/${params.handwritten}`) return;
      setLoading(true);
      const res = await getHandwrittenById(Number(params.handwritten));
      setTitle(`${res?.id} Handwritten`);
      setHandwritten(res);
      setPayment(res?.payment ?? '');
      if (res?.invoiceStatus === 'INVOICE PENDING') setIsEditing(true);

      const itemsWithChildren = res?.handwrittenItems.filter((item) => item.invoiceItemChildren && item.invoiceItemChildren.length > 0) ?? [];
      itemsWithChildren.forEach((item) => {
        const res = item.invoiceItemChildren.find((child) => child.cost === 0.04);
        if (res) {
          toast.sendToast(`Cost still detected on item <span style="color: var(--orange-1)">${res.partNum}</span>!`, 'error', 6000);
        }
      });
      setLoading(false);
    };
    fetchData();
  }, [params, tabs]);

  useEffect(() => {
    const fetchData = async () => {
      if (!handwritten) return;
      const res = await getHandwrittenById(Number(params.handwritten));
      setHandwritten(res);
    };
    fetchData();
  }, [isEditing]);

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
    <>
      {loading ?
        <Loading />
        :
        <div>
          <PreventNavigation shouldPrevent={promptLeaveWindow} text="Leave without printing credit card?" />

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
      }
    </>
  );
}
