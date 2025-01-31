import NewEmailAttachmentDialog from "@/components/Dialogs/NewEmailAttachmentDialog";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Loading from "@/components/Library/Loading";
import { deleteEmailStuffItem, getAllEmailStuff } from "@/scripts/controllers/emailStuffController";
import { invoke, confirm } from "@/scripts/config/tauri";
import Image from "next/image";
import { useEffect, useState } from "react";


export default function EmailStuff() {
  const [emailStuff, setEmailStuff] = useState<EmailStuff[]>([]);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  const [newAttachmentOpen, setNewAttachmentOpen] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllEmailStuff();
      setEmailStuff(res);
    };
    fetchData();
  }, []);

  const handleNewEmailItem = () => {
    setNewAttachmentOpen(true);
  };

  const handleAttachToNewEmail = async (item: EmailStuff) => {
    const emailArgs: Email = {
      subject: '',
      body: ``,
      recipients: [],
      attachments: item.images.map((i) => i.path)
    };    
    await invoke('new_email_draft', { emailArgs });
  };

  const handleAttachToExistingEmail = async (item: EmailStuff) => {
    const attachments = item.images.map((i) => i.path).join(";");
    await invoke('attach_to_existing_email', { attachments });
  };

  const handleImageError = (id: number) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const handleDelete = async (id: number) => {
    if (!await confirm('Are you sure you want to do this?')) return;
    await deleteEmailStuffItem(id);
    setEmailStuff(emailStuff.filter((item) => item.id !== id));
  };


  return (
    <Layout title="Email Stuff">
      <div className="email-stuff-page">
        { newAttachmentOpen && <NewEmailAttachmentDialog open={newAttachmentOpen} setOpen={setNewAttachmentOpen} setEmailStuff={setEmailStuff} /> }

        <h1>Email Stuff</h1>
        <Button onClick={handleNewEmailItem}>New Email Item</Button>

        <div className="email-stuff-page__list">
          { emailStuff.length === 0 && <Loading /> }
          {emailStuff.map((item) => {
            const hasImageError = imageErrors[item.id];

            return (
              <div key={item.id} className="email-stuff-page__item">
                <h2>{ item.name }</h2>
                {!hasImageError &&
                  <Image
                    src={`data:image/png;base64,${item.images[0].data}`}
                    alt={item.name}
                    width={100}
                    height={100}
                    onError={() => handleImageError(item.id)}
                  />
                }

                <div className="email-stuff-page__item-buttons">
                  <Button onClick={() => handleAttachToNewEmail(item)}>Attach to New Email</Button>
                  <Button onClick={() => handleAttachToExistingEmail(item)}>Attach to Existing Email</Button>
                  <Button variant={['danger']} onClick={() => handleDelete(item.id)}>Delete</Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
