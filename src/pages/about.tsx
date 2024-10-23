import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import { invoke } from "@tauri-apps/api/tauri";
import { getVersion } from "@tauri-apps/api/app";
import { checkUpdate } from "@tauri-apps/api/updater";
import { useEffect, useState } from "react";


export default function About() {
  const [version, setVersion] = useState('0.0.0');
  const [status, setStates] = useState('');

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
      setStates('Installed update');
    } else {
      setStates('Most recent version is installed');
    }
  };


  return (
    <Layout title="About">
      <div className="about-page">
        <h3>v{ version }</h3>
        <Button onClick={checkForUpdates}>Check For Updates</Button>
        <p className="about-page__status-text">{ status }</p>
      </div>
    </Layout>
  );
}
