import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import { getAllEmailStuff } from "@/scripts/controllers/emailStuffController";
import Image from "next/image";
import { useEffect, useState } from "react";


export default function EmailStuff() {
  const [emailStuff, setEmailStuff] = useState<EmailStuff[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllEmailStuff();
      setEmailStuff(res);
    };
    fetchData();
  }, []);

  const handleNewEmailItem = () => {

  };

  const handleAttachToNewEmail = (item: EmailStuff) => {

  };

  const handleAttachToExistingEmail = (item: EmailStuff) => {

  };


  return (
    <Layout title="Email Stuff">
      <div className="email-stuff-page">
        <Button onClick={handleNewEmailItem}>New Email Item</Button>

        {emailStuff.map((item) => {
          return (
            <div key={item.id} className="email-stuff-page__item">
              <h2>{ item.name }</h2>
              <Image src={item.img} alt={item.name} fill />
              <Button onClick={() => handleAttachToNewEmail(item)}>Attach to New Email</Button>
              <Button onClick={() => handleAttachToExistingEmail(item)}>Attach to Existing Email</Button>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
