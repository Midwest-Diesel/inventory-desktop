import { Layout } from "@/components/Layout";
import { getMapLocations } from "@/scripts/services/mapService";
import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
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
        zoom: 6,
        center: startPos,
        mapId: 'ldT4&DjKDaAaivn%uumtvEya@Jxw9CC',
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
      const background = loc.type === 'vendor' ? '#555555' : 'var(--yellow-light-1)';
      const borderColor = loc.type === 'vendor' ? '#494949' : 'black';
      const pin = new PinElement({
        background,
        borderColor,
        glyphColor: 'black',
        glyph: getPinIcon(loc),
        scale: 0.9
      });
  
      const marker = new AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: loc.location,
        title: loc.name,
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
            <p><strong>Notes</strong></p>
            <p>${loc.notes ? loc.notes : ''}</p>
          </div>
        `);
        infoWindow.open({ anchor: marker, map: mapInstanceRef.current });
      });
    });

    setCluster(new MarkerClusterer({
      markers,
      map: mapInstanceRef.current,
      algorithmOptions: { maxZoom: 20 },
      renderer: {
        render: ({ count, position, markers }) => {
          const div = document.createElement('div');
          div.className = `map-cluster${count >= 100 ? ' map-cluster--red' : ''}`;
          div.textContent = String(count);

          const tooltip = document.createElement('div');
          tooltip.className = 'map-cluster__tooltip';

          const names = markers
            .map((marker) => {
              const loc = filteredLocations.find((loc) => markersRef.current.get(loc.id) === marker);
              return loc?.name;
            })
            .filter((name): name is string => Boolean(name))
            .slice(0, 6);

          tooltip.textContent = names.join('\n');

          if (count > 6) {
            tooltip.textContent += '\n...';
          }

          div.appendChild(tooltip);

          return new google.maps.marker.AdvancedMarkerElement({
            position,
            content: div
          });
        }
      }
    }));
    setLoading(false);
  };

  const getPinIcon = (loc: MapLocation) => {
    const img = document.createElement('img');

    switch (loc.type) {
      case 'customer': {
        const glyph = document.createElement('span');
        glyph.textContent = loc.salesman ?? '';
        glyph.style.fontSize = '10px';
        return glyph;
      }
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
