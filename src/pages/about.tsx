import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import { invoke } from "@/scripts/config/tauri";
import { getVersion } from "@tauri-apps/api/app";
import { checkUpdate } from "@tauri-apps/api/updater";
import { useEffect, useState } from "react";
import { logout } from "@/scripts/services/userService";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";
import { cap } from "@/scripts/tools/stringUtils";


export default function About() {
  const [user] = useAtom<User>(userAtom);
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

  const clearLocalStorage = () => {
    localStorage.clear();
  };


  return (
    <Layout title="About">
      <div className="about-page">
        <h3>v{ version }</h3>
        <p className="about-page__username">Logged in as <span>{ cap(user.username) }</span></p>
        { !status && <Button variant={['fit']} onClick={checkForUpdates}>Check For Updates</Button> }
        { status && <p className="about-page__status-text">{ status }</p> }

        <Button variant={['fit']} onClick={clearLocalStorage}>Clear Local Storage</Button>
        <Button variant={['fit']} onClick={logout}>Logout</Button>
      </div>
    </Layout>
  );
}
