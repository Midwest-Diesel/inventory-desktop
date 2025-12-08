import NavDropdown from "../library/dropdown/NavDropdown";
import Link from "../library/Link";

interface Props {
  user: User
}


export default function OfficeNavbar({ user }: Props) {
  return (
    <>
      <Link className="navbar__title" href="/">
        <img src="/images/icons/home-icon.svg" alt="home button" width={10} height={10} />
      </Link>
      <Link href="/handwrittens" className="navbar__link">Handwrittens</Link>
      <NavDropdown label="Engines">
        <Link href="/engines/engine-list">Engine List</Link>
        <Link href="/engines/new-engine">New Engines</Link>
      </NavDropdown>
      <Link href="/returns" className="navbar__link">Returns</Link>
      <Link href="/warranties" className="navbar__link">Warranties</Link>
      <Link href="/cores" className="navbar__link">Cores</Link>
      <Link href="/surplus" className="navbar__link">Surplus Purchases</Link>
      <Link href="/purchase-orders" className="navbar__link">Purchase Orders</Link>
      <NavDropdown label="Add Ons">
        <Link href="/add-ons/office/part">Office Parts</Link>
        <Link href="/add-ons/office/engine">Office Engines</Link>
        {user.accessLevel >= 3 &&
          <>
            <Link href="/add-ons/shop/part">Shop Parts</Link>
            <Link href="/add-ons/shop/engine">Shop Engines</Link>
          </>
        }
      </NavDropdown>
      <Link href="/karmak" className="navbar__link">Accounting</Link>
      <Link href="/email-stuff" className="navbar__link">Email Stuff</Link>
      <NavDropdown label="Tools">
        <Link href="/reports">Reports</Link>
        <Link href="/image-upload" className="navbar__link">Image Upload</Link>
        <Link href="/customer-merge" className="navbar__link">Customer Merge</Link>
        <Link href="/performance" className="navbar__link">Performance</Link>
      </NavDropdown>
      <Link href="/alerts" className="navbar__link">Alerts</Link>
      <Link href="/map" className="navbar__link">Map</Link>
      <Link href="/system" className="navbar__link">System</Link>
    </>
  );
}
