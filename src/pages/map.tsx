import { Layout } from "@/components/Layout";
import Button from "@/components/Library/Button";
import Input from "@/components/Library/Input";
import { addMapLocation, deleteMapLocation, getGeoLocation, getMapLocations } from "@/scripts/controllers/mapController";
import { confirm } from "@tauri-apps/api/dialog";
import { Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";
import { FormEvent, Fragment, useEffect, useState } from "react";

type PinData = {
  name: string
  location: { lat: number, lng: number }
};


export default function ImportantCustomersMap() {
  const startPos = { lat: 44.98022676149887, lng: -93.35875786260717 };
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [listOfLocations, setListOfLocations] = useState<MapLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number }>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogLocation, setDialogLocation] = useState<{ lat: number, lng: number }>(null);
  const [addressSearch, setAddressSearch] = useState('');
  const [pinData, setPinData] = useState<PinData>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getMapLocations();
      setListOfLocations(res);
    };
    fetchData();
  }, []);
  
  const handleMapClick = (e: any) => {
    const lat = e.detail.latLng.lat;
    const lng = e.detail.latLng.lng;
    setShowDialog(true);
    setDialogLocation({ lat, lng });
    setSelectedLocation({ lat, lng });
    panToLoc({ lat, lng });
  };

  const panToLoc = (loc: any) => {
    const { lat, lng } = loc;
    mapInstance.panTo({ lat, lng });
  };

  const onDeleteLocation = async (loc: MapLocation) => {
    if (!await confirm('Are you sure?')) return;
    await deleteMapLocation(loc.id);
    let updatedList = listOfLocations.filter((l) => loc.id !== l.id);
    setListOfLocations(updatedList);
  };

  const handleAddLocation = async (location: { lat: number, lng: number }) => {
    const geocoder = new window.google.maps.Geocoder();
    await geocoder.geocode({ location }, async (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          const address = results[0].formatted_address;
          const loc = results[0].geometry.location;
          const parsedAddress = address.includes('+') ? `LAT: ${loc.lat()}, LONG: ${loc.lng()}` : address;
          const id = await addMapLocation({ name: parsedAddress, ...location });

          // setListOfLocations([
          //   ...listOfLocations,
          //   { id, name: parsedAddress, location: location },
          // ]);
          setShowDialog(false);
        }
      } else {
        console.error("Geocoder failed due to: " + status);
      }
    });
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setAddressSearch('');
    const loc = await getGeoLocation(addressSearch);
    if (loc.length === 0) return;
    const { lat, lng } = loc[0].geometry.location;
    handleAddLocation({ lat, lng });
    panToLoc({ lat, lng });
  };

  const handleSelectPin = async (loc: MapLocation) => {
    setPinData(loc);
  };

  const getAdjustedPos = (loc: { lat: number; lng: number }) => {
    if (!mapInstance) return loc;
    const scale = Math.pow(2, mapInstance.getZoom());
    const projection = mapInstance.getProjection();
    const point = projection.fromLatLngToPoint(new google.maps.LatLng(loc.lat, loc.lng));
    if (!point) return loc;

    const adjustedPoint = new google.maps.Point(point.x, point.y - 50 / scale);
    const adjustedLatLng = projection.fromPointToLatLng(adjustedPoint);
    return { lat: adjustedLatLng.lat(), lng: adjustedLatLng.lng() };
  };
  

  return (
    <Layout>
      <div className="map-page">
        <Map
          defaultZoom={10}
          defaultCenter={startPos}
          gestureHandling={"greedy"}
          disableDefaultUI
          className="map-page__map"
          onClick={(mapProps) => handleMapClick(mapProps)}
          onIdle={(map) => !mapInstance && setMapInstance(map.map)}
        />

        {showDialog && (
          <InfoWindow position={dialogLocation} onClose={() => setShowDialog(false)}>
            <Button onClick={() => handleAddLocation(selectedLocation)}>Add this location</Button>
          </InfoWindow>
        )}

        <div className="map-page__right-side">
          <form className="map-page__right-side-search" onSubmit={handleSearch}>
            <Input
              variant={['label-bold', 'label-full-width']}
              label="Pin Address"
              placeholder="address, city"
              value={addressSearch}
              onChange={(e: any) => setAddressSearch(e.target.value)}
            />
            <Button>Search</Button>
          </form>

          <div className="map-locations">
            {listOfLocations.map((loc: MapLocation) => {
              return (
                <Fragment key={loc.id}>
                  <div
                    className="map-locations__item"
                  >
                    <p>{loc.name}</p>
                    <div className="map-locations__btn-container">
                      <Button onClick={() => panToLoc(loc.location)}>View</Button>
                      <Button onClick={() => onDeleteLocation(loc)}>Delete</Button>
                    </div>
                  </div>

                  <Marker position={loc.location} onClick={() => handleSelectPin(loc)} />
                  {pinData &&
                    <InfoWindow position={getAdjustedPos(pinData.location)} onClose={() => setPinData(null)}>
                      <h3>{ pinData.name }</h3>
                    </InfoWindow>
                  }
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
