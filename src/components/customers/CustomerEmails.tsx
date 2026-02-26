import Table from "../library/Table";

interface Props {
  emails: string[]
}


export default function CustomerEmails({ emails }: Props) {
  return (
    <Table>
      <tbody>
        {emails.map((email, i) => {
          return (
            <tr key={i}>
              <td>{ email }</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
