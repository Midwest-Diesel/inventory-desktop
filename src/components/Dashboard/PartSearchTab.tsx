import Button from "../library/Button";

interface Props {
  tab: PartSearchTab
  onClickCloseTab: (id: number) => void
  onClickSelectTab: (id: number) => void
  showCloseBtn: boolean
}


export default function PartSearchTab({ tab, onClickCloseTab, onClickSelectTab, showCloseBtn }: Props) {
  return (
    <div className="part-search-tab">
      <Button
        variant={['no-style']}
        className={`part-search-tab__content${tab.selected ? ' part-search-tab__content--selected' : ''}`}
        onClick={() => onClickSelectTab(tab.id)}
      >
        { tab.name }
      </Button>

      {showCloseBtn &&
        <Button
          variant={['no-style', 'red-color']}
          className="part-search-tab__close-btn"
          onClick={() => onClickCloseTab(tab.id)}
        >
          x
        </Button>
      }
    </div>
  );
}
