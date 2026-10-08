import { useQuery } from "@tanstack/react-query";
import Button from "../library/Button";
import Input from "../library/Input";
import Select from "../library/select/Select";
import { getAllUsers } from "@/scripts/services/accountService";
import { getMapTopCustomers } from "@/scripts/services/mapService";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

interface Props {
  filters: MapFilters
  setFilters: (filters: MapFilters) => void
  cluster: MarkerClusterer | null
  listOfLocations: MapLocation[]
  setFilteredLocations: (locations: MapLocation[]) => void
  handleFilters: (locations: MapLocation[]) => void
}


export default function MapPageFilters({ filters, setFilters, cluster, listOfLocations, setFilteredLocations, handleFilters }: Props) {
  const { data: usersList = [] } = useQuery<User[]>({
    queryKey: ['usersList'],
    queryFn: getAllUsers
  });

  const onClickClearFilters = () => {
    cluster?.clearMarkers();
    setFilters({
      name: '',
      type: 'all',
      customerType: 'all',
      salesman: 'all'
    });
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


  return (
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
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <Select
          variant={['label-stack', 'label-bold']}
          label="Type"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value as 'all' | 'customer' | 'vendor' })}
        >
          <option>all</option>
          <option>customer</option>
          <option>vendor</option>
        </Select>
        <Select
          variant={['label-stack', 'label-bold']}
          label="Customer Type"
          value={filters.customerType}
          onChange={(e) => setFilters({ ...filters, customerType: e.target.value })}
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
          value={filters.salesman}
          onChange={(e) => setFilters({ ...filters, salesman: e.target.value })}
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
  );
}
