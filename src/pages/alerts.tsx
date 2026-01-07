import { Layout } from "@/components/Layout";
import CreateAlertDialog from "@/components/alerts/dialogs/CreateAlertDialog";
import EditAlertDialog from "@/components/alerts/dialogs/EditAlertDialog";
import Button from "@/components/library/Button";
import Table from "@/components/library/Table";
import { selectedAlertsAtom } from "@/scripts/atoms/components";
import { alertsAtom } from "@/scripts/atoms/state";
import { deleteAlert, getAlerts, searchAlerts } from "@/scripts/services/alertsService";
import { formatDate } from "@/scripts/tools/stringUtils";
import { ask } from "@/scripts/config/tauri";
import { useAtom } from "jotai";
import { FormEvent, useState } from "react";
import Input from "@/components/library/Input";


export default function Alerts() {
  const [selectedAlerts, setSelectedAlerts] = useAtom<Alert[]>(selectedAlertsAtom);
  const [alerts, setAlerts] = useAtom<Alert[]>(alertsAtom);
  const [newAlertOpen, setNewAlertOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [alertEdited, setAlertEdited] = useState<Alert | null>(null);

  const handleEdit = (alert: Alert) => {
    setAlertEdited(alert);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!await ask('Are you sure you want to delete this?')) return;
    await deleteAlert(id);
    setAlerts(alerts.filter((alert: Alert) => alert.id !== id));
  };

  const onSubmitSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (search) {
      const res = await searchAlerts(search);
      setAlerts(res);
    } else {
      const res = await getAlerts();
      setAlerts(res);
    }
  };


  return (
    <Layout title="Alerts">
      <CreateAlertDialog open={newAlertOpen} setOpen={setNewAlertOpen} />
      { isEditing && <EditAlertDialog open={isEditing} setOpen={setIsEditing} alert={alertEdited} /> }

      <div className="alerts-page">
        <h1>Alerts</h1>
        <form className="alerts-page__top-buttons" onSubmit={onSubmitSearch}>
          <Input
            variant={['label-stack', 'label-bold']}
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={() => setNewAlertOpen(!newAlertOpen)} data-testid="new-alert-btn">Create Alert</Button>
        </form>

        <div className="alerts-page__container">
          <Table>
            <thead>
              <tr>
                <th></th>
                <th>Date Modified</th>
                <th>Edited By</th>
                <th>Part Number</th>
                <th>Alert Type</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {alerts && alerts.map((alert: Alert) => {
                return (
                  <tr key={alert.id}>
                    <td>
                      <Button variant={['x-small', 'blue']} onClick={() => handleEdit(alert)} data-testid="edit-btn">Edit</Button>
                      <Button variant={['x-small', 'danger']} onClick={() => handleDelete(alert.id)} data-testid="delete-btn">Delete</Button>
                    </td>
                    <td>{ formatDate(alert.date) }</td>
                    <td>{ alert.addedBy }</td>
                    <td data-testid="part-num">{ alert.partNum }</td>
                    <td><span onClick={() => setSelectedAlerts([...selectedAlerts, alert])} data-testid="type">{ alert.type }</span></td>
                    <td data-testid="note">{ alert.note }</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
