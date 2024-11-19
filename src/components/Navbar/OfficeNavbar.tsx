import Image from "next/image";
import NavDropdown from "../Library/Dropdown/NavDropdown";
import Link from 'next/link';
import Button from "../Library/Button";


export default function OfficeNavbar() {
  return (
    <>
      <Link className="navbar__title" href="/">
        <Image src="/images/icons/home-icon.svg" alt="home button" width={10} height={10} />
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
        <Link href="/add-ons/shop">Shop</Link>
        <Link href="/add-ons/office">Office</Link>
        <Link href="/add-ons/engine">Engine</Link>
      </NavDropdown>
      <Link href="/email-stuff" className="navbar__link">Email Stuff</Link>
      <Link href="/performance" className="navbar__link">Performance</Link>
      <Link href="/karmak" className="navbar__link">Karmak</Link>
      <Link href="/reports" className="navbar__link">Reports</Link>
      <Link href="/alerts" className="navbar__link">Alerts</Link>
      <Link href="/image-upload" className="navbar__link">Image Upload</Link>
      <Link href="/map" className="navbar__link">Map</Link>
      <Link href="/about" className="navbar__link">About</Link>

      <div className="nav-buttons">
        <Button onClick={() => window.history.back()}>&lt;</Button>
        <Button onClick={() => window.history.forward()}>&gt;</Button>
      </div>
    </>
  );
}
