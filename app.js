

const { useState, useEffect, useRef, useMemo } = React;
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
    const [userEmail, setUserEmail] = useState(undefined);

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
    const [gpDataInput, setGpDataInput] = useState({ reports: [], materialsPicks: [] });
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
        const fetchPicklistAndReports = async () => {
            try {
                if (throttle) {
                    const [picklistCache, reportsCache] = await Promise.all([
                        getSetting('PICKLIST'),
                        getSetting('REPORTS')
                    ]);

                    if (gpDataInput.materialsPicks.length === 0 && picklistCache) {
                        setGpDataInput(prev => ({ ...prev, materialsPicks: picklistCache }));
                    }

                    if (gpDataInput.reports.length === 0 && reportsCache) {
                        setGpDataInput(prev => ({ ...prev, reports: reportsCache }));
                    }

                    const picklist = await main.fetchSharePointData('PICKLIST', 'load');
                    if (picklist.value.length > 0 && reload.status) {
                        setGpDataInput(prev => ({ ...prev, materialsPicks: picklist.value }));
                        await saveSetting('PICKLIST', picklist.value); // save to DB
                    }

                    const reports = await main.fetchSharePointData('REPORTS', 'load');
                    if (reports.value.length > 0 && reload.status) {
                        setGpDataInput(prev => ({ ...prev, reports: reports.value }));
                        await saveSetting('REPORTS', reports.value); // save to DB
                    }
                }
            } catch (error) {
                console.warn(error);

                if (picklistCache) {
                    setGpDataInput(prev => ({ ...prev, materialsPicks: picklistCache }));
                }

                if (reportsCache) {
                    setGpDataInput(prev => ({ ...prev, reports: reportsCache }));
                }
            }
        };

        fetchPicklistAndReports();
    }, [reload]);

    useEffect(() => {
        $('.ui.login.dimmer').dimmer('hide');
        getMe();
    }, [userInfo, isLoggedIn, newError, reload]);

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

    }, [userInfo, reload]);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const cachedIssues = await getSetting('ISSUE_LIST');
                if (cachedIssues && issesListData.length === 0) {
                    setIssesListData(cachedIssues);
                }

                const response = await main.fetchSharePointData('IssueList', 'issues');
                const fields = response.value[0].fields;
                setIssesListData(fields);
                await saveSetting('ISSUE_LIST', fields);
            } catch (err) {
                if (cachedIssues) {
                    setIssesListData(cachedIssues);
                }
                setError(err);
                console.log('================> ISSUE ERROR', err);
            }
        };

        if (issesListData.length === 0) {
            fetchIssues();
        }
    }, [issesListData, reload]);

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
    }, [tableData, packoutTableData, selectedDepartment, reload]);

    useEffect(() => {
        if (userInfo) {
            setUserName(userInfo.displayName);
            setUserEmail(userInfo.mail)
        }
    }, [userInfo, reload]);

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
                    email={userEmail}
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
                    email={userEmail}
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
            "timestamp": "2025-04-30T21:50:49.860Z",
            "taskId": 1746047984339,
            "taskName": "HANDLES Assembly",
            "employee": "Keith Carter",
            "action": "start",
            "department": "LINE",
            "workCenter": "026",
            "realDurationAtAction": 0,
            "statusAfterAction": "In Progress",
            "workOrderID": "WO - 00364434-03"
        },
        {
            "timestamp": "2025-04-30T21:50:58.396Z",
            "taskId": 1746049509281,
            "taskName": "LINE Assembly",
            "employee": "Keith Carter",
            "action": "start",
            "department": "LINE",
            "workCenter": "026",
            "realDurationAtAction": 0,
            "statusAfterAction": "In Progress",
            "workOrderID": "WO - 00364436"
        },
        {
            "timestamp": "2025-04-30T21:51:01.132Z",
            "taskId": 1746049540358,
            "taskName": "LINE Assembly",
            "employee": "Keith Carter",
            "action": "start",
            "department": "LINE",
            "workCenter": "026",
            "realDurationAtAction": 0,
            "statusAfterAction": "In Progress",
            "workOrderID": "WO - 00364434"
        },
        {
            "timestamp": "2025-04-30T21:53:22.623Z",
            "taskId": 1746049509281,
            "taskName": "LINE Assembly",
            "employee": "Keith Carter",
            "action": "pause",
            "department": "LINE",
            "workCenter": "026",
            "realDurationAtAction": 0,
            "statusAfterAction": "Paused",
            "workOrderID": "WO - 00364436",
            "pauseReason": "Break"
        },
        {
            "timestamp": "2025-04-30T21:53:24.440Z",
            "taskId": 1746049540358,
            "taskName": "LINE Assembly",
            "employee": "Keith Carter",
            "action": "stop",
            "department": "LINE",
            "workCenter": "026",
            "realDurationAtAction": 143,
            "statusAfterAction": "Completed",
            "workOrderID": "WO - 00364434"
        },
        {
            "timestamp": "2025-05-01T21:31:49.489Z",
            "taskId": 1746047984339,
            "taskName": "HANDLES Assembly",
            "employee": "Keith Carter",
            "action": "stop",
            "department": "HANDLES",
            "workCenter": "026",
            "realDurationAtAction": 85259,
            "statusAfterAction": "Completed",
            "workOrderID": "WO - 00364434-03"
        },
        {
            "timestamp": "2025-05-01T21:31:56.593Z",
            "taskId": 1746049509281,
            "taskName": "LINE Assembly",
            "employee": "Keith Carter",
            "action": "start",
            "department": "HANDLES",
            "workCenter": "026",
            "realDurationAtAction": 0,
            "statusAfterAction": "In Progress",
            "workOrderID": "WO - 00364436"
        },
        {
            "timestamp": "2025-05-01T21:54:38.416Z",
            "taskId": 1746049509281,
            "taskName": "LINE Assembly",
            "employee": "Keith Carter",
            "action": "stop",
            "department": "HANDLES",
            "workCenter": "026",
            "realDurationAtAction": 1361,
            "statusAfterAction": "Completed",
            "workOrderID": "WO - 00364436"
        },
        {
            "timestamp": "2025-05-05T14:48:14.042Z",
            "taskId": 1746048221515,
            "taskName": "HANDLES Assembly",
            "employee": "Keith Carter",
            "action": "start",
            "department": "HANDLES",
            "workCenter": "026",
            "realDurationAtAction": 0,
            "statusAfterAction": "In Progress",
            "workOrderID": "WO - 00364436-03"
        },
        {
            "timestamp": "2025-05-05T14:48:32.452Z",
            "taskId": 1746048828729,
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
            "timestamp": "2025-05-05T14:48:56.463Z",
            "taskId": 1746048867627,
            "taskName": "PACKOUT Assembly",
            "employee": "Keith Carter",
            "action": "start",
            "department": "HANDLES",
            "workCenter": "026",
            "realDurationAtAction": 0,
            "statusAfterAction": "In Progress",
            "workOrderID": "WO - 00364436-04"
        },
        {
            "timestamp": "2025-05-05T14:49:10.434Z",
            "taskId": 1746456296567,
            "taskName": "ELECTRIC Assembly",
            "employee": "Keith Carter",
            "action": "start",
            "department": "HANDLES",
            "workCenter": "026",
            "realDurationAtAction": 0,
            "statusAfterAction": "In Progress",
            "workOrderID": "WO - 00364650-01E"
        },
        {
            "timestamp": "2025-05-05T14:59:14.466Z",
            "taskId": 1746048828729,
            "taskName": "PACKOUT Assembly",
            "employee": "Keith Carter",
            "action": "pause",
            "department": "ELECTRIC",
            "workCenter": "026",
            "realDurationAtAction": 0,
            "statusAfterAction": "Paused",
            "workOrderID": "WO - 00364434-04",
            "pauseReason": "Machine issue"
        },
        {
            "timestamp": "2025-05-05T15:07:15.702Z",
            "taskId": 1746048221515,
            "taskName": "HANDLES Assembly",
            "employee": "Keith Carter",
            "action": "stop",
            "department": "ELECTRIC",
            "workCenter": "026",
            "realDurationAtAction": 1141,
            "statusAfterAction": "Completed",
            "workOrderID": "WO - 00364436-03"
        },
        {
            "timestamp": "2025-05-05T15:07:32.047Z",
            "taskId": 1746456296567,
            "taskName": "ELECTRIC Assembly",
            "employee": "Keith Carter",
            "action": "stop",
            "department": "ELECTRIC",
            "workCenter": "026",
            "realDurationAtAction": 1101,
            "statusAfterAction": "Completed",
            "workOrderID": "WO - 00364650-01E"
        },
        {
            "timestamp": "2025-05-05T15:07:46.836Z",
            "taskId": 1746048867627,
            "taskName": "PACKOUT Assembly",
            "employee": "Keith Carter",
            "action": "stop",
            "department": "ELECTRIC",
            "workCenter": "026",
            "realDurationAtAction": 1130,
            "statusAfterAction": "Completed",
            "workOrderID": "WO - 00364436-04"
        },
        {
            "timestamp": "2025-05-05T15:07:58.804Z",
            "taskId": 1746048828729,
            "taskName": "PACKOUT Assembly",
            "employee": "Keith Carter",
            "action": "start",
            "department": "ELECTRIC",
            "workCenter": "026",
            "realDurationAtAction": 0,
            "statusAfterAction": "In Progress",
            "workOrderID": "WO - 00364434-04"
        },
        {
            "timestamp": "2025-05-05T15:08:01.968Z",
            "taskId": 1746048828729,
            "taskName": "PACKOUT Assembly",
            "employee": "Keith Carter",
            "action": "stop",
            "department": "ELECTRIC",
            "workCenter": "026",
            "realDurationAtAction": 3,
            "statusAfterAction": "Completed",
            "workOrderID": "WO - 00364434-04"
        },
        {
            "timestamp": "2025-05-05T19:50:05.856Z",
            "taskId": 1746049060743,
            "taskName": "FRAMES Assembly",
            "employee": "Keith Carter",
            "action": "start",
            "department": "HANDLES",
            "workCenter": "026",
            "realDurationAtAction": 0,
            "statusAfterAction": "In Progress",
            "workOrderID": "WO - 00364434-02"
        },
        {
            "timestamp": "2025-05-06T21:33:25.818Z",
            "taskId": 1746049060743,
            "taskName": "FRAMES Assembly",
            "employee": "Keith Carter",
            "action": "stop",
            "department": "HANDLES",
            "workCenter": "026",
            "realDurationAtAction": 92599,
            "statusAfterAction": "Completed",
            "workOrderID": "WO - 00364434-02"
        }
    ]
    const renderContent = () => {
        switch (selectedDepartment) {
            case 'Home': return (<HomeScreen />)

            case 'Paint':
                return (
                    contentMasterSeletor("FRAME KIT", 'frames')
                )
            case 'Packout':
                return (
                    contentMasterSeletor("PACKOUT KIT", 'packout')
                )
            case 'Handles':
                return (
                    contentMasterSeletor("HANDLE KIT", 'handles')
                )

            case 'Electric':
                return (
                    contentMasterSeletor("ELECTRIC KIT", 'electric')
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

            case 'Order Status': return (
                <ReportOrderStatus reload={reload} gpDataInput={gpDataInput} />
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

            case 'Edit SharePoint Data': return(
                <EditSharePointDB />
            )
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


    const loginUser = () => {

        setIsLoggedIn(true);
        setUserName(sessionStorage.getItem('user_name'));
        setUserEmail(sessionStorage.getItem('user_email'));

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
                email={userEmail}
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

