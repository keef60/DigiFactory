const MaintenanceStatus = () => {

  const [maintenanceData, setMaintenanceData] = useState([]);
  const [departmentClick, setDepartmentClick] = useState('');
  const [departmentTitle, setDepartmentTitle] = useState('');
  const [allData, setAllData] = useState([])
  useEffect(() => {
    const data = async () => {

      try {
        setAllData(await main.fetchSharePointData('Maintenance', 'handles').then(e => e));
      } catch (error) {
        console.log(error);
      }

    }
    if (allData.length === 0) {
      data();
    }

  }, [maintenanceData]);

  useEffect(() => {
    if (allData.length !== 0) {
      let nD = allData.value.reduce((filtered, data) => {
        try {
          const parsed = JSON.parse(data.fields[departmentClick]);
          if (parsed.selectedOptions) {
            filtered.push(parsed.selectedOptions);
          }
        } catch (error) {

        }
        return filtered;
      }, []);
      setMaintenanceData(nD);
    }
  }, [departmentClick, maintenanceData])

  // Map incoming maintenance data to a structure that fits the table
  const mappedData = maintenanceData?.map(item => ({
    equipment: item.machine[0] || 'N/A',  // Assuming the machine name is in the 'machine' array
    cause: item.cause[0] || 'N/A',  // Assuming the cause is in the 'cause' array
    downtime: item.downtime[0] || 'N/A',  // Assuming the downtime is in the 'downtime' array
    impact: item.impact[0] || 'N/A',  // Assuming the impact is in the 'impact' array
    maintenanceType: item.maintenanceType || 'N/A',
    creationDate: new Date(item.creationDate).toLocaleDateString(),  // Format creationDate
    uuid: item.uuid || 'N/A',
    status: item.status || 'Pending',
  }));

  return (
    <div className="ui" >
      <SelectionMenuTab_DashComponent
        setDepartmentTitle={setDepartmentTitle}
        setDepartmentClick={setDepartmentClick}
      />

      {/* Table Section */}
      <div className=" ui segment black ui thirteen wide mobile eleven wide tablet eleven wide computer ">
        <h2>Maintenance Status</h2>
        <table className="ui very padded striped aligned center table compact selectable ">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Cause</th>
              <th>Downtime</th>
              <th>Impact</th>
              <th>Maintenance Type</th>
              <th>Creation Date</th>
              <th>Request ID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mappedData.map((row, index) => (
              <tr key={index}>
                <td>{row.equipment}</td>
                <td>{row.cause}</td>
                <td>{row.downtime}</td>
                <td>{row.impact}</td>
                <td>{row.maintenanceType}</td>
                <td>{row.creationDate}</td>
                <td>{row.uuid}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
