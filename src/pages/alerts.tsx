import CreateAlertDialog from "@/components/Dialogs/alerts/CreateAlertDialog";
import EditAlertDialog from "@/components/Dialogs/alerts/EditAlertDialog";
import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Table from "@/components/Library/Table";
import { selectedAlertsAtom } from "@/scripts/atoms/components";
import { alertsAtom } from "@/scripts/atoms/state";
import { deleteAlert } from "@/scripts/controllers/alertsController";
import { formatDate } from "@/scripts/tools/stringUtils";
import { useAtom } from "jotai";
import { useState } from "react";
import { confirm } from '@tauri-apps/api/dialog';

export default function Alerts() {
  const [selectedAlerts, setSelectedAlerts] = useAtom<Alert[]>(selectedAlertsAtom);
  const [alertsData, setAlertsAtom] = useAtom<Alert[]>(alertsAtom);
  const [newAlertOpen, setNewAlertOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [alertEdited, setAlertEdited] = useState<Alert>(null);

  const handleEdit = (alert: Alert) => {
    setAlertEdited(alert);
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!await confirm('Are you sure you want to delete this?')) return;
    await deleteAlert(id);
    setAlertsAtom(alertsData.filter((alert: Alert) => alert.id !== id));
  };


  return (
    <Layout title="Alerts">
      <div className="alerts-page">
        <h1>Alerts</h1>
        <Button onClick={() => setNewAlertOpen(!newAlertOpen)} data-id="new-alert-btn">Create Alert</Button>
        <CreateAlertDialog open={newAlertOpen} setOpen={setNewAlertOpen} />
        { isEditing && <EditAlertDialog open={isEditing} setOpen={setIsEditing} alert={alertEdited} /> }

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
              {alertsData && alertsData.map((alert: Alert) => {
                return (
                  <tr key={alert.id}>
                    <td>
                      <Button variant={['x-small', 'blue']} onClick={() => handleEdit(alert)} data-id="edit-btn">Edit</Button>
                      <Button variant={['x-small']} onClick={() => handleDelete(alert.id)} data-id="delete-btn">Delete</Button>
                    </td>
                    <td>{ formatDate(alert.date) }</td>
                    <td>{ alert.addedBy }</td>
                    <td data-id="part-num">{ alert.partNum }</td>
                    <td><span onClick={() => setSelectedAlerts([...selectedAlerts, alert])} data-id="open-btn">{ alert.type }</span></td>
                    <td data-id="note">{ alert.note }</td>
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
