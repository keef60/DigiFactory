const OrderNavMenu = ({ setActiveTab, activeTab,departmentName,setSearchQuery }) => {
    return (
       
            <div class="ui mini inverted black menu">
                <a
                    className={`item ${activeTab === 'item' ? 'active black' : ''}`}
                    onClick={() => setActiveTab('item')}
                >
                    Orders
                </a>

                <a
                    className={`item ${activeTab === 'pickList' ? 'active black' : ''}`}
                    onClick={() => setActiveTab('pickList')}
                >
                    Pick List
                </a>

                <a
                    className={`item ${activeTab === 'maintenanceRequest' ? 'active black' : ''}`}
                    onClick={() => setActiveTab('maintenanceRequest')}
                >
                    Maintenance Request
                </a>

                <a
                    className={`item ${activeTab === 'inventory' ? 'active black' : ''}`}
                    onClick={() => setActiveTab('inventory')}
                >
                    Inventory 
                </a>

                <a
                    className={`item  disabled `}
                >
                    Print Labels
                </a>
                <div class="right menu">
                   
                    <MiniSearch
                    searchThisClass={`displayPaneNewBar-${departmentName}`}
                    showMiniSearchOnlyBool={true}
                    inventoryRef={[]}
                    setSearchQuery={setSearchQuery} />
                   
                    <a class="item" href="#">
                        <i class="user icon"></i>
                    </a>
                </div>
            </div>
   
    )
}