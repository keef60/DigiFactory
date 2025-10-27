
//Commit Update
const MaintenanceDashboard = ({ user }) => {
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [departmentClick, setDepartmentClick] = useState('');
  const [departmentTitle, setDepartmentTitle] = useState('');
  const [filterData, setFilterData] = useState([]);
  const [maintenanceTypes] = useState([
    'Preventive Maintenance',
    'Corrective Maintenance',
    'Predictive Maintenance',
    'Routine Maintenance',
    'Emergency Maintenance',
    'Condition-Based Maintenance',
    'Shutdown Maintenance',
    'Software Updates/Upgrades',
    'Calibration',
    'Reliability-Centered Maintenance (RCM)',
    'Root Cause Analysis',
    'Spare Parts Management',
    'Overhaul'
  ]);

  const [statusOptions] = useState([
    'Scheduled',
    'In Progress',
    'Completed',
    'Pending',
    'Delayed',
    'On Hold',
    'Failed',
    'Cancelled',
    'Under Review',
    'Resolved',
    'Emergency',
    'Awaiting Parts'
  ]);

  useEffect(() => {
    $('.ui.dropdown').dropdown({ allowAdditions: true });
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetched = await main.fetchSharePointData('Maintenance', 'handles');
        setAllData(fetched);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    if (allData.length === 0 && user) fetchData();
  }, [allData]);

  useEffect(() => {
    if (allData.length !== 0) {
      const parsedData = allData.value.reduce((acc, data) => {
        try {
          const parsed = JSON.parse(data.fields[departmentClick]);
          if (parsed.selectedOptions) {
            acc.push({ ...parsed.selectedOptions, id: data.fields.id }); // Store ID for updates
          }
        } catch (err) { }
        return acc;
      }, []);
      setMaintenanceData(parsedData);
    }
  }, [departmentClick, allData]);

  // Update row field state
  const handleChange = (index, field, value) => {

    const updated = [...filterData];
    updated[index][field] = value;
    if (!updated[index].changeLog) {
      updated[index].changeLog = {};
      updated[index].changeLog[field] = [];
    } else {
      updated[index].changeLog[field] = [];
    }
    updated[index].changeLog[field].push({ value: value, timestamp: Date.now() });
    setMaintenanceData(updated);
  };

  const handleUpdate = async (row) => {
    const updatePayload = {
      selectedOptions: {
        ...row
      }
    };

    try {
      await main.handleSubmit(row.uuid, updatePayload, departmentClick, 'Maintenance');
      setAllData([]);
      alert('Updated successfully!');
    } catch (error) {
      console.error('Update failed:', error);
      alert('Update failed.');
    }
  };
  const handleFilter = (row) => {
    setFilterData(maintenanceData.filter(data => data.id === row.id))
  };

  return (
    <div className="ui" >
      <SelectionMenuTab_DashComponent
        setDepartmentTitle={setDepartmentTitle}
        setDepartmentClick={setDepartmentClick}
      />
      <div class="ui segment  black">
        <MaintenanceHeaderDetail imageSrc={"img/logo.jpg"} />
        <div className="ui segments horizontal">

          <div className="ui segment">
            <MaintenanceTabs
              maintenanceData={maintenanceData}
              handleFilter={handleFilter}
            />
          </div>
          <div class='ui segment very padded'>
            <MaintenanceCards
              maintenanceData={filterData}
              maintenanceTypes={maintenanceTypes}
              statusOptions={statusOptions}
              handleChange={handleChange}
              handleUpdate={handleUpdate}
            />
          </div>
        </div>
      </div>

    </div>
  );
};


