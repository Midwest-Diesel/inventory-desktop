import { Layout } from "@/components/Layout";
import Button from "@/components/library/Button";
import { getMapLocations, getMapTopCustomers } from "@/scripts/services/mapService";
import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { formatDate } from "@/scripts/tools/stringUtils";
import { dateDiffInDays } from "@/scripts/tools/utils";
import { getAllUsers } from "@/scripts/services/accountService";
import Input from "@/components/library/Input";
import Select from "@/components/library/select/Select";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/library/Loading";
import MapRightSide from "@/components/map/MapRightSide";


const START_POS = { lat: 44.98022677, lng: -93.35875787 };
const LIMIT = 30;

export default function ImportantCustomersMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<number, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const [listDisplayItems, setListDisplayItems] = useState<MapLocation[]>([]);
  const [listOfLocations, setListOfLocations] = useState<MapLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<MapLocation[]>([]);
  const [filterName, setFilterName] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCustomerType, setFilterCustomerType] = useState('all');
  const [filterSalesman, setFilterSalesman] = useState('all');
  const [cluster, setCluster] = useState<MarkerClusterer | null>(null);
  const [loading, setLoading] = useState(true);

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
    handlePageChange(null, 1);
    loadMarkers();
  }, [filteredLocations, listOfLocations, mapInstanceRef]);

  const loadMarkers = async () => {
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;
    const { InfoWindow } = google.maps;
    const infoWindow = new InfoWindow();
    const markers: google.maps.marker.AdvancedMarkerElement[] = [];

    markersRef.current.forEach((marker) => marker.map = null);
    markersRef.current.clear();
  
    filteredLocations.forEach((loc) => {
      const { bg, border } = getPinStyles(loc.type === 'customer' ? loc.salesman : loc.type);
      const pin = new PinElement({
        background: bg,
        borderColor: border,
        glyphColor: 'white',
        glyph: getPinIcon(loc),
        scale: 0.9
      });
  
      const marker = new AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: loc.location,
        title: loc.address,
        content: pin,
        gmpClickable: true
      });
      markers.push(marker);
  
      markersRef.current.set(loc.id, marker);
      marker.addListener('click', (e: google.maps.MapMouseEvent) => {
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
    setLoading(false);
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
    const img = document.createElement('img');

    switch (loc.type) {
      case 'customer':
        return loc.salesman;
      case 'vendor':
        img.src = '/images/shop.svg';
        return img;
      default:
        return '';
    }
  };

  const panTo = (loc: { lat: number, lng: number }) => {
    const { lat, lng } = loc;
    mapInstanceRef.current?.panTo({ lat, lng });
  };

  const handleFilters = (locations: MapLocation[]) => {
    cluster?.clearMarkers();
    const filteredLocations = locations.filter((loc) => {
      const matchesName = filterName === '' || loc.name.toLowerCase().includes(filterName.toLowerCase());
      const matchesType = filterType === 'all' || loc.type === filterType;
      const matchesCustomerType = filterCustomerType === 'all' || loc.customer.customerType === filterCustomerType;
      const matchesSalesman = filterSalesman === 'all' || loc.salesman === filterSalesman;
      return matchesName && matchesType && matchesCustomerType && matchesSalesman;
    });
    setFilteredLocations(filteredLocations);
  };

  const onClickClearFilters = () => {
    cluster?.clearMarkers();
    setFilterName('');
    setFilterType('all');
    setFilterCustomerType('all');
    setFilterSalesman('all');
    setFilteredLocations(listOfLocations);
  };

  const onClickFilterTopCustomers = async () => {
    cluster?.clearMarkers();
    const topCustomers: number[] = await getMapTopCustomers();
    const newList = listOfLocations.filter((loc) => {
      return loc.customer && topCustomers.includes(loc.customer.id);
    });
    setFilteredLocations(newList);
  };

  const handlePageChange = (_: any, page: number) => {
    setListDisplayItems(filteredLocations.slice((page - 1) * LIMIT, page * LIMIT));
  };
  

  return (
    <Layout>
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
              onChange={(e) => setFilterName(e.target.value)}
            />
            <Select
              variant={['label-stack', 'label-bold']}
              label="Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option>all</option>
              <option>customer</option>
              <option>vendor</option>
            </Select>
            <Select
              variant={['label-stack', 'label-bold']}
              label="Customer Type"
              value={filterCustomerType}
              onChange={(e) => setFilterCustomerType(e.target.value)}
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
              onChange={(e) => setFilterSalesman(e.target.value)}
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
            <Button type="button" onClick={onClickClearFilters}>Clear Filters</Button>
            <br />
            <Button type="button" onClick={onClickFilterTopCustomers}>Top 100 Customers</Button>
          </div>
        </form>

        <div className="map-page">
          { loading && <Loading /> }
          <div ref={mapRef} className="map-page__map"></div>
        
          <MapRightSide
            listDisplayItems={listDisplayItems}
            panTo={panTo}
            mapInstanceRef={mapInstanceRef}
            filteredLocations={filteredLocations}
            handlePageChange={handlePageChange}
            limit={LIMIT}
          />
        </div>
      </div>
    </Layout>
  );
}
