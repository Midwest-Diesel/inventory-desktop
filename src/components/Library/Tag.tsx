interface Props {
  text: string
}


export default function Tag({ text }: Props) {
  const getColor = () => {
    switch (text) {
      case 'Keep Contact':
        return 'var(--red-3)';
      default:
        return 'white';
    }
  };

  const color = getColor();


  return (
    <div className="tag" style={{ borderColor: color, color }}>
      <p>{ text }</p>
    </div>
  );
}
