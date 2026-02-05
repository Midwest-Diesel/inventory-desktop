import { Layout } from "@/components/Layout";
import Button from "@/components/library/Button";
import Loading from "@/components/library/Loading";
import Pagination from "@/components/library/Pagination";
import Table from "@/components/library/Table";
import Link from "@/components/library/Link";
import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { addVendor, searchVendors, VendorSearch } from "@/scripts/services/vendorsService";
import Input from "@/components/library/Input";
import { prompt } from "@/components/library/Prompt";


const LIMIT = 40;

export default function Vendors() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchData, setSearchData] = useState<VendorSearch>({ name: '', offset: 0, limit: LIMIT });
  const [nameSearch, setNameSearch] = useState('');

  const { data: vendors, refetch, isFetching } = useQuery<VendorRes | null>({
    queryKey: ['vendors', currentPage, searchData],
    queryFn: async () => {
      return await searchVendors({
        ...searchData,
        offset: (currentPage - 1) * LIMIT
      });
    }
  });

  const handleChangePage = (_: any, page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };

  const onClickNewVendor = async () => {
    const name = await prompt('Vendor Name');
    if (!name) {
      alert('Name cannot be empty');
      return;
    }
    await addVendor(name);
    refetch();
  };

  const handleNameSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearchData({ ...searchData, name: nameSearch });
  };


  return (
    <Layout title="Vendors">
      <div className="vendors__container">
        <div className="vendors">
          <h1>Vendors</h1>
          <div className="vendors__top-buttons">
            <form onSubmit={handleNameSearch}>
              <Input
                variant={['label-stack', 'label-bold']}
                label="Search Name"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
              />
            </form>
            <Button onClick={onClickNewVendor} data-testid="new-btn">New</Button>
          </div>

          { isFetching && <Loading /> }
          
          {vendors &&
            <>
              <div className="vendors__table-container">
                <Table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Address</th>
                      <th>City</th>
                      <th>State</th>
                      <th>Zip</th>
                      <th>Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.rows.map((vendor: Vendor) => {
                      return (
                        <tr key={vendor.id}>
                          <td>
                            <Link href={`/vendors/${vendor.id}`} data-testid="vendor-link">
                              { vendor.name }
                            </Link>
                          </td>
                          <td>{ vendor.vendorAddress }</td>
                          <td>{ vendor.vendorCity }</td>
                          <td>{ vendor.vendorState }</td>
                          <td>{ vendor.vendorZip }</td>
                          <td>{ vendor.vendorContact }</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
              <Pagination
                data={vendors.rows}
                setData={handleChangePage}
                pageCount={vendors.pageCount}
                pageSize={LIMIT}
              />
            </>
          }
        </div>
      </div>
    </Layout>
  );
}
