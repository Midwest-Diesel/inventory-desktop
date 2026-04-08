import { useEffect, useState } from "react";
import ContactsControls from "./ContactsControls";
import EditContacts from "./EditContacts";
import ContactInfo from "./ContactInfo";

interface Props {
  customer: Customer | null
  setCustomer: (customer: Customer | null) => void
}


export default function CustomerContactsBlock({ customer, setCustomer }: Props) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    setContact(customer?.contacts.find((c) => c.name === customer.contact) ?? null);
  }, [customer]);


  return (
    <div>
      {customer && 
        <ContactsControls
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          contact={contact}
          setContact={setContact}
          contacts={customer?.contacts ?? []}
          customer={customer}
          setCustomer={setCustomer}
        />
      }

      {contact &&
        <div className="contacts-block">
          {isEditing ?
            <EditContacts contact={contact} setContact={setContact} />
            :
            <ContactInfo contact={contact} />
          }
        </div>
      }
    </div>
  );
};
