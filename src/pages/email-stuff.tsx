import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Loading from "@/components/Library/Loading";
import { getAllEmailStuff } from "@/scripts/controllers/emailStuffController";
import { invoke } from "@tauri-apps/api/tauri";
import Image from "next/image";
import { useEffect, useState } from "react";


export default function EmailStuff() {
  const [emailStuff, setEmailStuff] = useState<EmailStuff[]>([]);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  
  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllEmailStuff();
      setEmailStuff(res);
    };
    fetchData();
  }, []);

  const handleNewEmailItem = async () => {

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
    await invoke('attach_to_existing_email', { payload: { attachments: item.images }});
  };

  const handleImageError = (id: number) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };


  return (
    <Layout title="Email Stuff">
      <div className="email-stuff-page">
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
