//Commit Update
const WarehouseDashboard = ({ inventoryRef, searchQueryLifted, user }) => {
    // State to track the active tab
    const [activeTab, setActiveTab] = useState('inventory');

    const setting = {
        inventoryRef,
        searchQueryLifted,
        user
    }
    // Function to handle tab click
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    // List of available sections for the tabs
    const tabs = [
        { name: 'inventory', label: 'Inventory Management', disable: true },
        { name: 'order', label: 'Order Management', disable: false },
        { name: 'shipment', label: 'Shipment & Receiving', disable: false },
        { name: 'performance', label: 'Warehouse Performance', disable: false },
        { name: 'safety', label: 'Safety & Compliance', disable: false },
        { name: 'workforce', label: 'Staff & Workforce Management', disable: false },
        { name: 'equipment', label: 'Equipment & Maintenance', disable: false },
        { name: 'technology', label: 'Warehouse Technology', disable: false },
    ];

    return (<>
        <div className="ui  small menu inverted  black stackable">
            {tabs.map((tab) => (
                tab.disable && <a
                    key={tab.name}
                    className={`item ${activeTab === tab.name ? 'active' : ''}`}
                    onClick={() => handleTabClick(tab.name)}
                >
                    {tab.label}
                </a>
            ))}
        </div>
        <div className="ui segment  black">


            {/* Warehouse Header Detail with dynamic section */}
            <WarehouseHeaderDetail
                imageSrc={"img/logo.jpg"}
                sectionType={activeTab} // Pass the active tab's name to WarehouseHeaderDetail
            />
            <WarehouseLowerMenu tab={[]} settings={setting} />
        </div></>
    );
};

