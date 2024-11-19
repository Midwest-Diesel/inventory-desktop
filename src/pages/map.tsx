import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import { addMapLocation, deleteMapLocation, getMapLocations } from "@/scripts/controllers/mapController";
import { confirm } from "@tauri-apps/api/dialog";
import { Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { Fragment, useEffect, useState } from "react";


export default function ImportantCustomersMap() {
  const startPos = { lat: 45.12100022079314, lng: -93.19415647227015 };
  const [listOfLocations, setListOfLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number }>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogLocation, setDialogLocation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getMapLocations();
      setListOfLocations(res);
    };
    fetchData();
  }, []);
  
  const handleMapClick = (mapProps: any) => {
    const lat = mapProps.detail.latLng.lat;
    const lng = mapProps.detail.latLng.lng;
    setShowDialog(true);
    setDialogLocation({ lat, lng });
    setSelectedLocation({ lat, lng });
  };

  const onViewLocation = (loc: any) => {

  };

  const onDeleteLocation = async (loc: MapLocation) => {
    if (!await confirm('Are you sure?')) return;
    await deleteMapLocation(loc.id);
    let updatedList = listOfLocations.filter((l) => loc.id !== l.id);
    setListOfLocations(updatedList);
  };

  const onAddLocation = async () => {
    const geocoder = new window.google.maps.Geocoder();
    await geocoder.geocode({ location: selectedLocation }, async (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          const address = results[0].formatted_address;
          const loc = results[0].geometry.location;
          const parsedAddress = address.includes('+') ? `LAT: ${loc.lat()}, LONG: ${loc.lng()}` : address;
          const id = await addMapLocation({ name: parsedAddress, ...selectedLocation });
          
          setListOfLocations([
            ...listOfLocations,
            { id, name: parsedAddress, location: selectedLocation },
          ]);
          setShowDialog(false);
        }
      } else {
        console.error("Geocoder failed due to: " + status);
      }
    });
  };


  return (
    <Layout>
      <div className="map-page">
        <Map
          defaultZoom={13}
          defaultCenter={startPos}
          gestureHandling={"greedy"}
          disableDefaultUI
          className="map-page__map"
          onClick={(mapProps) => handleMapClick(mapProps)}
        />

        {showDialog && (
          <InfoWindow position={dialogLocation}>
            <Button onClick={onAddLocation}>Add this location</Button>
          </InfoWindow>
        )}

        <div className="map-locations">
          {listOfLocations.map((loc: MapLocation) => {
            return (
              <Fragment key={loc.id}>
                <div
                  className="map-locations__item"
                >
                  <p>{loc.name}</p>
                  <div className="map-locations__btn-container">
                    <Button onClick={() => onViewLocation(loc.location)}>View</Button>
                    <Button onClick={() => onDeleteLocation(loc)}>Delete</Button>
                  </div>
                </div>

                <Marker position={loc.location} />
              </Fragment>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
