import NavDropdown from "../Library/Dropdown/NavDropdown";
import Link from "../Library/Link";

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
        <Link href="/engines/running">Running</Link>
        <Link href="/engines/torn-down">Torn Down</Link>
        <Link href="/engines/core">Core Engines</Link>
        <Link href="/engines/sold">Sold Engines</Link>
        <Link href="/engines/new-engine">New Engines</Link>
      </NavDropdown>
      <Link href="/returns" className="navbar__link">Returns</Link>
      <Link href="/warranties" className="navbar__link">Warranties</Link>
      <Link href="/cores" className="navbar__link">Cores</Link>
      <Link href="/surplus" className="navbar__link">Surplus Purchases</Link>
      <Link href="/purchase-orders" className="navbar__link">Purchase Orders</Link>
      <NavDropdown label="Add Ons">
        <Link href="/add-ons/office/part">Office Part</Link>
        <Link href="/add-ons/office/engine">Office Engine</Link>
        {user.accessLevel >= 3 &&
          <>
            <Link href="/add-ons/shop/part">Shop Part</Link>
            <Link href="/add-ons/shop/engine">Shop Engine</Link>
          </>
        }
      </NavDropdown>
      <Link href="/karmak" className="navbar__link">Accounting</Link>
      <Link href="/email-stuff" className="navbar__link">Email Stuff</Link>
      <NavDropdown label="Tools">
        <Link href="/reports">Reports</Link>
        <Link href="/performance" className="navbar__link">Performance</Link>
        <Link href="/image-upload" className="navbar__link">Image Upload</Link>
      </NavDropdown>
      <Link href="/alerts" className="navbar__link">Alerts</Link>
      <Link href="/map" className="navbar__link">Map</Link>
      <Link href="/about" className="navbar__link">About</Link>
    </>
  );
}
