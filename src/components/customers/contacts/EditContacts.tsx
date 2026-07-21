import Input from "@/components/library/Input";

interface Props {
  contact: Contact | null
  setContact: (contact: Contact | null) => void
}


export default function EditContacts({ contact, setContact }: Props) {
  return (
    <>
      <div className="contacts-block__row">
        <Input
          variant={['small', 'thin', 'label-full-width', 'label-bold']}
          label="Name:"
          value={contact?.name ?? ''}
          onChange={(e) => contact && setContact({ ...contact, name: e.target.value })}
        />
      </div>
      <div className="contacts-block__row">
        <Input
          variant={['small', 'thin', 'label-full-width', 'label-bold']}
          label="Position:"
          value={contact?.position ?? ''}
          onChange={(e) => contact && setContact({ ...contact, position: e.target.value })}
        />
      </div>
      <div className="contacts-block__row">
        <Input
          variant={['small', 'thin', 'label-full-width', 'label-bold']}
          label="Email:"
          type="email"
          value={contact?.email ?? ''}
          onChange={(e) => contact && setContact({ ...contact, email: e.target.value })}
        />
      </div>
      <div className="contacts-block__row">
        <Input
          variant={['small', 'thin', 'label-full-width', 'label-bold']}
          label="Phone:"
          value={contact?.phone ?? ''}
          onChange={(e) => contact && setContact({ ...contact, phone: e.target.value })}
        />
      </div>
      <div className="contacts-block__row">
        <Input
          variant={['small', 'thin', 'label-full-width', 'label-bold']}
          label="Ext:"
          type="number"
          value={contact?.ext ?? ''}
          onChange={(e) => contact && setContact({ ...contact, ext: e.target.value ? Number(e.target.value) : null })}
        />
      </div>
      <div className="contacts-block__row">
        <Input
          variant={['small', 'thin', 'label-full-width', 'label-bold']}
          label="Notes:"
          value={contact?.notes ?? ''}
          onChange={(e) => contact && setContact({ ...contact, notes: e.target.value })}
        />
      </div>
    </>
  );
}
