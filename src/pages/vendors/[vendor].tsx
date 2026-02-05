import { Layout } from "@/components/Layout";
import Button from "@/components/library/Button";
import Grid from "@/components/library/grid/Grid";
import GridItem from "@/components/library/grid/GridItem";
import Loading from "@/components/library/Loading";
import { prompt } from "@/components/library/Prompt";
import Table from "@/components/library/Table";
import { useNavState } from "@/hooks/useNavState";
import { userAtom } from "@/scripts/atoms/state";
import { deleteVendor, getVendorById } from "@/scripts/services/vendorsService";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useState } from "react";
import { useParams } from "react-router-dom";


export default function VendorDetails() {
  const [user] = useAtom<User>(userAtom);
  const [isEditing, setIsEditing] = useState(false);
  const { closeDetailsBtn, push } = useNavState();
  const params = useParams();

  const { data: vendor, isFetching } = useQuery<Vendor | null>({
    queryKey: ['vendor', params.id],
    queryFn: () => getVendorById(Number(params.id)),
    enabled: !!params.id
  });

  if (isFetching) return <Layout><Loading /></Layout>;
  if (!vendor) return <Layout><h2>Invalid vendor</h2></Layout>;

  const handleDelete = async () => {
    if (user.accessLevel <= 1 || await prompt('Type "confirm" to delete this vendor') !== 'confirm') return;
    await deleteVendor(vendor.id);
    await push('Vendors', '/vendors');
  };


  return (
    <div className="vendor-details">
      <div className="vendor-details__header">
        <h2>{ vendor.name }</h2>

        <div className="header__btn-container">
          <Button
            variant={['blue']}
            className="vendor-details__edit-btn"
            onClick={() => setIsEditing(true)}
            data-testid="edit-btn"
          >
            Edit
          </Button>
          <Button
            className="vendor-details__close-btn"
            onClick={async () => await closeDetailsBtn()}
          >
            Back
          </Button>
          {user.accessLevel > 1 &&
            <Button
              variant={['danger']}
              onClick={handleDelete}
              data-testid="delete-btn"
            >
              Delete
            </Button>
          }
        </div>
      </div>

      <Grid>
        <GridItem variant={['low-opacity-bg']}>
          <Table variant={['plain', 'row-details']}>
            <tbody>
              <tr>
                <th>Address</th>
                <td>{ vendor.vendorAddress }</td>
              </tr>
              <tr>
                <th>City</th>
                <td>{ vendor.vendorCity }</td>
              </tr>
              <tr>
                <th>State</th>
                <td>{ vendor.vendorState }</td>
              </tr>
              <tr>
                <th>Zip</th>
                <td>{ vendor.vendorZip }</td>
              </tr>
              <tr>
                <th>Phone</th>
                <td>{ vendor.vendorPhone }</td>
              </tr>
              <tr>
                <th>Fax</th>
                <td>{ vendor.vendorFax }</td>
              </tr>
              <tr>
                <th>Contact</th>
                <td>{ vendor.vendorContact }</td>
              </tr>
              <tr>
                <th>Vendor Terms</th>
                <td>{ vendor.vendorTerms }</td>
              </tr>
            </tbody>
          </Table>
        </GridItem>
      </Grid>
    </div>
  );
}
