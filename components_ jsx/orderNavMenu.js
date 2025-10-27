const OrderNavMenu = ({
    setActiveTab,
    activeTab,
    departmentName,
    setSearchQuery,
    user,
    setSelectedNumber,
    selectedNumber,
    setLoginModalOpen,
    setClearLoading,
    loginModalOpen,
    handleDepartmentClick,
    selectedDepartment,
    setReload
}) => {
useEffect(()=>{
    setReload(prev => ({ ...prev, tab: activeTab }));

},activeTab)
    return (
        <div class="ui  segment basic">
            <div class="ui tiny stackable secondary menu">

                <div class="header item">
                    {`${departmentName.toUpperCase()}`}
                </div>

                {
                    departmentName === 'line' && <LineSelectionNew
                        selectedNumber={selectedNumber}
                        setSelectedNumber={setSelectedNumber}
                    />
                }

                <a
                    className={`item ${activeTab === 'item' ? 'active black' : ''}`}
                    onClick={() => setActiveTab('item')}
                >
                    Work Order
                </a>

                <a
                    className={`item ${activeTab === 'itemClosed' ? 'active black' : ''}`}
                    onClick={() => setActiveTab('itemClosed')}
                >
                   Closed Work Order
                </a>

                <a
                    className={`item ${activeTab === 'pickList' ? 'active black' : ''}`}
                    onClick={() => setActiveTab('pickList')}
                >
                    Material Picks
                </a>

                <a
                    className={`item ${activeTab === 'maintenanceRequest' ? 'active black' : ''}`}
                    onClick={() => setActiveTab('maintenanceRequest')}
                >
                    Maintenance
                </a>

                <a
                    className={`item ${activeTab === 'inventory' ? 'active black' : ''}`}
                    onClick={() => setActiveTab('inventory')}
                >
                    Inventory
                </a>

            </div>
        </div>
    );
}
