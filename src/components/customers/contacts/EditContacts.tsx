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
  );
}
