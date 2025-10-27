
//Commit Update
const WarehouseLowerMenu = ({ tab,settings }) => {
  const [activeTab, setActiveTab] = useState('Warehouse/Area Identification');

  const noAccess = ()=>(<div class='ui message negative '>No Access</div>);
  // List of tabs based on the case content
  const tabs = [
    { name: 'Warehouse/Area Identification', 
      content: <><WarehouseItemMovementForm 
      inventoryRef={settings.inventoryRef} 
      searchQueryLifted={settings.searchQueryLifted}
      user={settings.user} 
       />
      </> },
    { name: 'Cycle Count Information', 
      content: <><WarehouseCycleCountForm 
      inventoryRef={settings.inventoryRef} 
      searchQueryLifted={settings.searchQueryLifted}
      user={settings.user} />
      </> },
    { name: 'Delivery Schedule', content: noAccess() },
    { name: 'Carrier Management', content: noAccess() },
  ];

  // Function to render the tabular menu
  const renderTabs = () => {
    return (
      <div className="ui top attached tabular menu stackable">
        {tabs.map((tab) => (
          <a
            key={tab.name}
            className={`item ${activeTab === tab.name ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.name}
          </a>
        ))}
      </div>
    );
  };

  // Function to render the content for the active tab
  const renderTabContent = () => {
    const activeTabContent = tabs.find((tab) => tab.name === activeTab).content;
    return (
      <div className="ui bottom attached segment">
        {activeTabContent}
      </div>
    );
  };

  return (
    <>
      <div className="ui  segment">
        {/* Render Tab Menu */}
        {renderTabs()}
        {/* Render Content for Active Tab */}
        {renderTabContent()}
      </div>
    </>
  );
};


