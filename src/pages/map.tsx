import { Layout } from "@/components/Layout";
import { getMapLocations } from "@/scripts/services/mapService";
import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import MapRightSide from "@/components/map/MapRightSide";
import MapPageFilters from "@/components/map/MapPageFilters";
import MapStartupScreen from "@/components/map/MapStartupScreen";
import { getCustomerSalesMeasurement } from "@/scripts/services/customerService";
import { formatCurrency } from "@/scripts/tools/stringUtils";
import { invoke } from "@/scripts/config/tauri";
import { useQuery } from "@tanstack/react-query";


const LIMIT = 30;

export default function ImportantCustomersMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<number, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const locationsRef = useRef<Map<number, MapLocation>>(new Map());
  const clusterRef = useRef<MarkerClusterer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const filteredLocationsRef = useRef<MapLocation[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [listDisplayItems, setListDisplayItems] = useState<MapLocation[]>([]);
  const [filters, setFilters] = useState<MapFilters>({ name: '', type: 'all', customerType: 'all', salesman: 'all', ranking: null });
  const [startPos, setStartPos] = useState<GeoCoord | null>(null);
  const [satelliteView, setSatelliteView] = useState(false);

  const { data: listOfLocations = [] } = useQuery<MapLocation[]>({
    queryKey: ['listOfLocations', filters],
    queryFn: async () => {
      clusterRef.current?.clearMarkers();
      const params = { ranking: filters.ranking };
      const res = await getMapLocations(params);

      return res.filter((loc) => {
        const matchesName = filters.name === '' || loc.name.toLowerCase().includes(filters.name.toLowerCase());
        const matchesType = filters.type === 'all' || loc.type === filters.type;
        const matchesCustomerType = filters.customerType === 'all' || loc.customer.customerType === filters.customerType;
        const matchesSalesman = filters.salesman === 'all' || loc.salesman === filters.salesman;
        return matchesName && matchesType && matchesCustomerType && matchesSalesman;
      });
    }
  });

  useEffect(() => {
    if (!startPos) return;

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
      infoWindowRef.current = new google.maps.InfoWindow();

      clusterRef.current = new MarkerClusterer({
        map,
        markers: [],
        algorithmOptions: { maxZoom: 20 },
        renderer: {
          render: ({ count, position, markers }) => {
            const div = document.createElement("div");
            div.className = `map-cluster${count >= 300 ? ' map-cluster--red' : count >= 100 ? ' map-cluster--orange' : ''}`;
            div.textContent = String(count);

            const tooltip = document.createElement('div');
            tooltip.className = 'map-cluster__tooltip';

            const names = markers
              .map((marker) => {
                for (const [id, currentMarker] of markersRef.current) {
                  if (currentMarker === marker) {
                    return locationsRef.current.get(id)?.name;
                  }
                }

                return undefined;
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
      });

      setMapReady(true);
    });
  }, [mapRef, startPos]);

  useEffect(() => {
    filteredLocationsRef.current = listOfLocations;
    locationsRef.current = new Map(listOfLocations.map((loc) => [loc.id, loc]));

    handlePageChange(null, 1);

    if (!mapReady || !clusterRef.current) return;

    const renderMarkers = async () => {
      const clusterer = clusterRef.current;

      if (!clusterer) return;

      clusterer.clearMarkers();
      markersRef.current.clear();

      const markers = await Promise.all(
        listOfLocations.map(async (loc) => ({
          id: loc.id,
          marker: await createMarker(loc)
        }))
      );

      markers.forEach(({ id, marker }) => {
        markersRef.current.set(id, marker);
      });

      clusterer.addMarkers(
        markers.map(({ marker }) => marker)
      );
    };

    void renderMarkers();
  }, [listOfLocations, mapReady]);

  const createMarker = async (loc: MapLocation): Promise<google.maps.marker.AdvancedMarkerElement> => {
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;
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
      position: loc.location,
      title: loc.name,
      content: pin,
      gmpClickable: true
    });

    marker.addListener('click', async (e: google.maps.MapMouseEvent) => {
      e.domEvent.stopPropagation();
      const res = await getCustomerSalesMeasurement(loc.customer.id);
      const { lat, lng } = loc.location;
      panTo({ lat, lng });

      infoWindowRef.current?.setContent(`
        <div class="map-page__info-window">
          <h3 id="customer-${loc.customer.id}">${loc.name}</h3>
          <p>${loc.address}</p>
          <hr />
          <p><strong>Sales (2 years):</strong> ${(res?.amount || res?.value) ? `${res.amount} invoices / ${formatCurrency(res.value)}` : '<em>None</em>'}</p>
          <p><strong>Notes</strong></p>
          <p>${loc.notes ?? ''}</p>
        </div>
      `);

      infoWindowRef.current?.open({ anchor: marker, map: mapInstanceRef.current });

      google.maps.event.addListenerOnce(infoWindowRef.current!, 'domready', () => {
        document.getElementById(`customer-${loc.customer.id}`)?.addEventListener('click', async () => {
          const windowArgs = {
            title: loc.name,
            url: `/customer/${loc.customer.id}`,
            is_prod: import.meta.env.PROD
          };

          await invoke('open_window', { windowArgs });
        });
      });
    });

    return marker;
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
        img.src = '/images/icons/shop.svg';
        return img;
      default:
        return '';
    }
  };

  const panTo = (loc: GeoCoord) => {
    const { lat, lng } = loc;
    mapInstanceRef.current?.panTo({ lat, lng });
  };

  const toggleSatelliteView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const nextView = !satelliteView;
    map.setMapTypeId(nextView ? google.maps.MapTypeId.SATELLITE : google.maps.MapTypeId.ROADMAP);
    setSatelliteView(nextView);
  };

  const handlePageChange = (_: any, page: number) => {
    setListDisplayItems(listOfLocations.slice((page - 1) * LIMIT, page * LIMIT));
  };
  

  return (
    <Layout>
      <div className="map-page-container">
        {startPos &&
          <MapPageFilters
            filters={filters}
            setFilters={setFilters}
            cluster={clusterRef.current}
          />
        }

        <div className="map-page">
          {!startPos ?
            <MapStartupScreen setStartPos={setStartPos} />
            :
            <>
              <div className="map-page__map">
                <div className="map-page__map-controls">
                  <button onClick={toggleSatelliteView}>
                    { satelliteView ? 'Map View' : 'Satellite View' }
                  </button>
                </div>

                <div ref={mapRef} className="map-page__map"></div>
              </div>
            
              <MapRightSide
                listDisplayItems={listDisplayItems}
                panTo={panTo}
                mapInstanceRef={mapInstanceRef}
                filteredLocations={listOfLocations}
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
