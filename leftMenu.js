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
    loginModalOpen
}) => {
    useEffect(() => {

    }, [userName]);

    useEffect(() => {

    }, []);

    // List of manufacturing reports
    const reports = [
        { name: 'Real-Time Production Report',disabled:false },
        { name: 'Daily Production Overview',disabled:false },
        { name: 'Inventory Levels',disabled:false },
        { name: 'Maintenance Status',disabled:false },
        { name: 'Throughput Report',disabled:true },
        { name: 'Yield Analysis',disabled:true },
        { name: 'Production Downtime Report',disabled:false },
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
useEffect(()=>{
    $('.ui.menu.navigation').sticky()
})
    return (
        <div className="ui fluid menu sticky top navigation fixed" style={{'z-index':10}}>
            <div className="item">
                <div className="ui header">{userName ? userName : 'Not Logged In'}</div>
            </div>

            <SearchBar
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
            />
   {/* Departments Dropdown */}
            <div className="ui dropdown item">

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
            <div className="ui dropdown item">

                Manufacturing Reports
                <div className="menu">
                    {reports.map((report, index) => (
                        <a
                            key={index}
                            className={`item ${report.disabled?'disabled':''}`}
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
            <a className="item menu right">
                <button
                    className={`ui ${userName !== undefined ? 'red' : 'primary'} button fluid`}
                    onClick={() => setLoginModalOpen(!loginModalOpen)}
                >
                    {userName !== undefined ? 'Logout' : 'Login'}
                </button>
            </a>
        </div>
    );
};
