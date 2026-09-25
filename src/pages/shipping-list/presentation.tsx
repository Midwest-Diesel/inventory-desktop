import Button from "@/components/library/Button";
import Link from "@/components/library/Link";
import ShippingListTable from "@/components/shippingList/ShippingListTable";
import { getShippingList } from "@/scripts/services/shippingListService";
import { formatDate, getDay, parseResDate } from "@/scripts/tools/stringUtils";
import { useQuery } from "@tanstack/react-query";


export default function Presentation() {
  const params = new URLSearchParams(window.location.search);
  const date = parseResDate(params.get('date') ?? '') ?? new Date();

  const { data: sections = [] } = useQuery<ShippingListSection[]>({
    queryKey: ['sections', date],
    queryFn: () => getShippingList(date)
  });


  return (
    <div className="shipping-list shipping-list-presentation">
      <h2 style={{ margin: '0.5rem 0 0.3rem', textAlign: 'center' }}>
        Shipping List ({ getDay(date) } { formatDate(date) })
      </h2>
      
      <Button variant={['link', 'red-color']} className="shipping-list-presentation__close-btn">
        <Link href="/shipping-list" tabName="Shipping List">
          X
        </Link>
      </Button>

      <ShippingListTable sections={sections} />
    </div>
  );
}
