import { useQuery } from "@tanstack/react-query";
import Button from "../library/Button";
import Input from "../library/Input";
import Select from "../library/select/Select";
import { getAllUsers } from "@/scripts/services/accountService";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { FormEvent, useState } from "react";

interface Props {
  filters: MapFilters
  setFilters: (filters: MapFilters) => void
  cluster: MarkerClusterer | null
}


export default function MapPageFilters({ filters, setFilters, cluster }: Props) {
  const [search, setSearch] = useState(filters.name);

  const { data: usersList = [] } = useQuery<User[]>({
    queryKey: ['usersList'],
    queryFn: getAllUsers
  });

  const onClickClearFilters = () => {
    cluster?.clearMarkers();
    setSearch('');
    setFilters({
      name: '',
      type: 'all',
      customerType: 'all',
      salesman: 'all',
      ranking: null
    });
  };

  const onSubmitSearch = (e: FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, name: search });
  };


  return (
    <form className="map-page-filters" onSubmit={onSubmitSearch}>
      <div className="map-page-filters__inputs">
        <Input
          variant={['label-bold', 'label-stack']}
          label="Search Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
        <Button onClick={onClickClearFilters}>Clear Filters</Button>
        <br />
        
        <Button onClick={() => setFilters({ ...filters, ranking: 'value' })}>Top 100 by Sales Value</Button>
        <Button onClick={() => setFilters({ ...filters, ranking: 'qty' })}>Top 100 by Sales Qty</Button>
      </div>
    </form>
  );
}
