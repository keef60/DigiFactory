const { useEffect, useRef, useState } = React

const OrderDisplayPane = ({
    selectedDepartment,
    departmentName,
    spMethod,
    selectedNumber,
    setSelectedNumber,
    clearLoading,
    setWOnDev,
    woNdev,
    issesListData,
    setSearchQuery,
    setFilterTask,
    filterTask,
    inventoryDepartmentName,
    inventoryRef,
    user

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
                user={user} />
        )
    };

    return (
        <div style={{ position: 'center', marginLeft: '5%', width: '100%' }}>

            <OrderNavMenu
                setActiveTab={setActiveTab}
                activeTab={activeTab}
                departmentName={departmentName}
                setSearchQuery={setSearchQuery}
                user={user}
            />

            <div className={`ui bottom segment basic ${clearLoading ? 'ui active centered  loader' : ''}`}>
                {tabContent[activeTab]} {/* Render content based on the active tab */}
            </div>
        </div>
    );
};


