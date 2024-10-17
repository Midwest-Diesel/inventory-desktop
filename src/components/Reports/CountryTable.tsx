import Button from "../Library/Button";
import Table from "../Library/Table";

interface Props {
  setTableOpen: (open: boolean) => void
  data: CountryReport[]
  setReportsOpen: (open: boolean) => void
}


export default function CountryTable({ setTableOpen, data, setReportsOpen }: Props) {
  const handleGoBack = () => {
    setTableOpen(false);
    setReportsOpen(true);
  };


  return (
    <div className="reports-table">
      <Button onClick={handleGoBack}>Back</Button>
      <Table>
        <thead>
          <tr>
            
          </tr>
        </thead>
        <tbody>
          {data && data.map((row, i) => {
            return (
              <tr key={i}>
                
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
