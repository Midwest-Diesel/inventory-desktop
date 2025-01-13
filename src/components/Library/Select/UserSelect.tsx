import { useAtom } from "jotai";
import Select from "./Select";
import Loading from "../Loading";
import { useEffect } from "react";
import { getAllUsers } from "@/scripts/controllers/userController";
import { usersAtom } from "@/scripts/atoms/state";

interface Props extends SelectHTML {
  variant?: ('label-inline' | 'label-space-between' | 'label-full-width' | 'label-stack' | 'label-bold')[]
  label?: string
}


export default function UserSelect({ variant, label, ...props }: Props) {
  const [usersData, setUsersData] = useAtom<{ id: number, initials: string }[]>(usersAtom);

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
          {usersData.length > 0 && usersData.sort().map((user, i) => {
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
