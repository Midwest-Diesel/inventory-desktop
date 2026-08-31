interface Props {
  size?: number
}


export default function Loading({ size = 50 }: Props) {
  return (
    <img
      style={{ userSelect: 'none',display: 'block', margin: '0 auto' }}
      className="loading"
      src="/images/loading/loading-spinner.svg"
      alt="Loading"
      width={size}
      height={size}
    />
  );
}
