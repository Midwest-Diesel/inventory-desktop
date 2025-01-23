import React, { useEffect, useState } from "react";
import Button from "./Library/Button";
import { addCustomerContact, deleteContact, editContact, editCustomer, getCustomerById } from "@/scripts/controllers/customerController";
import Input from "./Library/Input";
import { confirm } from "@tauri-apps/api/dialog";

interface Props {
  customer: Customer
  setCustomer: (customer: Customer) => void
}


export default function CustomerContactsBlock({ customer, setCustomer }: Props) {
  const [contactPage, setContactPage] = useState(0);
  const [contact, setContact] = useState<Contact>(customer.contacts[contactPage]);
  const [isEditing, setIsEditing] = useState(false);
  const [contactsData, setContactsData] = useState<Contact[]>(customer.contacts);
  
  useEffect(() => {
    setContact(customer.contacts[contactPage]);
  }, [contactPage, customer]);

  const handlePrevPage = () => {
    if (contactPage > 0) {
      setContactPage(contactPage - 1);
    } else {
      setContactPage(customer.contacts.length - 1);
    }
  };

  const handleNextPage = () => {
    if (contactPage < customer.contacts.length - 1) {
      setContactPage(contactPage + 1);
    } else {
      setContactPage(0);
    }
  };

  const handleSetContact = async () => {
    setContact(customer.contacts[contactPage]);
    const newCustomer = { ...customer, contact: customer.contacts[contactPage].name };
    setCustomer(newCustomer);
    await editCustomer(newCustomer);
  };

  const handleNewContact = async () => {
    const name = prompt('Enter a contact name');
    if (!name) return;
    await addCustomerContact(customer.id, name);
    location.reload();
  };

  const handleEditContact = async () => {
    for (const contact of contactsData) {
      await editContact(contact);
    }
    setIsEditing(false);
    setCustomer(await getCustomerById(customer.id));
  };

  const handleCancelEdit = () => {
    setContactsData(customer.contacts);
    setIsEditing(false);
  };

  const handleDeleteContact = async () => {
    if (!await confirm('Are you sure you want to delete this?')) return;
    await deleteContact(contactsData[contactPage].id);
    if (contactsData[contactPage].name === customer.contact) await editCustomer({ ...customer, contact: null });
    location.reload();
  };


  return (
    <div>
      <div className="contacts-block__header">
        <h3>Contacts</h3>
        <Button type="button" onClick={handleNewContact}>Add</Button>
        {!isEditing && <Button type="button" onClick={() => setIsEditing(true)} variant={['blue']}>Edit</Button>}
        {isEditing &&
          <>
            <Button type="button" onClick={handleEditContact} variant={['save']}>Save</Button>
            <Button type="button" onClick={handleCancelEdit} variant={['danger']}>Cancel</Button>
          </>
        }
      </div>

      <div className="contacts-block">
        <Button type="button" onClick={handleDeleteContact} variant={['danger']} style={{ marginBottom: '0.5rem' }}>Delete</Button>
        {isEditing ?
          <>
            <div className="contacts-block__row">
              <Input
                variant={['small', 'thin', 'label-full-width', 'label-space-between', 'label-bold']}
                label="Name"
                value={contactsData[contactPage].name}
                onChange={(e: any) => setContactsData(contactsData.map((c) => {
                  if (c.id === contactsData[contactPage].id) {
                    return { ...contactsData[contactPage], name: e.target.value };
                  }
                  return c;
                }))}
              />
            </div>
            <div className="contacts-block__row">
              <Input
                variant={['small', 'thin', 'label-full-width', 'label-space-between', 'label-bold']}
                label="Position"
                value={contactsData[contactPage].position}
                onChange={(e: any) => setContactsData(contactsData.map((c) => {
                  if (c.id === contactsData[contactPage].id) {
                    return { ...contactsData[contactPage], position: e.target.value };
                  }
                  return c;
                }))}
              />
            </div>
            <div className="contacts-block__row">
              <Input
                variant={['small', 'thin', 'label-full-width', 'label-space-between', 'label-bold']}
                label="Email"
                type="email"
                value={contactsData[contactPage].email}
                onChange={(e: any) => setContactsData(contactsData.map((c) => {
                  if (c.id === contactsData[contactPage].id) {
                    return { ...contactsData[contactPage], email: e.target.value };
                  }
                  return c;
                }))}
              />
            </div>
            <div className="contacts-block__row">
              <Input
                variant={['small', 'thin', 'label-full-width', 'label-space-between', 'label-bold']}
                label="Ext"
                type="number"
                value={contactsData[contactPage].ext}
                onChange={(e: any) => setContactsData(contactsData.map((c) => {
                  if (c.id === contactsData[contactPage].id) {
                    return { ...contactsData[contactPage], ext: e.target.value };
                  }
                  return c;
                }))}
              />
            </div>
            <div className="contacts-block__row">
              <Input
                variant={['small', 'thin', 'label-full-width', 'label-space-between', 'label-bold']}
                label="Notes"
                value={contactsData[contactPage].notes}
                onChange={(e: any) => setContactsData(contactsData.map((c) => {
                  if (c.id === contactsData[contactPage].id) {
                    return { ...contactsData[contactPage], notes: e.target.value };
                  }
                  return c;
                }))}
              />
            </div>
          </>
          :
          <>
            <div className="contacts-block__row">
              <p><strong>Name</strong></p>
              <p>{ contact.name }</p>
            </div>
            <div className="contacts-block__row">
              <p><strong>Position</strong></p>
              <p>{ contact.position }</p>
            </div>
            <div className="contacts-block__row">
              <p><strong>Email</strong></p>
              <p>{ contact.email }</p>
            </div>
            <div className="contacts-block__row">
              <p><strong>Ext</strong></p>
              <p>{ contact.ext }</p>
            </div>
            <div className="contacts-block__row">
              <p><strong>Notes</strong></p>
              <p>{ contact.notes }</p>
            </div>
          </>
        }

        <div className="contacts-block__buttons">
          { customer.contacts.length > 1 && <Button type="button" onClick={() => handlePrevPage()}>Previous</Button> }
          { customer.contacts.length > 0 && <Button type="button" onClick={handleSetContact}>Set as Contact</Button> }
          { customer.contacts.length > 1 && <Button type="button" onClick={() => handleNextPage()}>Next</Button> }
        </div>
      </div>
    </div>
  );
};
