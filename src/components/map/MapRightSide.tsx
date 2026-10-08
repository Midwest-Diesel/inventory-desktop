import { FormEvent, useState } from "react";
import Button from "../library/Button";
import Pagination from "../library/Pagination";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";
import { addMapLocation, deleteMapLocation, editMapLocation, fixMapLocation, getBrokenLocations, getGeoLocation } from "@/scripts/services/mapService";
import AddMapLocationDialog from "./dialogs/AddMapLocationDialog";
import EditMapLocationDialog from "./dialogs/EditMapLocationDialog";

interface Props {
  listDisplayItems: MapLocation[]
  panTo: (loc: GeoCoord) => void
  mapInstanceRef: React.RefObject<google.maps.Map | null>
  filteredLocations: MapLocation[]
  handlePageChange: (data: any, page: number) => void
  limit: number
}


export default function MapRightSide({ listDisplayItems, panTo, mapInstanceRef, filteredLocations, handlePageChange, limit }: Props) {
  const [user] = useAtom<User>(userAtom);
  const [newLocationDialogOpen, setNewLocationDialogOpen] = useState(false);
  const [editLocationDialogOpen, setEditLocationDialogOpen] = useState(false);
  const [editLocationData, setEditLocationData] = useState<MapLocation | null>(null);
  
  const onClickViewLoc = (loc: GeoCoord) => {
    panTo(loc);
    if (!mapInstanceRef.current) return;
    const zoom = Number(mapInstanceRef.current.getZoom());
    mapInstanceRef.current.setZoom(zoom >= 15 ? zoom : 15);
  };
  
  const onClickDeleteLocation = async (loc: MapLocation) => {
    if (!confirm('Are you sure?')) return;
    await deleteMapLocation(loc.id);
  };

  const handleAddLocation = async (name: string, location: GeoCoord, customerId: number) => {
    const geocoder = new window.google.maps.Geocoder();
    await geocoder.geocode({ location }, async (results, status) => {
      if (status === 'OK' && results?.[0]) {
        await addMapLocation({
          name,
          customerId,
          address: results[0].formatted_address,
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        });
      } else {
        console.error(`Geocoder failed due to: ${status}`);
      }
    });
  };

  const handleEditLocation = async (id: number, name: string, location: GeoCoord, type: MapLocationType, notes: string | null) => {
    const geocoder = new window.google.maps.Geocoder();
    await geocoder.geocode({ location }, async (results, status) => {
      if (status === 'OK' && results) {
        if (results[0]) {
          const address = results[0].formatted_address;
          const loc = results[0].geometry.location;
          const parsedAddress = address.includes('+') ? `LAT: ${loc.lat()}, LONG: ${loc.lng()}` : address;
          await editMapLocation({ id, name, address: parsedAddress, ...location, type, notes });
        }
      } else {
        console.error(`Geocoder failed due to: ${status}`);
      }
    });
  };

  const onSubmitNewLocation = async (data: LocationFormData) => {
    const res = await getGeoLocation(data.address);
    if (!res) return;
    const { lat, lng } = res.geometry.location;
    handleAddLocation(data.name, { lat, lng }, Number(data.customerId));
    panTo({ lat, lng });
  };

  const onSubmitEditLocation = async (data: LocationFormData) => {
    const res = await getGeoLocation(data.address);
    if (!res) return;
    const { lat, lng } = res.geometry.location;
    handleEditLocation(Number(data.id), data.name, { lat, lng }, data.type, data.notes);
    panTo({ lat, lng });
  };
  
  const onClickFixCoords = async () => {
    const res = await getBrokenLocations();
    if (res.length === 0) {
      alert('Nothing to fix');
      return;
    }
    const validLocations = res.filter((item: MapLocation) => item.address);
    const geoLocations = await Promise.all(
      validLocations.map((item: MapLocation) => getGeoLocation(item.address).then((data) => data))
    );

    const updates = geoLocations.filter(Boolean).map((loc, index) => {
      if (!loc) return null;
      const { id } = validLocations[index];
      return fixMapLocation({
        id,
        lat: loc.geometry.location.lat,
        lng: loc.geometry.location.lng,
        address: loc.formattedAddress
      });
    });
    await Promise.all(updates.filter(Boolean));
  };

  const onSubmitAddLocation = (e: FormEvent) => {
    e.preventDefault();
    setNewLocationDialogOpen(true);
  };

  const onClickEdit = (location: MapLocation) => {
    setEditLocationData(location);
    setEditLocationDialogOpen(true);
  };

  
  return (
    <>
      <AddMapLocationDialog
        open={newLocationDialogOpen}
        setOpen={setNewLocationDialogOpen}
        onSubmit={onSubmitNewLocation}
      />
      
      {(editLocationDialogOpen && editLocationData) &&
        <EditMapLocationDialog
          open={editLocationDialogOpen}
          setOpen={setEditLocationDialogOpen}
          data={editLocationData}
          onSubmit={onSubmitEditLocation}
        />
      }

      <div className="map-page__right-side">
        <form className="map-page__right-side-search" onSubmit={onSubmitAddLocation}>
          <Button type="submit">Add</Button>
          { user.id === 1 && <Button type="button" onClick={onClickFixCoords}>Fix Coords</Button> }
        </form>

        <div className="map-page__pagination-container">
          <div className="map-locations">
            {listDisplayItems.map((loc: MapLocation) => {
              return (
                <div className="map-locations__item" key={loc.id}>
                  <h3>{ loc.name }</h3>
                  <p>{ loc.address }</p>
                  <div className="map-locations__btn-container">
                    <Button onClick={() => onClickViewLoc(loc.location)}>View</Button>
                    <Button onClick={() => onClickEdit(loc)}>Edit</Button>
                    <Button onClick={() => onClickDeleteLocation(loc)}>Delete</Button>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            data={filteredLocations}
            setData={handlePageChange}
            pageCount={filteredLocations.length}
            pageSize={limit}
            buttonsDisplayed={3}
          />
        </div>
      </div>
    </>
  );
}
