import { useAtom } from "jotai";
import Select from "./Select";
import Loading from "../Loading";
import { useEffect } from "react";
import { getAllUsers } from "@/scripts/services/userService";
import { usersAtom } from "@/scripts/atoms/state";

interface Props extends SelectHTML {
  variant?: ('label-inline' | 'label-space-between' | 'label-full-width' | 'label-stack' | 'label-bold')[]
  label?: string
  userSubtype?: 'sales' | 'dev' | 'frontDesk'
}


export default function UserSelect({ variant, label, userSubtype, ...props }: Props) {
  const [usersData, setUsersData] = useAtom<User[]>(usersAtom);

  useEffect(() => {
    const fetchData = async () => {
      if (usersData.length === 0) setUsersData(await getAllUsers());
    };
    fetchData();
  }, []);
  

  return (
    <>
      {usersData.length > 0 ?
        <Select
          label={label}
          variant={variant}
          {...props}
        >
          <option value="">-- SELECT A USER --</option>
          {usersData.length > 0 && usersData.filter((user) => !userSubtype || userSubtype === user.subtype).sort().map((user, i) => {
            return (
              <option key={i} value={user.id}>{ user.initials }</option>
            );
          })}
        </Select>
        :
        <Loading />
      }
    </>
  );
}
