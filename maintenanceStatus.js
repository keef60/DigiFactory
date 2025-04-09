const MaintenanceStatus = ({setDepartmentTitle,setDepartmentClick}) => {
  const data = [
    { equipment: 'Machine A', maintenanceType: 'Preventive', lastMaintenance: '2025-03-25', nextMaintenance: '2025-04-05', status: 'Good' },
    { equipment: 'Machine B', maintenanceType: 'Corrective', lastMaintenance: '2025-03-20', nextMaintenance: '2025-04-10', status: 'Requires Repair' },
  ];

  return (
    <div className="ui" style={{ marginLeft: '5%', width: '90%' }}>
    <SelectionMenuTab_DashComponent
setDepartmentTitle={setDepartmentTitle}
setDepartmentClick={setDepartmentClick}
/>

{/* Table Section */}
<div className=" ui segment black ui thirteen wide mobile eleven wide tablet eleven wide computer column">

      <h2>Maintenance Status</h2>
      <table>
        <thead>
          <tr>
            <th>Equipment</th>
            <th>Maintenance Type</th>
            <th>Last Maintenance Date</th>
            <th>Next Maintenance Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.equipment}</td>
              <td>{row.maintenanceType}</td>
              <td>{row.lastMaintenance}</td>
              <td>{row.nextMaintenance}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

