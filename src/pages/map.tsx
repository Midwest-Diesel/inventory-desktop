import { Layout } from "@/components/Layout";
import { getMapLocations } from "@/scripts/services/mapService";
import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { formatDate } from "@/scripts/tools/stringUtils";
import { dateDiffInDays } from "@/scripts/tools/utils";
import Loading from "@/components/library/Loading";
import MapRightSide from "@/components/map/MapRightSide";
import MapPageFilters from "@/components/map/MapPageFilters";
import MapStartupScreen from "@/components/map/MapStartupScreen";


const LIMIT = 30;

export default function ImportantCustomersMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<number, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const [listDisplayItems, setListDisplayItems] = useState<MapLocation[]>([]);
  const [listOfLocations, setListOfLocations] = useState<MapLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<MapLocation[]>([]);
  const [filters, setFilters] = useState<MapFilters>({ name: '', type: 'all', customerType: 'all', salesman: 'all' });
  const [cluster, setCluster] = useState<MarkerClusterer | null>(null);
  const [startPos, setStartPos] = useState<GeoCoord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!startPos) return;
    setLoading(true);

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
        center: startPos,
        mapId: 'ldT4&DjKDaAaivn%uumtvEya@Jxw9CC', // Map style
        mapTypeControl: false,
        streetViewControl: false
      });
      mapInstanceRef.current = map;
    });
  }, [mapRef, startPos]);

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

  const panTo = (loc: GeoCoord) => {
    const { lat, lng } = loc;
    mapInstanceRef.current?.panTo({ lat, lng });
  };

  const handleFilters = (locations: MapLocation[]) => {
    cluster?.clearMarkers();
    const filteredLocations = locations.filter((loc) => {
      const matchesName = filters.name === '' || loc.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesType = filters.type === 'all' || loc.type === filters.type;
      const matchesCustomerType = filters.customerType === 'all' || loc.customer.customerType === filters.customerType;
      const matchesSalesman = filters.salesman === 'all' || loc.salesman === filters.salesman;
      return matchesName && matchesType && matchesCustomerType && matchesSalesman;
    });
    setFilteredLocations(filteredLocations);
  };

  const handlePageChange = (_: any, page: number) => {
    setListDisplayItems(filteredLocations.slice((page - 1) * LIMIT, page * LIMIT));
  };
  

  return (
    <Layout>
      <div className="map-page-container">
        {startPos &&
          <MapPageFilters
            filters={filters}
            setFilters={setFilters}
            cluster={cluster}
            listOfLocations={listOfLocations}
            setFilteredLocations={setFilteredLocations}
            handleFilters={handleFilters}
          />
        }

        <div className="map-page">
          { loading && <Loading /> }

          {!startPos ?
            <MapStartupScreen setStartPos={setStartPos} />
            :
            <>
              <div ref={mapRef} className="map-page__map"></div>
            
              <MapRightSide
                listDisplayItems={listDisplayItems}
                panTo={panTo}
                mapInstanceRef={mapInstanceRef}
                filteredLocations={filteredLocations}
                handlePageChange={handlePageChange}
                limit={LIMIT}
              />
            </>
          }
        </div>
      </div>
    </Layout>
  );
}
