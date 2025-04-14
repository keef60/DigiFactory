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
    selectedDepartment
}) => {

    return (
        <div class="ui mini  black inverted menu">

            <div class="header item">
                {`${departmentName.toUpperCase()}`}
            </div>
{/*             <a class="item browse ui">

                <div class="ui  dropdown item subNav">
                    <i class="icon bars"></i>
                    <OrderSubNavMenu
                        handleDepartmentClick={handleDepartmentClick}
                        setClearLoading={setClearLoading}
                        setLoginModalOpen={setLoginModalOpen}
                        userName={user}
                        selectedDepartment={selectedDepartment}
                        loginModalOpen={loginModalOpen}
                    />
                </div>
            </a> */}
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


            <div class="right menu">
                {<a class="item" href="#">

                    <i class="user icon"></i>
                    {user}
                </a>}
            </div>
        </div>
    );
}