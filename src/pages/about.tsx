import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import { invoke } from "@tauri-apps/api/tauri";
import { getVersion } from "@tauri-apps/api/app";
import { checkUpdate } from "@tauri-apps/api/updater";
import { useEffect, useState } from "react";
import { logout } from "@/scripts/controllers/userController";


export default function About() {
  const [version, setVersion] = useState('0.0.0');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setVersion(await getVersion());
    };
    fetchData();
  }, []);

  const checkForUpdates = async () => {
    const update = await checkUpdate();
    if (update.shouldUpdate) {
      invoke('install_update');
      setStatus('Installing update...');
      localStorage.removeItem('showUpdate');
    } else {
      setStatus('Most recent version is installed');
      setTimeout(() => setStatus(''), 2000);
    }
  };


  return (
    <Layout title="About">
      <div className="about-page">
        <h3>v{ version }</h3>
        <Button onClick={checkForUpdates}>Check For Updates</Button>
        <p className="about-page__status-text">{ status }</p>

        <Button onClick={logout}>Logout</Button>
      </div>
    </Layout>
  );
}
