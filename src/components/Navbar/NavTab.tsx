import Button from "../Library/Button";

interface Props {
  tab: Tab
  handleChangeTab: (id: number) => void
  handleDeleteTab: (id: number) => void
  setSelectedTab: (tab: Tab) => void
  closeBtnActive: boolean
}


export default function NavTab({ tab, handleChangeTab, handleDeleteTab, setSelectedTab, closeBtnActive }: Props) {
  return (
    <div className="navbar-tab" style={tab.selected ? { borderBottom: '2px solid var(--yellow-2)' } : {}}>
      <Button
        variant={['no-style']}
        className="navbar-tab__content"
        onClick={() => handleChangeTab(tab.id)}
        onContextMenu={() => setSelectedTab(tab)}
        data-tabid={tab.id}
        data-testid="tab"
      >
        { tab.name || tab.history[tab.urlIndex].name }
      </Button>

      {closeBtnActive &&
        <Button
          variant={['no-style', 'red-color']}
          className="navbar-tab__close-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteTab(tab.id);
          }}
        >
          ×
        </Button>
      }
    </div>
  );
}
