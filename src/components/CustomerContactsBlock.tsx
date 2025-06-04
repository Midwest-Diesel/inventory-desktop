import React, { useEffect, useState } from "react";
import Button from "./Library/Button";
import { addCustomerContact, deleteContact, editContact, editCustomer, getCustomerById } from "@/scripts/services/customerService";
import Input from "./Library/Input";
import { confirm } from "@/scripts/config/tauri";
import Select from "./Library/Select/Select";
import { ask } from "@tauri-apps/api/dialog";

interface Props {
  customer: Customer
  setCustomer: (customer: Customer) => void
}


export default function CustomerContactsBlock({ customer, setCustomer }: Props) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    setContact(customer.contacts.find((c) => c.name === customer.contact) ?? null);
  }, [customer]);

  const changeContact = async (e: any) => {
    setContact(customer.contacts.find((c) => c.name === e.target.value) ?? null);
    await editCustomer({ ...customer, contact: e.target.value });
    setCustomer({ ...customer, contact: e.target.value });
  };

  const handleNewContact = async () => {
    const name = prompt('Enter a contact name');
    if (!name) return;
    await addCustomerContact(customer.id, name);
    const res = await getCustomerById(customer.id);
    setCustomer(res);
  };

  const handleSaveContact = async () => {
    if (contact) await editContact(contact);
    setIsEditing(false);
    setCustomer(await getCustomerById(customer.id));
  };

  const handleCancelEdit = () => {
    setContact(customer.contacts.find((c) => c.name === customer.contact) ?? null);
    setIsEditing(false);
  };

  const handleDeleteContact = async () => {
    if (!contact?.id || !await ask('Are you sure you want to delete this?')) return;
    await deleteContact(contact.id);
    await editCustomer({ ...customer, contact: null });
    const filteredContacts = customer.contacts.filter((c) => c.id !== contact.id);
    setCustomer({ ...customer, contact: null, contacts: filteredContacts });
  };


  return (
    <div>
      <div className="contacts-block__header">
        <h3>Contacts</h3>
        <Button type="button" onClick={handleNewContact}>Add</Button>
        {!isEditing && <Button type="button" onClick={() => setIsEditing(true)} variant={['blue']}>Edit</Button>}
        {isEditing &&
          <>
            <Button type="button" onClick={handleSaveContact} variant={['save']}>Save</Button>
            <Button type="button" onClick={handleCancelEdit}>Cancel</Button>
          </>
        }
        <Button type="button" onClick={handleDeleteContact} variant={['danger']}>Delete</Button>
        <Select
          value={contact?.name ?? ''}
          onChange={changeContact}
        >
          <option value="">-- CONTACT NAME --</option>
          {customer.contacts.map((contact: Contact) => {
            return <option key={contact.id}>{ contact.name }</option>;
          })}
        </Select>
      </div>

      <div className="contacts-block">
        {isEditing ?
          <>
            <div className="contacts-block__row">
              <Input
                variant={['small', 'thin', 'label-full-width', 'label-space-between', 'label-bold']}
                label="Name"
                value={contact?.name ?? ''}
                onChange={(e: any) => contact && setContact({ ...contact, name: e.target.value })}
              />
            </div>
            <div className="contacts-block__row">
              <Input
                variant={['small', 'thin', 'label-full-width', 'label-space-between', 'label-bold']}
                label="Position"
                value={contact?.position ?? ''}
                onChange={(e: any) => contact && setContact({ ...contact, position: e.target.value })}
              />
            </div>
            <div className="contacts-block__row">
              <Input
                variant={['small', 'thin', 'label-full-width', 'label-space-between', 'label-bold']}
                label="Email"
                type="email"
                value={contact?.email ?? ''}
                onChange={(e: any) => contact && setContact({ ...contact, email: e.target.value })}
              />
            </div>
            <div className="contacts-block__row">
              <Input
                variant={['small', 'thin', 'label-full-width', 'label-space-between', 'label-bold']}
                label="Ext"
                type="number"
                value={contact?.ext ?? ''}
                onChange={(e: any) => contact && setContact({ ...contact, ext: e.target.value })}
              />
            </div>
            <div className="contacts-block__row">
              <Input
                variant={['small', 'thin', 'label-full-width', 'label-space-between', 'label-bold']}
                label="Notes"
                value={contact?.notes ?? ''}
                onChange={(e: any) => contact && setContact({ ...contact, notes: e.target.value })}
              />
            </div>
          </>
          :
          <>
            <div className="contacts-block__row">
              <p><strong>Position</strong></p>
              <p>{ contact?.position }</p>
            </div>
            <div className="contacts-block__row">
              <p><strong>Email</strong></p>
              <p>{ contact?.email }</p>
            </div>
            <div className="contacts-block__row">
              <p><strong>Ext</strong></p>
              <p>{ contact?.ext }</p>
            </div>
            <div className="contacts-block__row">
              <p><strong>Notes</strong></p>
              <p>{ contact?.notes }</p>
            </div>
          </>
        }
      </div>
    </div>
  );
};
