const MaintenanceTabs = ({ maintenanceData, handleFilter }) => {
    const [activeTab, setActiveTab] = useState('notCompleted');
  
    const notCompletedData = maintenanceData.filter(item => item.status !== 'Completed');
    const completedData = maintenanceData.filter(item => item.status === 'Completed');
  
    return (
      <>
        <div className="ui top attached tabular menu">
          <a
            className={`item ${activeTab === 'notCompleted' ? 'active' : ''}`}
            onClick={() => setActiveTab('notCompleted')}
          >
            Not Completed
          </a>
          <a
            className={`item ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </a>
        </div>
  
        <div className={`ui bottom attached tab segment ${activeTab === 'notCompleted' ? 'active' : ''}`}>
          {activeTab === 'notCompleted' && (
            <MaintenanceTable
              maintenanceData={notCompletedData}
              handleFilter={handleFilter}
            />
          )}
        </div>
  
        <div className={`ui bottom attached tab segment ${activeTab === 'completed' ? 'active' : ''}`}>
          {activeTab === 'completed' && (
            <MaintenanceTable
              maintenanceData={completedData}
              handleFilter={handleFilter}
            />
          )}
        </div>
      </>
    );
  };
  
