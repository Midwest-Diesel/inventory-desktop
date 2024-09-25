import Image from "next/image";

interface Props {
  size?: number
}


export default function Loading({ size = 50 }: Props) {
  return <center><Image src="/images/loading/loading-spinner.svg" alt="Loading" width={size} height={size} /></center>;
}
