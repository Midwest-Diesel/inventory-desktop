interface Props {
  text: string
  type: string
}


export default function Tag({ text, type }: Props) {
  const getColor = () => {
    if (text === 'Keep Contact') return 'var(--red-3)';
    if (type === 'customer-type') return 'var(--yellow-2)';
    if (type === 'rank') return 'var(--green-1)';
    return 'white';
  };

  const color = getColor();


  return (
    <div className="tag" style={{ borderColor: color, color }}>
      <p>{ text }</p>
    </div>
  );
}
