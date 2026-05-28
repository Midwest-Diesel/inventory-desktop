import { getPartsByStockNum } from "../services/partsService";

export const commonPrefixLength = (a: string, b: string): number => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
};

export const getAddOnDateCode = (date = new Date()): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(2);
  return `${month}${year}-${day}`;
};

const letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
export const getNextStockNumberSuffix = async (stockNum: string, addOns: AddOn[]): Promise<string> => {
  const parts = await getPartsByStockNum(stockNum);
  const filteredAddOns = addOns.filter((a) => a.stockNum?.slice(0, a.stockNum.length - 1) === stockNum);
  const stockNumbers = [...parts.map((p) => p.stockNum), ...filteredAddOns.map((a) => a.stockNum)];
  if (stockNumbers.length === 0) return 'A';

  let latestStockNumIndex = letters.indexOf(stockNumbers[0]!.charAt(stockNumbers[0]!.length - 1));
  for (const num of stockNumbers) {
    const suffix = num!.charAt(num!.length - 1);
    const index = letters.indexOf(suffix);
    if (index > latestStockNumIndex) latestStockNumIndex = index;
  }
  return letters[latestStockNumIndex + 1];
};

export const getPartTypeFromDesc = (desc: string): string | null => {
  const value = desc.toLowerCase();
  
  if (value.includes('actuator')) return 'Actuator';
  if (value.includes('compressor')) return 'Air Compressor';
  if (value.includes('block')) return 'Block';
  if (value.includes('camshaft')) return 'Camshaft';
  if (value.includes('conn rod')) return 'Conn Rod';
  if (value.includes('crank')) return 'Crankshaft';
  if (value.includes('cyl')) return 'Cylinder Pack';
  if (value.includes('damper')) return 'Damper';
  if (value.includes('ecm')) return 'ECM';
  if (value.includes('elbow')) return 'Elbow';
  if (value.includes('exhaust manifold')) return 'Exhaust Manifold';
  if (value.includes('flywheel housing')) return 'Flywheel Housing';
  if (value.includes('flywheel')) return 'Flywheel';
  if (value.includes('front cover')) return 'Front Cover';
  if (value.includes('fuel pump cam')) return 'Fuel Pump Cam';
  if (value.includes('fuel pump')) return 'Fuel Pump';
  if (value.includes('gear')) return 'Gear';
  if (value.includes('head gasket')) return 'Head Gasket';
  if (value.includes('head')) return 'Head';
  if (value.includes('injector')) return 'Injector';
  if (value.includes('jake')) return 'Jake Brake';
  if (value.includes('oil cooler')) return 'Oil Cooler';
  if (value.includes('pan')) return 'Oil Pan';
  if (value.includes('oil pump')) return 'Oil Pump';
  if (value.includes('rocker arm')) return 'Rocker Arm';
  if (value.includes('turbo')) return 'Turbo';
  if (value.includes('valve cover riser')) return 'Valve Cover Riser';
  if (value.includes('valve cover')) return 'Valve Cover';
  if (value.includes('water pump')) return 'Water Pump';
  if (value.includes('bracket')) return 'Bracket';
  if (value.includes('adapter')) return 'Adapter';
  if (value.includes('starter')) return 'Starter';
  if (value.includes('alternator')) return 'Alternator';
  if (value.includes('filter')) return 'Filter';
  if (value.includes('valve')) return 'Valve';
  if (value.includes('seal')) return 'Seal';
  if (value.includes('ring')) return 'Ring';
  if (value.includes('kit')) return 'Kit';
  if (value.includes('connector')) return 'Connector';
  if (value.includes('motor mount')) return 'Motor Mount';
  if (value.includes('sensor')) return 'Sensor';
  if (value.includes('wire harness')) return 'Wire Harness';
  if (value.includes('exh manifold')) return 'Exh Manifold';
  if (value.includes('nozzle')) return 'Injector';
  if (value.includes('transfer pump')) return 'Transfer Pump';
  if (value.includes('pulley')) return 'Pulley';
  if (value.includes('bonnet')) return 'Bonnet';
  if (value.includes('piston')) return 'Piston';
  return null;
};
