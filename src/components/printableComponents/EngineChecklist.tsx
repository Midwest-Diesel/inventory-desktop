const categories = [
  'VC PULLED',
  'TURB INSP',
  'INTKE INSP',
  'PAN PULL',
  'CYL WALLS INSP',
  'BARS 360',
  'S/N OFF',
  'S/N TAG NEW',
  'OIL DRAINED CHK'
];

export default function EngineChecklist() {
  return (
    <div className="engine-checklist">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>YES</th>
            <th>INSP. BY</th>
            <th>COND</th>
            <th>PICS</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c, i) => {
            return (
              <tr key={i}>
                <th>{ c }</th>
                <td><span></span></td>
                <td><span></span></td>
                <td><span></span></td>
                <td><span></span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
