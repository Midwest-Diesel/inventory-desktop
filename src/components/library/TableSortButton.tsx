import Button from "./Button";

interface Props {
  sorter: Sorter
  onClick: (sorter: Sorter) => void
}


export default function TableSortButton({ sorter, onClick }: Props) {
  const icon = () => {
    if (sorter === 'asc') return 'arrow-up-filter.svg';
    if (sorter === 'desc') return 'arrow-down-filter.svg';
    return 'sort.svg';
  };


  return (
    <Button
      style={{ margin: 'auto auto 0 0.3rem', verticalAlign: 'middle' }}
      variant={['no-style']}
      onClick={() => onClick(sorter === 'asc' ? 'desc' : sorter === 'desc' ? null : 'asc')}
    >
      <img
        alt="Filter button"
        src={`/images/icons/${icon()}`}
        width={sorter ? '15px' : '10px'}
      />
    </Button>
  );
}
