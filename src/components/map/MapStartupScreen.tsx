import { stateCoords, states } from "@/scripts/logic/map";
import Button from "../library/Button";
import Select from "../library/select/Select";

interface Props {
  setStartPos: (location: GeoCoord) => void
}


export default function MapStartupScreen({ setStartPos }: Props) {
  return (
    <div className="map-startup-screen">
      <h2>Pick Starting Location</h2>
      
      <div className="map-startup-screen__options">
        <Button onClick={() => setStartPos({ lat: 0, lng: 0 })}>Global</Button>

        <Select
          variant={['label-bold', 'label-stack']}
          label="US State"
          onChange={(e) => setStartPos(e.target.value ? JSON.parse(e.target.value) : null)}
        >
          <option value="">-- STATE --</option>
          {states.map((state) => {
            return (
              <option key={state} value={JSON.stringify(stateCoords[state])}>{ state }</option>
            );
          })}
        </Select>
      </div>
    </div>
  );
}
