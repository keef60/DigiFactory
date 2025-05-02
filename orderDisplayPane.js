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
    handleDepartmentClick,
    gpDataInput,
    setReload,
    reload

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
                setReload={setReload}
                user={user}
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
                inventoryRef={inventoryRef}
                gpDataInput={gpDataInput}
                reload={reload}
                setReload={setReload}
            />
        ),
        itemClosed: (
            <ItemWorkOrderDashClosed
                selectedDepartment={selectedDepartment}
                departmentName={departmentName}
                selectedNumber={selectedNumber}
                setWOnDev={setWOnDev}
                setSelectedNumber={setSelectedNumber}
                user={user}
                issesListData={issesListData}
                inventoryRef={inventoryRef}
                gpDataInput={gpDataInput}
                reload={reload}
                setReload={setReload}
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
                 <div className='ui segment'> <h1 className="ui header medium " >
                    Production Queue
                </h1>   </div>
            <div className={`ui bottom   ${clearLoading ? 'ui active centered  loader' : ''}`}>

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
                    setReload={setReload}
                />
        
                {tabContent[activeTab]} {/* Render content based on the active tab */}
            </div>
        </div>
    );
};


