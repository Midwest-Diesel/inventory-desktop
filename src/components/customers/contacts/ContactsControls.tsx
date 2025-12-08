import Button from "@/components/library/Button";
import Select from "@/components/library/select/Select";
import { addCustomerContact, deleteContact, editContact, editCustomer, getCustomerById } from "@/scripts/services/customerService";
import { ask } from "@/scripts/config/tauri";

interface Props {
  isEditing: boolean
  setIsEditing: (value: boolean) => void
  contact: Contact | null
  setContact: (contact: Contact | null) => void
  contacts: Contact[]
  customer: Customer
  setCustomer: (customer: Customer) => void
}


export default function ContactsControls({ isEditing, setIsEditing, contact, setContact, contacts, customer, setCustomer }: Props) {
  const onSelectChangeContact = async (contactName: string) => {
    setContact(contacts.find((c) => c.name === contactName) ?? null);
    await editCustomer({ ...customer, contact: contactName });
    setCustomer({ ...customer, contact: contactName });
  };

  const onClickNewContact = async () => {
    const name = prompt('Enter a contact name');
    if (!name) return;
    await addCustomerContact(customer.id, name);
    const res = await getCustomerById(customer.id);
    setCustomer(res);
  };

  const onClickSaveContact = async () => {
    if (contact) await editContact(contact);
    setIsEditing(false);
    setCustomer(await getCustomerById(customer.id));
  };

  const onClickCancelEdit = () => {
    setContact(contacts.find((c) => c.name === customer.contact) ?? null);
    setIsEditing(false);
  };

  const onClickDeleteContact = async () => {
    if (!contact?.id || !await ask('Are you sure you want to delete this contact?')) return;
    await deleteContact(contact.id);
    await editCustomer({ ...customer, contact: null });
    const filteredContacts = contacts.filter((c) => c.id !== contact.id);
    setCustomer({ ...customer, contact: null, contacts: filteredContacts });
  };

  
  return (
    <div className="contacts-block__header">
      <h3>Contacts</h3>
      <Button type="button" onClick={onClickNewContact}>Add</Button>
      { !isEditing && <Button type="button" onClick={() => setIsEditing(true)} variant={['blue']}>Edit</Button> }
      {isEditing &&
        <>
          <Button type="button" onClick={onClickSaveContact} variant={['save']}>Save</Button>
          <Button type="button" onClick={onClickCancelEdit}>Cancel</Button>
        </>
      }
      <Button type="button" onClick={onClickDeleteContact} variant={['danger']}>Delete</Button>
      <Select
        value={contact?.name ?? ''}
        onChange={(e) => onSelectChangeContact(e.target.value)}
      >
        <option value="">-- CONTACT NAME --</option>
        {contacts.map((contact: Contact) => {
          return <option key={contact.id}>{ contact.name }</option>;
        })}
      </Select>
    </div>
  );
}
