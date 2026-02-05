import Button from "../library/Button";
import Grid from "../library/grid/Grid";
import GridItem from "../library/grid/GridItem";
import { FormEvent, useState } from "react";
import Input from "@/components/library/Input";
import { usePreventNavigation } from "../../hooks/usePreventNavigation";
import { ask } from "@/scripts/config/tauri";
import Table from "../library/Table";
import { editVendor } from "@/scripts/services/vendorsService";

interface Props {
  vendor: Vendor
  refetch: () => void
  setIsEditing: (value: boolean) => void
}


export default function EditVendorDetails({ vendor, refetch, setIsEditing }: Props) {
  const [name, setVendorName] = useState<string>(vendor.name ?? '');
  const [vendorAddress, setVendorAddress] = useState<string>(vendor.vendorAddress ?? '');
  const [vendorCity, setVendorCity] = useState<string>(vendor.vendorCity ?? '');
  const [vendorState, setVendorState] = useState<string>(vendor.vendorState ?? '');
  const [vendorZip, setVendorZip] = useState<string>(vendor.vendorZip ?? '');
  const [vendorPhone, setVendorPhone] = useState<string>(vendor.vendorPhone ?? '');
  const [vendorFax, setVendorFax] = useState<string>(vendor.vendorFax ?? '');
  const [vendorTerms, setVendorTerms] = useState<string>(vendor.vendorTerms ?? '');
  const [vendorContact, setVendorContact] = useState<string>(vendor.vendorContact ?? '');
  const [changesSaved, setChangesSaved] = useState(true);
  usePreventNavigation(!changesSaved, 'Leave without saving changes?');

  const onSubmitSaveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!changesSaved && !await ask('Are you sure you want to save these changes?')) return;
    setChangesSaved(false);
    const newVendor = {
      id: vendor.id,
      name,
      vendorAddress,
      vendorCity,
      vendorState,
      vendorZip,
      vendorPhone,
      vendorFax,
      vendorTerms,
      vendorContact
    };
    await editVendor(newVendor);
    refetch();
    setIsEditing(false);
  };

  const onClickStopEditing = async () => {
    if (changesSaved) {
      setIsEditing(false);
    } else if (await ask('Do you want to leave without saving?')) {
      setIsEditing(false);
    }
  };

  
  return (
    <form className="edit-vendor-details" onSubmit={(e) => onSubmitSaveChanges(e)} onChange={() => setChangesSaved(false)}>
      <div className="edit-vendor-details__header">
        <Input
          variant={['md-text']}
          value={name}
          onChange={(e) => setVendorName(e.target.value)}
          required
        />
      
        <div className="header__btn-container">
          <Button
            variant={['save']}
            className="edit-vendor-details__save-btn"
            type="submit"
          >
            Save
          </Button>
          <Button
            className="edit-vendor-details__close-btn"
            type="button"
            onClick={onClickStopEditing}
          >
            Cancel Editing
          </Button>
        </div>
      </div>
    
      <Grid>
        <GridItem variant={['low-opacity-bg']}>
          <Table variant={['plain', 'row-details', 'edit-row-details']}>
            <tbody>
              <tr>
                <th>Address</th>
                <td>
                  <Input
                    value={vendorAddress}
                    onChange={(e) => setVendorAddress(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>City</th>
                <td>
                  <Input
                    value={vendorCity}
                    onChange={(e) => setVendorCity(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>State</th>
                <td>
                  <Input
                    value={vendorState}
                    onChange={(e) => setVendorState(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Zip</th>
                <td>
                  <Input
                    value={vendorZip}
                    onChange={(e) => setVendorZip(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Phone</th>
                <td>
                  <Input
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Fax</th>
                <td>
                  <Input
                    value={vendorFax}
                    onChange={(e) => setVendorFax(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Contact</th>
                <td>
                  <Input
                    value={vendorContact}
                    onChange={(e) => setVendorContact(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Terms</th>
                <td>
                  <Input
                    value={vendorTerms}
                    onChange={(e) => setVendorTerms(e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </Table>
        </GridItem>
      </Grid>
    </form>
  );
}
