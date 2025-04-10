const MaintenanceDashboard = ({}) => {
   const maintenanceTypes =  [
    {
      "maintenance_type": "Preventive Maintenance",
      "description": "Scheduled maintenance to prevent breakdowns by replacing worn-out parts, lubricating equipment, and performing regular inspections."
    },
    {
      "maintenance_type": "Corrective Maintenance",
      "description": "Repairs made after a failure occurs, restoring equipment to normal operating condition."
    },
    {
      "maintenance_type": "Predictive Maintenance",
      "description": "Monitoring equipment conditions using sensors and data analytics to predict when maintenance should be performed, preventing unexpected failures."
    },
    {
      "maintenance_type": "Routine Maintenance",
      "description": "Frequent, day-to-day tasks necessary to keep equipment running smoothly, such as cleaning, inspections, and adjustments."
    },
    {
      "maintenance_type": "Emergency Maintenance",
      "description": "Unplanned maintenance performed immediately after a critical failure or equipment breakdown, often resulting in production downtime."
    },
    {
      "maintenance_type": "Condition-Based Maintenance",
      "description": "Maintenance actions are based on the actual condition of the equipment, using real-time data from equipment monitoring systems."
    },
    {
      "maintenance_type": "Shutdown Maintenance",
      "description": "Planned downtime for thorough maintenance during a scheduled plant shutdown, often involving deep inspection and repairs."
    },
    {
      "maintenance_type": "Software Updates/Upgrades",
      "description": "Upgrading or updating the software systems that control manufacturing equipment, often to improve functionality or address security vulnerabilities."
    },
    {
      "maintenance_type": "Calibration",
      "description": "Adjusting and testing equipment to ensure it meets manufacturing tolerances and accuracy standards."
    },
    {
      "maintenance_type": "Reliability-Centered Maintenance (RCM)",
      "description": "A strategic approach that identifies the most critical systems and equipment to prioritize maintenance efforts, maximizing reliability and minimizing downtime."
    },
    {
      "maintenance_type": "Root Cause Analysis",
      "description": "Investigating and identifying the underlying causes of equipment failure to implement corrective actions and prevent future issues."
    },
    {
      "maintenance_type": "Spare Parts Management",
      "description": "Managing inventory of spare parts to ensure the availability of critical components for maintenance and repair activities."
    },
    {
      "maintenance_type": "Overhaul",
      "description": "A complete disassembly, inspection, and repair of equipment or machinery to restore it to optimal performance."
    }
  ]
  
 const status = [
    {
      "status": "Scheduled",
      "description": "Maintenance is planned and scheduled for a specific time or date."
    },
    {
      "status": "In Progress",
      "description": "Maintenance tasks are currently being carried out."
    },
    {
      "status": "Completed",
      "description": "Maintenance tasks have been finished and equipment is back in operation."
    },
    {
      "status": "Pending",
      "description": "Maintenance has been requested but not yet started."
    },
    {
      "status": "Delayed",
      "description": "Maintenance has been postponed or delayed for any reason."
    },
    {
      "status": "On Hold",
      "description": "Maintenance is temporarily paused, awaiting further action or resources."
    },
    {
      "status": "Failed",
      "description": "Maintenance did not resolve the issue, or the equipment failure was not fixed successfully."
    },
    {
      "status": "Cancelled",
      "description": "Maintenance task has been canceled and will not be performed."
    },
    {
      "status": "Under Review",
      "description": "Maintenance outcome or status is being assessed to determine further action."
    },
    {
      "status": "Resolved",
      "description": "The issue requiring maintenance has been identified and fully addressed."
    },
    {
      "status": "Emergency",
      "description": "Maintenance is urgently needed due to a critical failure or malfunction that requires immediate attention."
    },
    {
      "status": "Awaiting Parts",
      "description": "Maintenance cannot proceed until necessary spare parts or materials are received."
    }
  ]
  

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

