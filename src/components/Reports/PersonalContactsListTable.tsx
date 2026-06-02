import { formatDate } from "@/scripts/tools/stringUtils";
import Button from "../library/Button";
import Table from "../library/Table";
import { ask } from "@/scripts/config/tauri";
import { deletePersonalContact } from "@/scripts/services/personalContactsListService";

interface Props {
  closeTable: () => void
  data: PersonalContact[]
}


export default function PersonalContactsListTable({ closeTable, data }: Props) {
  const handleGoBack = () => {
    closeTable();
  };

  const onClickDelete = async (id: number) => {
    if (!await ask('Are you sure you want to delete this contact?')) return;
    await deletePersonalContact(id);
  };


  return (
    <div className="reports-table">
      <Button onClick={handleGoBack}>Back</Button>

      <Table>
        <thead>
          <tr>
            <th>Date Added</th>
            <th>Salesman</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Contact</th>
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
                <td className="table-buttons table-buttons--grid">
                  <Button variant={['danger']} onClick={() => onClickDelete(row.id)}>Delete</Button>
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
