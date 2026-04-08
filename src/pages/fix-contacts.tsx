import { Layout } from "@/components/Layout";
import Button from "@/components/library/Button";
import { deleteContact, getCustomerById } from "@/scripts/services/customerService";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";


export default function FixContacts() {
  const [params] = useSearchParams();
  const [emptyContacts, setEmptyContacts] = useState<Contact[]>([]);
  const [contactsWithInfo, setContactsWithInfo] = useState<Contact[]>([]);
  
  useQuery<Contact[]>({
    queryKey: ['contacts', params],
    queryFn: async () => {
      const id = Number(params.get('customer-id'));
      const res = await getCustomerById(id);
      if (res?.contacts) {
        setEmptyContacts(res.contacts.filter((c) => !hasInfo(c)));
        setContactsWithInfo(res.contacts.filter((c) => hasInfo(c)));
      }
      return res?.contacts ?? [];
    }
  });

  const hasInfo = (contact: Contact): boolean => {
    return Boolean(contact.email || contact.ext || contact.notes || contact.position);
  };

  const onClickDeleteContact = async (contact: Contact) => {
    await deleteContact(contact.id);
    setEmptyContacts(emptyContacts.filter((c) => c.id !== contact.id));
    setContactsWithInfo(contactsWithInfo.filter((c) => c.id !== contact.id));
  };


  return (
    <Layout>
      <div style={{ margin: 'auto' }}>
        <h2 style={{ marginBottom: '0.3rem' }}>Empty Contacts</h2>
        { emptyContacts.length === 0 && <p>Empty...</p> }
        {emptyContacts.map((contact) => {
          return (
            <div key={contact.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <p>{ contact.name }</p>
              <Button variant={['danger', 'xx-small']} onClick={() => onClickDeleteContact(contact)}>X</Button>
            </div>
          );
        })}

        <br />
        <h2 style={{ marginBottom: '0.3rem' }}>Contacts With Info</h2>
        { contactsWithInfo.length === 0 && <p>Empty...</p> }
        {contactsWithInfo.map((contact) => {
          return (
            <div key={contact.id}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <p>{ contact.name }</p>
                <Button variant={['danger', 'xx-small']} onClick={() => onClickDeleteContact(contact)}>X</Button>
              </div>

              <ul style={{ marginTop: '0.2rem' }}>
                { contact.position && <li><strong>Position:</strong> { contact.position }</li> }
                { contact.email && <li><strong>Email:</strong> { contact.email }</li> }
                { contact.ext && <li><strong>Ext:</strong> { contact.ext }</li> }
                { contact.notes && <li><strong>Notes:</strong> { contact.notes }</li> }
              </ul>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
