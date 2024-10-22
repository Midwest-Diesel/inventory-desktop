import { picturesAtom, userAtom, alertsAtom, snPicturesAtom } from "@/scripts/atoms/state";
import { getBucket } from "@/scripts/controllers/imagesController";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import Login from "./Login";
import { getUser } from "@/scripts/controllers/userController";
import { getAlerts } from "@/scripts/controllers/alertsController";
import { getVersion } from "@tauri-apps/api/app";

interface Props {
  children: any
}


export default function GlobalData({ children }: Props) {
  const [pictures, setPictures] = useAtom(picturesAtom);
  const [snPictures, setSnPictures] = useAtom(snPicturesAtom);
  const [userData, setUserData] = useAtom<User>(userAtom);
  const [user, setUser] = useState<User>();
  const [loaded, setLoaded] = useState(false);
  const [alertsData, setAlertsData] = useAtom<Alert[]>(alertsAtom);
  const [version, setVersion] = useState('0.0.0');

  useEffect(() => {
    const fetchData = async () => {
      await handleGetUser();
      setLoaded(true);
      setAlertsData(await getAlerts());
      setPictures(await getBucket('parts'));
      setSnPictures(await getBucket('stockNum'));
      setVersion(await getVersion());
      console.log(await getVersion());
    };
    fetchData();
  }, []);

  const handleGetUser = async () => {
    const res = await getUser();
    setUser(res);
    setUserData(res);
  };


  return (
    <>
      { user ? children : loaded && <Login /> }
    </>
  );
}
