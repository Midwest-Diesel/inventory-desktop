interface Props {
  contact: Contact | null
}


export default function ContactInfo({ contact }: Props) {
  return (
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
  );
}
