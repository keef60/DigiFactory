

const { useState, useEffect, useRef } = React
function DepartmentMenu() {

    const [selectedDepartment, setSelectedDepartment] = useState('Paint');
    const [departmentIcon, setDepartmentIcon] = useState('certificate');
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
    const [newError, setError] = useState(undefined);
    const [issesListData, setIssesListData] = useState([]);



    useEffect(() => {
        const r = async () => {
            try {
                await main.fetchSharePointData('IssueList', 'issues')
                    .then((e) => {
                        const fields = e.value[0].fields;
                        console.log("===================>>", fields);
                        // Save the data into the refs
                        setIssesListData(fields);
                        // Set other lists to the refs if needed
                        // reportDowntimeDurationsListRef.current = fields['downtimeDurations'];
                        // reportImpactListRef.current = fields['impact'];
                        // reportMachineListRef.current = fields['machine'];
                    });
            } catch (error) {
                console.log("<==========================", error)
                return error;
            }
        };
        if (issesListData.length === 0) {
            r().then((e) => e).catch(er => console.log(er))

        };
    }, [issesListData]);

    useEffect(() => {
        if (!tableData) {

            main.fetchSharePointData('FRAMETABLE', 'all', true, setTableData, '')
                .then(e => e)
                .catch(err => console.log(err.error.message))

            main.fetchSharePointData('PACKOUTTABLE', 'all', true, '', setPackoutTableData)
                .then(e => e)
                .catch(err => console.log(err.error.message));


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
    }, [tableData, packoutTableData, selectedDepartment]);

    useEffect(() => {
        $('.ui.login.dimmer').dimmer('hide');
        getMe();
    }, [userInfo, isLoggedIn, newError]);

    useEffect(() => {
        if (userInfo) {
            setUserName(userInfo.displayName);
        }
    }, [userInfo]);

    const getMe = async () => {
        const accessToken = sessionStorage.getItem('access_token');
        try {
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
                        console.log('======================>', error)
                    });
            }
        } catch (error) {

            setIsLoggedIn(false);
            setError(error);
            console.log('<========================>', error)
        }

    }


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
                    issesListData={issesListData} />
        )
    }


    const renderContent = () => {
        switch (selectedDepartment) {
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
            case 'Inventory':
                return (

                    <InventoryLookup
                        spMethod={main}
                        selectedDepartment="Inventory"
                        departmentName={['inventory', 'sage']}
                        searchQueryLifted={searchQueryLifted}
                        clearLoading={clearLoading}
                    />

                );
            case 'Inventory Levels':
                return (

                    <InventoryLookup
                        spMethod={main}
                        selectedDepartment="Inventory"
                        departmentName={['inventory', 'sage']}
                        searchQueryLifted={searchQueryLifted}
                        clearLoading={clearLoading}
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
            case 'Production Downtime Report': return (
                <ProductionDowntimeReport spMethod={main} />
            );
            case 'Real-Time Production Report':
                return (
                    <div className="ui">
                        <Dashboard spMethod={main} />
                    </div>
                );

            default:
                return (
                    <div className="ui sixteen wide column segment" style={{ position: 'absolute', top: '60%', left: '50%', transform: 'translate(-50%, 60%)' }}>
                        <h2>No Access Yet</h2>
                        <p>
                            Please contact admin for access to this department.

                        </p>
                    </div>
                );
        }
    };

    const header = () => {
        return (
            <div>
                <h1 className="ui header huge" style={{ marginTop: '2%', marginLeft: '3%' }}>
                    <div className="ui image avatar">
                        <img
                            src="img/logo.jpg" // replace with your image source
                            alt="Department Image"
                        />
                    </div>
                    {selectedDepartment}
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
                        isLoggedIn={isLoggedIn}
                    />
                </div>
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
        <div className="ui">
            <div className="ui grid contentPane">
                {/* Left Sidebar Menu */}
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
                />

                {/* Content Area with manually created tabs */}
                <div className="ui sixteen wide column" style={{ marginLeft: '15.5%', paddingRight: '5%' }}>
                    <ErrorMessage error={newError} />
                    {header()}
                    {renderContent()}
                    {loginModal()}
                </div>
            </div>
        </div>
    );
}
ReactDOM.render(<DepartmentMenu />, document.getElementById('root'));

