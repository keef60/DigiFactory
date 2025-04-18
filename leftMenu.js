const { useEffect, useState } = React;

const LeftMenuBar = ({
    handleDepartmentClick,
    setClearLoading,
    setLoginModalOpen,
    searchQueryLifted,
    setSearchQuery,
    visibleLifted,
    setVisible,
    setData,
    dataLifted,
    sheetNameLifted,
    setSheetName,
    userName,
    selectedDepartment,
    loginModalOpen,
    reload
}) => {
    useEffect(() => {
        console.log('reload');
    }, [userName, reload]);

    useEffect(() => {
        $('.ui.dropdown.topMenu').dropdown()
    }, []);

    // List of manufacturing reports
    const reports = [
        { name: 'Real-Time Production Report', disabled: false },
        { name: 'Daily Production Overview', disabled: false },
        { name: 'Inventory Levels', disabled: false },
        { name: 'Maintenance Status', disabled: false },
        { name: 'Throughput Report', disabled: true },
        { name: 'Yield Analysis', disabled: true },
        { name: 'Production Downtime Report', disabled: false },
    ];

    // List of departments
    const departments = [
        'Paint',
        'Handles',
        'Pumps',
        'Packout',
        'Hose',
        'Frames',
        'Lines',
        'Inventory',
        'Warehouse',
        'Maintenance'
    ];

    return (
        <div className="ui fluid menu  tiny navigation top fixed stackable" style={{ 'z-index': 1000 }}>
            <div class="item">            <ProgressCircle reload={reload} /></div>
            <div className="item">
                <div className="ui header">{userName ? userName : 'Not Logged In'}</div>
            </div>


            {/* Departments Dropdown */}
            <div className="ui dropdown item topMenu">

                Departments
                <div className="menu">
                    {departments.map(department => (
                        <a
                            key={department}
                            className={`item ${selectedDepartment === department ? 'active' : ''}`}
                            onClick={() => {
                                handleDepartmentClick(department);
                                setClearLoading(true);
                            }}
                        >
                            {department}
                        </a>
                    ))}
                </div>
            </div>

            {/* Reports Dropdown for Manufacturing Managers */}
            <div className="ui dropdown item topMenu">

                Manufacturing Reports
                <div className="menu">
                    {reports.map((report, index) => (
                        <a
                            key={index}
                            className={`item ${report.disabled ? 'disabled' : ''}`}
                            onClick={() => {
                                handleDepartmentClick(report.name); // Trigger the handleDepartmentClick with the report name
                                console.log(`${report.name} clicked`); // You can replace this with any logic to handle the report
                            }}
                        >
                            {report.name}
                        </a>
                    ))}
                </div>
            </div>


            {/* Login button to toggle the login modal */}
            <div className="item menu right">

                {/* <SearchBar
                    searchQueryLifted={searchQueryLifted}
                    setSearchQuery={setSearchQuery}
                    visibleLifted={visibleLifted}
                    setVisible={setVisible}
                    setData={setData}
                    dataLifted={dataLifted}
                    sheetNameLifted={sheetNameLifted}
                    setSheetName={setSheetName}
                    liftedData={dataLifted}
                    notMenuSearch={false}
                    selectedDepartment={selectedDepartment}
                /> */}

                <button
                    className={`ui ${userName !== undefined ? 'red' : 'primary'} button fluid`}
                    onClick={() => setLoginModalOpen(!loginModalOpen)}
                >
                    {userName !== undefined ? 'Logout' : 'Login'}
                </button>
            </div>
        </div>
    );
};
