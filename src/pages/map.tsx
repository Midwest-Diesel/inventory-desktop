import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import { Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { Fragment, useState } from "react";


export default function ImportantCustomersMap() {
  const startPos = { lat: 45.12100022079314, lng: -93.19415647227015 };
  const [listOfLocations, setListOfLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogLocation, setDialogLocation] = useState(null);
  
  const handleMapClick = (mapProps: any) => {
    const lat = mapProps.detail.latLng.lat;
    const lng = mapProps.detail.latLng.lng;
    setShowDialog(true);
    setDialogLocation({ lat, lng });
    setSelectedLocation({ lat, lng });
  };

  const onViewLocation = (loc: any) => {

  };

  const onDeleteLocation = (loc: any) => {
    let updatedList = listOfLocations.filter(
      (l) => loc.lat !== l.location.lat && loc.lng !== l.location.lng
    );
    setListOfLocations(updatedList);
  };

  const onAddLocation = () => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: selectedLocation }, (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          const address = results[0].formatted_address;
          const loc = results[0].geometry.location
          setListOfLocations([
            ...listOfLocations,
            { name: address.includes('+') ? `LAT: ${loc.lat()}, LONG: ${loc.lng()}` : address, location: selectedLocation },
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
          {listOfLocations.map((loc) => {
            return (
              <Fragment key={loc.location.lat + loc.location.lng}>
                <div
                  className="map-locations__item"
                >
                  <p>{loc.name}</p>
                  <div className="map-locations__btn-container">
                    <Button onClick={() => onViewLocation(loc.location)}>View</Button>
                    <Button onClick={() => onDeleteLocation(loc.location)}>Delete</Button>
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
