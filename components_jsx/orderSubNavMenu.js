//Commit Update

const OrderSubNavMenu = ({
    handleDepartmentClick,
    setClearLoading,
    setLoginModalOpen,
    userName,
    selectedDepartment,
    loginModalOpen
}) => {
    useEffect(() => {
        // Do something when userName changes, if needed
    }, [userName]);

    useEffect(() => {

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
        'Paint', 'Handles', 'Pumps', 'Packout', 'Hose',
        'Frames', 'Lines', 'Inventory', 'Warehouse', 'Maintenance'
    ];

    return (
        <div className="ui vertical menu">
            {/* Manufacturing Reports Section */}
            <div className="item">
                <div className=" ui header">Manufacturing Reports</div>
                <div className="menu right ui ">
                    {reports.map((report, index) => (
                        <a
                            key={index}
                            className={`item ${report.disabled ? 'disabled' : ''}`}
                            onClick={() => {
                                if (!report.disabled) {
                                    handleDepartmentClick(report.name);
                                    console.log(`${report.name} clicked`);
                                }
                            }}
                        >
                            {report.name}
                        </a>
                    ))}
                </div>
            </div>

            {/* Departments Section */}
            <div className="item dropdown">
                <div className="header ui">Departments</div>
                <div className="menu right ui">
                    {departments.map((department) => (
                        <a
                            key={department}
                            className={`item ${selectedDepartment === department ? 'active' : ''}`}
                            onClick={() => {
                                handleDepartmentClick(department);
                            }}
                        >
                            {department}
                        </a>
                    ))}
                </div>
            </div>

            {/* Login/Logout Button Section */}
            <div className="item">
                <div className="header">{userName ? 'Account' : 'Login'}</div>
                <div className="menu right ui">
                    <button
                        className={`ui ${userName ? 'red' : 'primary'} button fluid`}
                        onClick={() => setLoginModalOpen(!loginModalOpen)}
                    >
                        {userName ? 'Logout' : 'Login'}
                    </button>
                </div>
            </div>
        </div>
    );
};


