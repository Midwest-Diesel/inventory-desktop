import Button from "@/components/Library/Button";
import { addMapLocation, deleteMapLocation, editMapLocation, fixMapLocation, getBrokenLocations, getGeoLocation, getMapLocations, getMapNewLeads, getMapTopCustomers } from "@/scripts/services/mapService";
import { FormEvent, Fragment, useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useAtom } from "jotai";
import { userAtom } from "@/scripts/atoms/state";
import { formatDate, parseResDate } from "@/scripts/tools/stringUtils";
import { dateDiffInDays } from "@/scripts/tools/utils";
import { getAllUsers } from "@/scripts/services/userService";
import { supabase } from "@/scripts/config/supabase";
import { RealtimePostgresDeletePayload, RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from "@supabase/supabase-js";
import { getCustomerById } from "@/scripts/services/customerService";
import Input from "@/components/Library/Input";
import Select from "@/components/Library/Select/Select";
import Pagination from "@/components/Library/Pagination";
import AddMapLocationDialog from "@/components/Dialogs/map/AddMapLocationDialog";
import EditMapLocationDialog from "@/components/Dialogs/map/EditMapLocationDialog";
import { useQuery } from "@tanstack/react-query";

type LocationFormData = {
  id?: number
  name: string
  address: string
  type: MapLocationType
  customerId: number
  notes: string
};


const START_POS = { lat: 44.98022676149887, lng: -93.35875786260717 };
const LIMIT = 30;

export default function MapContainer() {
  const [user] = useAtom<User>(userAtom);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<number, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const [listOfLocations, setListOfLocations] = useState<MapLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<MapLocation[]>([]);
  const [listDisplayItems, setListDisplayItems] = useState<MapLocation[]>([]);
  const [newLocationDialogOpen, setNewLocationDialogOpen] = useState(false);
  const [editLocationDialogOpen, setEditLocationDialogOpen] = useState(false);
  const [editLocationData, setEditLocationData] = useState<MapLocation | null>(null);
  const [filterName, setFilterName] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCustomerType, setFilterCustomerType] = useState('all');
  const [filterSalesman, setFilterSalesman] = useState('all');
  const [cluster, setCluster] = useState<MarkerClusterer | null>(null);

  const { data: usersList = [] } = useQuery<User[]>({
    queryKey: ['usersList'],
    queryFn: getAllUsers
  });

  useEffect(() => {
    const fetchData = async () => {
      const res = await getMapLocations();
      setListOfLocations(res);
      setFilteredLocations(res);
      handleFilters(res);
    };
    fetchData();

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_MAPS_API!,
      version: 'weekly'
    });

    loader.load().then(() => {
      if (!mapRef.current) return;
      const map = new google.maps.Map(mapRef.current, {
        zoom: 9,
        center: START_POS,
        mapId: 'ldT4&DjKDaAaivn%uumtvEya@Jxw9CC', // Map style
        mapTypeControl: false,
        streetViewControl: false
      });
      mapInstanceRef.current = map;
    });
  }, [mapRef]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    let clickEvent: any;
    let closeWindowsEvent: any;

    handlePageChange(null, 1);

    supabase
      .channel('mapLocations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mapLocations' }, addRealtimeMapChanges)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mapLocations' }, editRealtimeMapChanges)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'mapLocations' }, deleteRealtimeMapChanges)
      .subscribe();
    
    const loadMarkers = async () => {
      const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;
      const { InfoWindow } = google.maps;
      const infoWindow = new InfoWindow();
      const markers: any[] = [];

      markersRef.current.forEach((marker) => marker.map = null);
      markersRef.current.clear();
    
      filteredLocations.forEach((loc) => {
        const { bg, border } = getPinStyles(loc.type === 'customer' ? loc.salesman : loc.type);
        const pin = new PinElement({
          background: bg,
          borderColor: border,
          glyphColor: 'white',
          glyph: getPinIcon(loc),
          scale: 0.9,
        });
    
        const marker = new AdvancedMarkerElement({
          map: mapInstanceRef.current,
          position: loc.location,
          title: loc.address,
          content: pin.element,
          gmpClickable: true,
        });
        markers.push(marker);
    
        markersRef.current.set(loc.id, marker);
        marker.addListener('click', (e: any) => {
          e.domEvent.stopPropagation();
          const days = dateDiffInDays(new Date(), loc.date);
          const { lat, lng } = loc.location;
          panTo({ lat, lng });
          infoWindow.setContent(`
            <div class="map-page__info-window">
              <h3>${loc.name}</h3>
              <p>${loc.address}</p>
              <hr />
              <p><em>Added ${formatDate(loc.date)} (${days})</em></p>
              <p><strong>Notes</strong></p>
              <p>${loc.notes ? loc.notes : ''}</p>
            </div>
          `);
          infoWindow.open({ anchor: marker, map: mapInstanceRef.current });
        });
      });

      setCluster(new MarkerClusterer({ markers, map: mapInstanceRef.current, algorithmOptions: { maxZoom: 20 } }));
    };
    loadMarkers();

    return () => {
      closeWindowsEvent && closeWindowsEvent.removeEventListener();
      google.maps.event.removeListener(clickEvent);
    };    
  }, [filteredLocations, listOfLocations, mapInstanceRef]);

  const addRealtimeMapChanges = async (e: RealtimePostgresInsertPayload<MapLocation>) => {
    const payload: any = e.new;
    const customer = payload.customerId ? await getCustomerById(payload.customerId) : null;
    const salesman = usersList.find((u) => u.id === payload.salesmanId)?.initials ?? '';
    const date = parseResDate(e.new.date as any);
    if (!date) return;
    const newSearchData: MapLocation = { ...e.new, date, salesman, customer, location: { lat: payload.lat, lng: payload.lng }};
    const newLocations: MapLocation[] = [newSearchData, ...listOfLocations];
    setListOfLocations(newLocations);
    handleFilters(newLocations);
  };

  const editRealtimeMapChanges = async (e: RealtimePostgresUpdatePayload<MapLocation>) => {
    const payload: any = e.new;
    const customer = payload.customerId ? await getCustomerById(payload.customerId) : null;
    const salesman = usersList.find((u) => u.id === payload.salesmanId)?.initials ?? '';
    const date = parseResDate(e.new.date as any);
    if (!date) return;
    const newSearchData: MapLocation = { ...e.new, date, salesman, customer, location: { lat: payload.lat, lng: payload.lng }};
    const newLocations: MapLocation[] = listOfLocations.map((loc) => {
      if (loc.id === newSearchData.id)
        return newSearchData;
      else
        return loc;
    });
    setListOfLocations(newLocations);
    handleFilters(newLocations);
  };

  const deleteRealtimeMapChanges = (e: RealtimePostgresDeletePayload<MapLocation>) => {
    setFilteredLocations(filteredLocations.filter((loc) => loc.id !== e.old.id));
    setListOfLocations(listOfLocations.filter((loc) => loc.id !== e.old.id));
  };

  const handlePageChange = (_: any, page: number) => {
    setListDisplayItems(filteredLocations.slice((page - 1) * LIMIT, page * LIMIT));
  };
  
  const getPinStyles = (str: string) => {
    switch (str) {
    case 'BS':
      return { bg: '#3C89D5', border: '#3C74D5' };
    case 'MR':
      return { bg: '#D3640A', border: '#CB5E05' };
    case 'JS':
      return { bg: '#6B4E43', border: '#60453C' };
    case 'TT':
      return { bg: '#741CDA', border: '#6B18CA' };
    case 'JF':
      return { bg: '#0A9618', border: '#088615' };
    case 'JMF':
      return { bg: '#01A987', border: '#019578' };
    case 'vendor':
      return { bg: '#555555', border: '#494949' };
    default:
      return { bg: '', border: '' };
    }
  };

  const getPinIcon = (loc: MapLocation) => {
    switch (loc.type) {
    case 'customer':
      return loc.salesman;
    case 'vendor':
      const img = document.createElement('img');
      img.src = '/images/shop.svg';
      return img;
    default:
      return '';
    }
  };

  const panTo = (loc: any) => {
    const { lat, lng } = loc;
    mapInstanceRef.current?.panTo({ lat, lng });
  };

  const handleViewLoc = (loc: any) => {
    panTo(loc);
    if (!mapInstanceRef.current) return;
    const zoom = Number(mapInstanceRef.current.getZoom());
    mapInstanceRef.current.setZoom(zoom >= 15 ? zoom : 15);
  };

  const handleDeleteLocation = async (loc: MapLocation) => {
    if (!confirm('Are you sure?')) return;
    await deleteMapLocation(loc.id);
  };

  const handleAddLocation = async (name: string, location: { lat: number, lng: number }, type: MapLocationType, customerId: number | null, notes: string) => {
    const geocoder = new window.google.maps.Geocoder();
    await geocoder.geocode({ location }, async (results, status) => {
      if (status === 'OK' && results) {
        if (results[0]) {
          const address = results[0].formatted_address;
          const loc = results[0].geometry.location;
          const parsedAddress = address.includes('+') ? `LAT: ${loc.lat()}, LONG: ${loc.lng()}` : address;
          await addMapLocation({ name, address: parsedAddress, ...location, type, salesmanId: user.id, legacyId: customerId, notes, date: new Date() });
        }
      } else {
        console.error('Geocoder failed due to: ' + status);
      }
    });
  };

  const handleEditLocation = async (id: number, name: string, location: { lat: number, lng: number }, type: MapLocationType, customerId: number | null, notes: string) => {
    const geocoder = new window.google.maps.Geocoder();
    await geocoder.geocode({ location }, async (results, status) => {
      if (status === 'OK' && results) {
        if (results[0]) {
          const address = results[0].formatted_address;
          const loc = results[0].geometry.location;
          const parsedAddress = address.includes('+') ? `LAT: ${loc.lat()}, LONG: ${loc.lng()}` : address;
          await editMapLocation({ id, name, address: parsedAddress, ...location, type, legacyId: customerId, notes });
        }
      } else {
        console.error('Geocoder failed due to: ' + status);
      }
    });
  };

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    setNewLocationDialogOpen(true);
  };

  const handleEdit = (loc: MapLocation) => {
    setEditLocationData(loc);
    setEditLocationDialogOpen(true);
  };

  const handleSubmitNewLocation = async (data: LocationFormData) => {
    const loc = await getGeoLocation(data.address);
    if (loc.length === 0) return;
    const { lat, lng } = loc[0].geometry.location;
    handleAddLocation(data.name, { lat, lng }, data.type, data.customerId, data.notes);
    panTo({ lat, lng });
  };

  const handleSubmitEditLocation = async (data: LocationFormData) => {
    const loc = await getGeoLocation(data.address);
    if (loc.length === 0) return;
    const { lat, lng } = loc[0].geometry.location;
    handleEditLocation(Number(data.id), data.name, { lat, lng }, data.type, data.customerId, data.notes);
    panTo({ lat, lng });
  };

  const handleFilters = (locations: MapLocation[]) => {
    cluster && cluster.clearMarkers();
    const filteredLocations = locations.filter((loc) => {
      const matchesName = filterName === '' || loc.name.toLowerCase().includes(filterName.toLowerCase());
      const matchesType = filterType === 'all' || loc.type === filterType;
      const matchesCustomerType = filterCustomerType === 'all' || loc.customerType === filterCustomerType;
      const matchesSalesman = filterSalesman === 'all' || loc.salesman === filterSalesman;
      return matchesName && matchesType && matchesCustomerType && matchesSalesman;
    });
    setFilteredLocations(filteredLocations);
  };

  const handleClearFilters = () => {
    cluster && cluster.clearMarkers();
    setFilterName('');
    setFilterType('all');
    setFilterCustomerType('all');
    setFilterSalesman('all');
    setFilteredLocations(listOfLocations);
  };

  const handleFilterTopCustomers = async () => {
    cluster && cluster.clearMarkers();
    const topCustomers: number[] = await getMapTopCustomers();
    const newList = listOfLocations.filter((loc) => {
      return loc.customer && topCustomers.includes(loc.customer.id);
    });
    setFilteredLocations(newList);
  };

  const handleFilterNewLeads = async () => {
    const newLeads: number[] = await getMapNewLeads();
    const newList = listOfLocations.filter((loc) => {
      return loc.customer && newLeads.includes(loc.customer.id);
    });
    setFilteredLocations(newList);
  };

  const handleFixCoords = async () => {
    const res = await getBrokenLocations();
    if (res.length === 0) return;
    const validLocations = res.filter((item: any) => item.address);
    const geoLocations = await Promise.all(
      validLocations.map((item: any) => getGeoLocation(item.address).then((data) => data[0]))
    );

    const updates = geoLocations.filter(Boolean).map((loc, index) => {
      if (!loc) return null;
      const { id } = validLocations[index];
      return fixMapLocation({
        id,
        lat: loc.geometry.location.lat,
        lng: loc.geometry.location.lng,
        address: loc.formatted_address
      });
    });
    await Promise.all(updates.filter(Boolean));
  };
  

  return (
    <div className="map-page-container">
      <form
        className="map-page-filters"
        onSubmit={(e) => {
          e.preventDefault();
          handleFilters(listOfLocations);
        }}
      >
        <div className="map-page-filters__inputs">
          <Input
            variant={['label-bold', 'label-stack']}
            label="Search Name"
            value={filterName}
            onChange={(e: any) => setFilterName(e.target.value)}
          />
          <Select
            variant={['label-stack', 'label-bold']}
            label="Type"
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
          >
            <option>all</option>
            <option>customer</option>
            <option>vendor</option>
          </Select>
          <Select
            variant={['label-stack', 'label-bold']}
            label="Customer Type"
            value={filterCustomerType}
            onChange={(e: any) => setFilterCustomerType(e.target.value)}
          >
            <option>all</option>
            <option>CAT</option>
            <option>Peterbilt</option>
            <option>Heavy Equipment</option>
            <option>Machinery</option>
            <option>Repair Shop</option>
            <option>Parts</option>
            <option>Truck</option>
          </Select>
          <Select
            variant={['label-stack', 'label-bold']}
            label="Salesmen"
            value={filterSalesman}
            onChange={(e: any) => setFilterSalesman(e.target.value)}
          >
            <option>all</option>
            {usersList.filter((user) => user.subtype === 'sales').map((user) => {
              return (
                <option key={user.id}>{ user.initials }</option>
              );
            })}
          </Select>
        </div>

        <div className="map-page-filters__buttons">
          <Button type="submit">Filter</Button>
          <Button type="button" onClick={handleClearFilters}>Clear Filters</Button>
          <br />
          <Button type="button" onClick={handleFilterTopCustomers}>Top 100 Customers</Button>
          {/* <Button type="button" onClick={handleFilterNewLeads}>New Leads</Button> */}
        </div>
      </form>

      <div className="map-page">
        <AddMapLocationDialog open={newLocationDialogOpen} setOpen={setNewLocationDialogOpen} onSubmit={handleSubmitNewLocation} />
        {editLocationDialogOpen &&
          <EditMapLocationDialog
            open={editLocationDialogOpen}
            setOpen={setEditLocationDialogOpen}
            data={editLocationData}
            onSubmit={handleSubmitEditLocation}
          />
        }

        <div ref={mapRef} className="map-page__map"></div>

        <div className="map-page__right-side">
          <form className="map-page__right-side-search" onSubmit={handleAdd}>
            <Button type="submit">Add</Button>
            { user.id === 1 && <Button type="button" onClick={handleFixCoords}>Fix Coords</Button> }
          </form>

          <div className="map-page__pagination-container">
            <div className="map-locations">
              {listDisplayItems.map((loc: MapLocation) => {
                return (
                  <Fragment key={loc.id}>
                    <div className="map-locations__item">
                      <h3>{ loc.name }</h3>
                      <p>{ loc.address }</p>
                      <div className="map-locations__btn-container">
                        <Button onClick={() => handleViewLoc(loc.location)}>View</Button>
                        <Button onClick={() => handleEdit(loc)}>Edit</Button>
                        <Button onClick={() => handleDeleteLocation(loc)}>Delete</Button>
                      </div>
                    </div>
                  </Fragment>
                );
              })}
            </div>

            <Pagination
              data={filteredLocations}
              setData={handlePageChange}
              pageCount={filteredLocations.length}
              pageSize={LIMIT}
              buttonsDisplayed={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
