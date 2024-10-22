import Image from "next/image";
import NavDropdown from "./Library/Dropdown/NavDropdown";


export default function Navbar() {
  return (
    <nav className="navbar">
      <a className="navbar__title" href="/">
        <Image src="/images/icons/home-icon.svg" alt="home button" width={10} height={10} />
      </a>
      <a href="/handwrittens" className="navbar__link">Handwrittens</a>
      <NavDropdown label="Engines">
        <a href="/engines/running">Running</a>
        <a href="/engines/torn-down">Torn Down</a>
        <a href="/engines/core">Core Engines</a>
        <a href="/engines/sold">Sold Engines</a>
        <a href="/engines/new-engine">New Engines</a>
      </NavDropdown>
      <a href="/returns" className="navbar__link">Returns</a>
      <a href="/warranties" className="navbar__link">Warranties</a>
      <a href="/cores" className="navbar__link">Cores</a>
      <a href="/surplus" className="navbar__link">Surplus Purchases</a>
      <a href="/purchase-orders" className="navbar__link">Purchase Orders</a>
      <NavDropdown label="Add Ons">
        <a href="/add-ons/shop">Shop</a>
        <a href="/add-ons/office">Office</a>
        <a href="/add-ons/engine">Engine</a>
      </NavDropdown>
      <a href="/performance" className="navbar__link">Performance</a>
      <a href="/karmak" className="navbar__link">Karmak</a>
      <a href="/reports" className="navbar__link">Reports</a>
      <a href="/email-stuff" className="navbar__link">Email Stuff</a>
      <a href="/alerts" className="navbar__link">Alerts</a>
      <a href="/image-upload" className="navbar__link">Image Upload</a>
    </nav>
  );
}
