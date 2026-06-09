import { formatDate } from "@/scripts/tools/stringUtils";
import Button from "../library/Button";
import Table from "../library/Table";
import { ask } from "@/scripts/config/tauri";
import { deletePersonalContact, getPersonalContactsList } from "@/scripts/services/personalContactsListService";
import UserSelect from "../library/select/UserSelect";
import { useState } from "react";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";
import { useQuery } from "@tanstack/react-query";
import { deleteTagFromCustomer } from "@/scripts/services/tagsService";

interface Props {
  closeTable: () => void
}


export default function PersonalContactsListTable({ closeTable }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [salesmanId, setSalesmanId] = useState<number | null>(user.id);

  const { data = [], refetch } = useQuery<PersonalContact[]>({
    queryKey: ['personalContactsList', salesmanId],
    queryFn: () => getPersonalContactsList({ salesmanId: Number(salesmanId) })
  });

  const handleGoBack = () => {
    closeTable();
  };

  const onClickDelete = async (contact: PersonalContact) => {
    if (!await ask('Are you sure you want to delete this contact?')) return;
    await deletePersonalContact(contact.id);
    await deleteTagFromCustomer(contact.customerId, 1);
    refetch();
  };


  return (
    <div className="reports-table">
      <Button onClick={handleGoBack}>Back</Button>
      
      {(user.accessLevel >= 3 || user.id === 7) &&
        <div style={{ display: 'flex', gap: '0.3rem', margin: '0.5rem 0' }}>
          <UserSelect
            value={salesmanId?.toString()}
            onChange={(e) => setSalesmanId(Number(e.target.value))}
          />
        </div>
      }

      <Table>
        <thead>
          <tr>
            <th>Date Added</th>
            <th>Salesman</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Contact</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                <td>{ formatDate(row.dateAdded) }</td>
                <td>{ row.salesman }</td>
                <td>{ row.company }</td>
                <td>{ row.phone }</td>
                <td>{ row.contact }</td>
                <td>{ row.email }</td>
                <td className="table-buttons table-buttons--grid">
                  <Button variant={['danger']} onClick={() => onClickDelete(row)}>Delete</Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      { data.length === 0 && <p>No contacts</p> }
    </div>
  );
}
