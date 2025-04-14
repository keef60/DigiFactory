const OrderDisplayPane = ({
    selectedDepartment,
    departmentName,
    selectedNumber,
    setSelectedNumber,
    clearLoading,
    setWOnDev,
    issesListData,
    setSearchQuery,
    setFilterTask,
    filterTask,
    inventoryDepartmentName,
    inventoryRef,
    user,
    setLoginModalOpen,
    setClearLoading,
    loginModalOpen,
    handleDepartmentClick

}) => {
    const [activeTab, setActiveTab] = useState('item'); // default to "Look Up" tab
    console.log('display Pane', departmentName);
    const setting = { report: false }
    const tabContent = {
        pickList: (
            <OrderPickList
                selectedDepartment={selectedDepartment}
                departmentName={departmentName}
                selectedNumber={selectedNumber}
                setWOnDev={setWOnDev}
            />
        ),
        item: (
            <ItemWorkOrderDash
                selectedDepartment={selectedDepartment}
                departmentName={departmentName}
                selectedNumber={selectedNumber}
                setWOnDev={setWOnDev}
                setSelectedNumber={setSelectedNumber}
                user={user}
                issesListData={issesListData}
            />
        ),
        inventory: (
            <OrderInventoryLookup
                selectedDepartment={selectedDepartment}
                departmentName={inventoryDepartmentName}
                inventoryRef={inventoryRef}
                settings={setting}
                setSearchQuery={setSearchQuery}
            />
        ),
        maintenanceRequest: (
            <OrderMaintenanceRequest
                issuesListData={issesListData}
                department={departmentName}
                user={user}
            />
        )
    };

    return (
        <div style={{/*  position: 'center', marginLeft: '5%', width: '100%'  */}}>

            <div className={`ui bottom segment basic ${clearLoading ? 'ui active centered  loader' : ''}`}>

                <OrderNavMenu
                    setActiveTab={setActiveTab}
                    activeTab={activeTab}
                    departmentName={departmentName}
                    setSearchQuery={setSearchQuery}
                    user={user}
                    selectedNumber={selectedNumber}
                    setSelectedNumber={setSelectedNumber}
                    setLoginModalOpen={setLoginModalOpen}
                    setClearLoading={setClearLoading}
                    loginModalOpen={loginModalOpen}
                    handleDepartmentClick={handleDepartmentClick}
                />
                {tabContent[activeTab]} {/* Render content based on the active tab */}
            </div>
        </div>
    );
};


