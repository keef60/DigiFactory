//Commit Update
const MaintenanceTable = ({
  maintenanceData,
  maintenanceTypes,
  statusOptions,
  handleChange,
  handleUpdate,
}) => {
  return (
    <table className="ui very padded striped aligned center table compact selectable">
      <thead>
        <tr>
          <th>Equipment</th>
          <th>Cause</th>
          <th>Downtime</th>
          <th>Impact</th>
          <th>Maintenance Type</th>
          <th>Status</th>
          <th>Creation Date</th>
          <th>Request ID</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {maintenanceData.map((row, index) => (
          <tr key={index}>
            <td>{row.machine?.[0] || 'N/A'}</td>
            <td>{row.cause?.[0] || 'N/A'}</td>
            <td>{row.downtime?.[0] || 'N/A'}</td>
            <td>{row.impact?.[0] || 'N/A'}</td>
            <td>
              <div className="ui selection dropdown" id={`type-dropdown-${index}`}>
                <input
                  type="hidden"
                  name="maintenanceType"
                  value={row.maintenanceType}
                />
                <i className="dropdown icon"></i>
                <div className="default text">
                  {row.maintenanceType || 'Select Type'}
                </div>
                <div className="menu">
                  {maintenanceTypes.map((type, idx) => (
                    <div
                      key={idx}
                      className="item"
                      data-value={type}
                      onClick={() => handleChange(index, 'maintenanceType', type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>
            </td>
            <td>
              <div className="ui selection dropdown" id={`status-dropdown-${index}`}>
                <input type="hidden" name="status" value={row.status} />
                <i className="dropdown icon"></i>
                <div className="default text">
                  {row.status || 'Select Status'}
                </div>
                <div className="menu">
                  {statusOptions.map((status, idx) => (
                    <div
                      key={idx}
                      className="item"
                      data-value={status}
                      onClick={() => handleChange(index, 'status', status)}
                    >
                      {status}
                    </div>
                  ))}
                </div>
              </div>
            </td>
            <td>{new Date(row.creationDate).toLocaleDateString()}</td>
            <td>{row.uuid || 'N/A'}</td>
            <td>
              <button
                className="ui mini primary button"
                onClick={() => handleUpdate(row)}
              >
                Submit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};


