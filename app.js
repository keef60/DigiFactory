

const { useState, useEffect, useRef } = React;
/* const { createRoot } = ReactDOM;
const {
    BrowserRouter,
    Routes,
    Route,
    Link,
} = ReactRouterDOM; */

function DepartmentMenu() {

    const [selectedDepartment, setSelectedDepartment] = useState('Home');
    // State for handling search query
    const [searchQueryLifted, setSearchQuery] = useState('');
    // State for controlling the visibility of the save warning message
    const [visibleLifted, setVisible] = useState(false);
    const [dataLifted, setData] = useState([]);
    const [sheetNameLifted, setSheetName] = useState('');
    const [tableData, setTableData] = useState(null);
    const [packoutTableData, setPackoutTableData] = useState(null);
    const [tableHeaders, setHeaders] = useState([
        ["Model", "Description", "All of packout kits", "Oil", "Gun", "Lance", "Soap Hose / Filter", "knob bolts", "Hose", "Hose Hanger", "Gun Holder"],
        ['Model #', 'Frame Color', 'Raw Frame', 'Frame #', 'Frame Description', 'Raw Handle', 'Handle', 'Handle Description', 'Raw 2nd Handle', '2nd Handle', '2nd Handle Description']
    ])
    // State to store the selected number
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [loginModalOpen, setLoginModalOpen] = useState(false); // State to control login modal visibility
    const [clearLoading, setClearLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(undefined);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [woNdev, setWOnDev] = useState();
    const [userName, setUserName] = useState(undefined);
    const [newError, setError] = useState();
    const [issesListData, setIssesListData] = useState([]);
    const inventoryRef = useRef([]);
    const [inventory, setInventory] = useState(undefined);

    const [toggleFilter, setToggleFilter] = useState(true);
    const [filterBtnName, setFilterBtnName] = useState('Hide Weekly Orders');
    const [quickVeiw, setQuickVeiw] = useState(true);
    const [quickVeiwTitle, setQuickVeiwTitle] = useState('Expand Details');
    const departmentRefName = selectedDepartment
    const [filterTask, setFilterTask] = useState(false);
    const [gpDataInput, setGpDataInput] = useState({reports:[],materialsPicks:[]});
    const [throttle, setThrottle] = useState(true);
    const [reload, setReload] = useState({ status: false, tab: '' });

    
    
    useEffect(() => {
        const interval = setInterval(() => {
            setReload({ status: true });
        }, 30 * 1000); // 30 seconds
    
        return () => clearInterval(interval);
    }, [reload]);

    useEffect(() => {

        if (reload.tab === 'logout') {
            setUserName(undefined);
            setSelectedDepartment('Home');
        }

    }, [[reload]]);
    useEffect(() => {
        try {

            if (throttle) {

                main.fetchSharePointData('PICKLIST', 'load').then(e => {
                    if (e.value.length === 0) {
                        console.log('PICKLIST array is 0');
                        setThrottle(false);
                    } else if (gpDataInput.materialsPicks.length === 0 || reload.status) {
                        console.log('PICKLIST FOUND')
                        setGpDataInput(prev=>({...prev, materialsPicks:e.value}));
                    };
                });

                main.fetchSharePointData('REPORTS', 'load').then(e => {
                    if (e.value.length === 0) {
                        console.log('REPORTS array is 0');
                        setThrottle(false);
                    } else if (gpDataInput.reports.length === 0 || reload.status) {
                        console.log('REPORTS FOUND',e.value)
                        setGpDataInput(prev=>({...prev, reports:e.value}));

                    };
                });
            }
        } catch (error) {
            console.warn(error)
        }

    }, [reload]);

    useEffect(() => {
        $('.ui.login.dimmer').dimmer('hide');
        getMe();
    }, [userInfo, isLoggedIn, newError,reload]);

    useEffect(() => {

        const stock = async () => {

            await main.fetchSharePointData("Inventory", "inventory", false)
                .then(e => {
                    inventoryRef.current = e;
                    setInventory(e)
                })
                .catch(err => {
                    setError(err);
                    console.log('================> STOCK ERROR', err);
                });
        };

        stock();

    }, [userInfo,reload]);

    useEffect(() => {
        const r = async () => {

            await main.fetchSharePointData('IssueList', 'issues')
                .then((e) => {
                    const fields = e.value[0].fields;

                    // Save the data into the refs
                    setIssesListData(fields);

                }).catch(err => {
                    setError(err);
                    console.log('================> STOCK ERROR', err);
                });
        }
        if (issesListData.length === 0) {
            r().then((e) => e).catch(er => setError(error))

        };
    }, [issesListData,reload]);

    useEffect(() => {
        if (!tableData) {

            main.fetchSharePointData('FRAMETABLE', 'all', true, setTableData, '')
                .then(e => e)
                .catch(err => setError(err))

            main.fetchSharePointData('PACKOUTTABLE', 'all', true, '', setPackoutTableData)
                .then(e => e)
                .catch(err => setError(err));


        } else if (dataLifted.length === 0 && Array.isArray(tableData) && selectedDepartment !== 'Packout') {

            let table = [tableHeaders[1]];
            let arry = [];
            for (let t of tableData) {
                arry = [t.fields.Title];
                for (let i = 1; i <= 10; i++) {
                    arry.push(t.fields[`field_${i}`]);
                }
                table.push(arry);
            }
            setData(table);
            setClearLoading(false);


        } else if (dataLifted.length === 0 && Array.isArray(packoutTableData) && selectedDepartment === 'Packout') {
            let table = [tableHeaders[0]];
            let arry = [];
            for (let t of packoutTableData) {
                arry = [t.fields.Title];
                for (let i = 2; i <= 9; i++) {
                    arry.push(t.fields[`field_${i}`]);
                }
                table.push(arry);
            }
            setData(table);
            setClearLoading(false);
        }
    }, [tableData, packoutTableData, selectedDepartment,reload]);

    useEffect(() => {
        if (userInfo) {
            setUserName(userInfo.displayName);
        }
    }, [userInfo,reload]);

    useEffect(() => {
        if (filterTask) {
            $('.ui.sidebar')
                .sidebar('setting', 'transition', 'overlay',)
                .sidebar('show');
        }
    }, [filterTask]);

    useEffect(() => {
        $('.ui.dropdown.selection')
            .dropdown()
            ;
    })

    const getMe = async () => {
        const accessToken = sessionStorage.getItem('access_token');

        if (!userInfo && accessToken) {
            fetch("https://graph.microsoft.com/v1.0/me", {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
                .then(response => response.json())
                .then(data => { setUserInfo(data); setIsLoggedIn(true); })
                .catch(error => {
                    setIsLoggedIn(false);
                    setError(error);
                    console.log(' getME()======================>', error)
                });
        }
    };

    const handleDepartmentClick = (department) => {
        setData([]);
        setSelectedDepartment(department);
    };

    const contentMasterSeletor = (selectedDepartmentListName, departmentName) => {
        return (
            departmentName === 'line' ?
                <LinesEditorNew
                    spMethod={main}
                    selectedDepartment={selectedDepartmentListName}
                    departmentName={departmentName}
                    searchQueryLifted={searchQueryLifted}
                    visibleLifted={visibleLifted}
                    dataLifted={dataLifted}
                    sheetNameLifted={sheetNameLifted}
                    setSelectedNumber={setSelectedNumber}
                    selectedNumber={selectedNumber}
                    clearLoading={clearLoading}
                    setWOnDev={setWOnDev}
                    woNdev={woNdev}
                    issesListData={issesListData}
                    setSearchQuery={setSearchQuery}
                    setError={setError}
                    setFilterTask={setFilterTask}
                    filterTask={filterTask}
                    inventoryDepartmentName={['inventory', 'inventory']}
                    inventoryRef={inventory}
                    user={userName}
                    gpDataInput={gpDataInput}
                    setClearLoading={setClearLoading}
                    setLoginModalOpen={setLoginModalOpen}
                    handleDepartmentClick={handleDepartmentClick}
                    loginModalOpen={loginModalOpen}
                    setReload={setReload}
                    reload={reload}



                /> :
                <Editor
                    spMethod={main}
                    selectedDepartment={selectedDepartmentListName}
                    departmentName={departmentName}
                    searchQueryLifted={searchQueryLifted}
                    visibleLifted={visibleLifted}
                    dataLifted={dataLifted}
                    sheetNameLifted={sheetNameLifted}
                    setSelectedNumber={setSelectedNumber}
                    selectedNumber={selectedNumber}
                    clearLoading={clearLoading}
                    setWOnDev={setWOnDev}
                    woNdev={woNdev}
                    issesListData={issesListData}
                    setSearchQuery={setSearchQuery}
                    setFilterTask={setFilterTask}
                    filterTask={filterTask}
                    inventoryDepartmentName={['inventory', 'inventory']}
                    inventoryRef={inventory}
                    user={userName}
                    setClearLoading={setClearLoading}
                    setLoginModalOpen={setLoginModalOpen}
                    handleDepartmentClick={handleDepartmentClick}
                    loginModalOpen={loginModalOpen}
                    gpDataInput={gpDataInput}
                    setReload={setReload}
                    reload={reload}

                />
        )
    };

    const taskData = [
        {
          "timestamp": "2025-04-29T21:28:31.309Z",
          "taskId": 1745961972359,
          "taskName": "HANDLES Assembly",
          "employee": "Keith Carter",
          "action": "start",
          "department": "FRAMES",
          "workCenter": "026",
          "realDurationAtAction": 0,
          "statusAfterAction": "In Progress",
          "workOrderID": "WO - 00364434-04"
        },
        {
          "timestamp": "2025-04-29T21:28:36.702Z",
          "taskId": 1745962029813,
          "taskName": "PACKOUT Assembly",
          "employee": "Keith Carter",
          "action": "start",
          "department": "FRAMES",
          "workCenter": "026",
          "realDurationAtAction": 0,
          "statusAfterAction": "In Progress",
          "workOrderID": "WO - 00364434-03"
        },
        {
          "timestamp": "2025-04-29T21:28:41.030Z",
          "taskId": 1745961972875,
          "taskName": "HANDLES Assembly",
          "employee": "Keith Carter",
          "action": "start",
          "department": "FRAMES",
          "workCenter": "026",
          "realDurationAtAction": 0,
          "statusAfterAction": "In Progress",
          "workOrderID": "WO - 00364434-03"
        },
        {
          "timestamp": "2025-04-29T21:28:43.877Z",
          "taskId": 1745962030317,
          "taskName": "PACKOUT Assembly",
          "employee": "Keith Carter",
          "action": "start",
          "department": "FRAMES",
          "workCenter": "026",
          "realDurationAtAction": 0,
          "statusAfterAction": "In Progress",
          "workOrderID": "WO - 00364434-04"
        },
        {
          "timestamp": "2025-04-29T21:28:45.773Z",
          "taskId": 1745962079501,
          "taskName": "FRAMES Assembly",
          "employee": "Keith Carter",
          "action": "start",
          "department": "FRAMES",
          "workCenter": "026",
          "realDurationAtAction": 0,
          "statusAfterAction": "In Progress",
          "workOrderID": "WO - 00364434-03"
        },
        {
          "timestamp": "2025-04-29T21:28:48.470Z",
          "taskId": 1745962079998,
          "taskName": "FRAMES Assembly",
          "employee": "Keith Carter",
          "action": "start",
          "department": "FRAMES",
          "workCenter": "026",
          "realDurationAtAction": 0,
          "statusAfterAction": "In Progress",
          "workOrderID": "WO - 00364434-02"
        },
        {
          "timestamp": "2025-04-29T21:29:50.872Z",
          "taskId": 1745961972875,
          "taskName": "HANDLES Assembly",
          "employee": "Keith Carter",
          "action": "pause",
          "department": "FRAMES",
          "workCenter": "026",
          "realDurationAtAction": 0,
          "statusAfterAction": "Paused",
          "workOrderID": "WO - 00364434-03",
          "pauseReason": "Material delay"
        },
        {
          "timestamp": "2025-04-29T21:29:58.815Z",
          "taskId": 1745962030317,
          "taskName": "PACKOUT Assembly",
          "employee": "Keith Carter",
          "action": "pause",
          "department": "FRAMES",
          "workCenter": "026",
          "realDurationAtAction": 0,
          "statusAfterAction": "Paused",
          "workOrderID": "WO - 00364434-04",
          "pauseReason": "Operator error"
        },
        {
          "timestamp": "2025-04-29T21:30:01.479Z",
          "taskId": 1745962079501,
          "taskName": "FRAMES Assembly",
          "employee": "Keith Carter",
          "action": "stop",
          "department": "FRAMES",
          "workCenter": "026",
          "realDurationAtAction": 75,
          "statusAfterAction": "Completed",
          "workOrderID": "WO - 00364434-03"
        },
        {
          "timestamp": "2025-04-29T21:34:32.189Z",
          "taskId": 1745961972875,
          "taskName": "HANDLES Assembly",
          "employee": "Keith Carter",
          "action": "start",
          "department": "PACKOUT",
          "workCenter": "026",
          "realDurationAtAction": 0,
          "statusAfterAction": "In Progress",
          "workOrderID": "WO - 00364434-03"
        },
        {
          "timestamp": "2025-04-29T21:34:34.445Z",
          "taskId": 1745962030317,
          "taskName": "PACKOUT Assembly",
          "employee": "Keith Carter",
          "action": "start",
          "department": "PACKOUT",
          "workCenter": "026",
          "realDurationAtAction": 0,
          "statusAfterAction": "In Progress",
          "workOrderID": "WO - 00364434-04"
        },
        {
          "timestamp": "2025-04-29T21:34:41.670Z",
          "taskId": 1745962079998,
          "taskName": "FRAMES Assembly",
          "employee": "Keith Carter",
          "action": "pause",
          "department": "PACKOUT",
          "workCenter": "026",
          "realDurationAtAction": 0,
          "statusAfterAction": "Paused",
          "workOrderID": "WO - 00364434-02",
          "pauseReason": "Machine issue"
        },
        {
          "timestamp": "2025-04-29T21:34:43.389Z",
          "taskId": 1745961972875,
          "taskName": "HANDLES Assembly",
          "employee": "Keith Carter",
          "action": "stop",
          "department": "PACKOUT",
          "workCenter": "026",
          "realDurationAtAction": 11,
          "statusAfterAction": "Completed",
          "workOrderID": "WO - 00364434-03"
        },
        {
          "timestamp": "2025-04-29T21:34:49.286Z",
          "taskId": 1745961972359,
          "taskName": "HANDLES Assembly",
          "employee": "Keith Carter",
          "action": "stop",
          "department": "PACKOUT",
          "workCenter": "026",
          "realDurationAtAction": 377,
          "statusAfterAction": "Completed",
          "workOrderID": "WO - 00364434-04"
        },
        {
          "timestamp": "2025-04-29T21:34:56.966Z",
          "taskId": 1745962029813,
          "taskName": "PACKOUT Assembly",
          "employee": "Keith Carter",
          "action": "pause",
          "department": "PACKOUT",
          "workCenter": "026",
          "realDurationAtAction": 0,
          "statusAfterAction": "Paused",
          "workOrderID": "WO - 00364434-03",
          "pauseReason": "Break"
        },
        {
          "timestamp": "2025-04-29T21:35:00.189Z",
          "taskId": 1745962030317,
          "taskName": "PACKOUT Assembly",
          "employee": "Keith Carter",
          "action": "pause",
          "department": "PACKOUT",
          "workCenter": "026",
          "realDurationAtAction": 0,
          "statusAfterAction": "Paused",
          "workOrderID": "WO - 00364434-04",
          "pauseReason": "Break"
        },
        {
          "timestamp": "2025-04-29T21:35:52.759Z",
          "taskId": 1745962029813,
          "taskName": "PACKOUT Assembly",
          "employee": "Keith Carter",
          "action": "start",
          "department": "HANDLES",
          "workCenter": "026",
          "realDurationAtAction": 0,
          "statusAfterAction": "In Progress",
          "workOrderID": "WO - 00364434-03"
        },
        {
          "timestamp": "2025-04-29T21:35:55.639Z",
          "taskId": 1745962030317,
          "taskName": "PACKOUT Assembly",
          "employee": "Keith Carter",
          "action": "start",
          "department": "HANDLES",
          "workCenter": "026",
          "realDurationAtAction": 0,
          "statusAfterAction": "In Progress",
          "workOrderID": "WO - 00364434-04"
        },
        {
          "timestamp": "2025-04-29T21:36:04.839Z",
          "taskId": 1745962079998,
          "taskName": "FRAMES Assembly",
          "employee": "Keith Carter",
          "action": "start",
          "department": "FRAMES",
          "workCenter": "026",
          "realDurationAtAction": 0,
          "statusAfterAction": "In Progress",
          "workOrderID": "WO - 00364434-02"
        },
        {
          "timestamp": "2025-04-29T21:36:23.792Z",
          "taskId": 1745962029813,
          "taskName": "PACKOUT Assembly",
          "employee": "Keith Carter",
          "action": "stop",
          "department": "FRAMES",
          "workCenter": "026",
          "realDurationAtAction": 31,
          "statusAfterAction": "Completed",
          "workOrderID": "WO - 00364434-03"
        },
        {
          "timestamp": "2025-04-29T21:36:27.881Z",
          "taskId": 1745962030317,
          "taskName": "PACKOUT Assembly",
          "employee": "Keith Carter",
          "action": "stop",
          "department": "FRAMES",
          "workCenter": "026",
          "realDurationAtAction": 32,
          "statusAfterAction": "Completed",
          "workOrderID": "WO - 00364434-04"
        },
        {
          "timestamp": "2025-04-29T21:36:31.416Z",
          "taskId": 1745962079998,
          "taskName": "FRAMES Assembly",
          "employee": "Keith Carter",
          "action": "stop",
          "department": "FRAMES",
          "workCenter": "026",
          "realDurationAtAction": 26,
          "statusAfterAction": "Completed",
          "workOrderID": "WO - 00364434-02"
        }
      ]

    const renderContent = () => {
        switch (selectedDepartment) {
            case 'Home': return (<HomeScreen />)

            case 'Paint':
                return (
                    contentMasterSeletor("FRAMES KIT", 'frames')
                )
            case 'Packout':
                return (
                    contentMasterSeletor("PACKOUT KIT", 'packout')
                )
            case 'Handles':
                return (
                    contentMasterSeletor("HANDLE KIT", 'handles')
                )
            case 'Frames':
                return (
                    contentMasterSeletor("FRAME KIT", 'frames')
                )
            case 'Lines':
                return (
                    contentMasterSeletor("LINES KIT", 'line')
                )

            case 'Maintenance': return (
                <MaintenanceDashboard user={userName} />
            );

            case 'Inventory':
                const setting = { report: false }

                return (

                    <InventoryLookup
                        spMethod={main}
                        selectedDepartment="Inventory"
                        departmentName={['inventory', 'inventory']}
                        searchQueryLifted={searchQueryLifted}
                        inventoryRef={inventory}
                        setError={setError}
                        clearLoading={clearLoading}
                        settings={setting}
                        setSearchQuery={setSearchQuery}
                    />

                );

            case 'Warehouse':

                return (
                    <WarehouseDashboard
                        inventoryRef={inventory}
                        searchQueryLifted={searchQueryLifted}
                        user={userName}
                    />


                );

            case 'Inventory Levels':
                const settings = { report: true }
                return (

                    <InventoryLookup
                        spMethod={main}
                        selectedDepartment="Inventory"
                        departmentName={['inventory', 'inventory']}
                        searchQueryLifted={searchQueryLifted}
                        inventoryRef={inventory}
                        setError={setError}
                        clearLoading={clearLoading}
                        settings={settings}
                    />

                );

            case 'Daily Production Overview': return (
                <DailyProductionOverview />
            );

            case 'Inventory Levels': return (
                <InventoryLevels />
            );

            case 'Maintenance Status': return (
                <MaintenanceStatus />
            );

            case 'Maintenance Request': return (
                <MaintenanceRequest />
            );

            case 'Throughput Report': return (
                <ThroughputReport />
            );

            case 'Yield Analysis': return (
                <YieldAnalysis />
            );

            case 'Task/Time Logs': return (
                <TaskDataChart data={taskData} />
            );


            case 'Production Downtime Report': return (
                <ProductionDowntimeReport spMethod={main} />
            );

            case 'Real-Time Production Report':
                return (
                    <div className="ui">
                        <ReportsRealTimeDashboard />
                    </div>
                );

            default:
                return (

                    <div className="ui segment very padded black " style={{ marginTop: "2px" }}>

                        <div className="ui sixteen wide column segment"
                            style={{
                                position: 'absolute',
                                top: '60%',
                                left: '50%',
                                transform: 'translate(-50%, 60%)'
                            }}>
                            <h2>No Access Yet</h2>
                            <p>
                                Please contact admin for access to this department.

                            </p>
                        </div>
                    </div>
                );
        }
    };

    const header = () => {
        return (
            <div>
                <h1 className="ui header medium" style={{ marginTop: '2%', marginLeft: '3%' }}>
                    <div className="ui image avatar">
                        <img
                            src="img/logo.jpg" // replace with your image source
                            alt="Department Image"
                        />
                    </div>
                    Manufacturing Orders

                </h1>
            </div>
        );
    };

    const loginUser = () => {

        setIsLoggedIn(true);
        setUserName(userInfo.displayName);

    }
    const loginModal = () => {
        return (
            <div className={`ui page dimmer login ${loginModalOpen ? 'active show' : 'hide'}`}>
                <div className="header">Login</div>
                <div className="content">
                    <LoginTokenNew
                        setIsLoggedIn={loginUser}
                        user={userInfo}
                        setReload={setReload}
                        setSelectedDepartment={setSelectedDepartment}
                    />
                </div>
                <div class='ui divider'></div>
                <div className="actions">
                    <button
                        className="ui red button deny"
                        onClick={() => setLoginModalOpen(false)}
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="ui  ">
            <LeftMenuBar
                handleDepartmentClick={handleDepartmentClick}
                setClearLoading={setClearLoading}
                setLoginModalOpen={setLoginModalOpen}
                searchQueryLifted={searchQueryLifted}
                setSearchQuery={setSearchQuery}
                visibleLifted={visibleLifted}
                setVisible={setVisible}
                setData={setData}
                dataLifted={dataLifted}
                sheetNameLifted={sheetNameLifted}
                setSheetName={setSheetName}
                userName={userName}
                selectedDepartment={selectedDepartment}
                loginModalOpen={loginModalOpen}
                reload={reload}
            />
            <div className="ui grid contentPane">
                {/* Left Sidebar Menu */}
                
                {/* Content Area with manually created tabs */}
                <div className="ui fourteen wide column centered"
                    style={{ /* marginLeft: '15.5%', paddingRight: '5%' */ }}>
                    <ErrorMessage error={newError} />
                    <div class='ui divider hidden'></div>
                    {renderContent()}
                    {loginModal()}
                </div>
            </div>
        </div>
    );

}
ReactDOM.render(<DepartmentMenu />, document.getElementById('root'));

