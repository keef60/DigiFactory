const MaintenanceCards = ({
  maintenanceData,
  maintenanceTypes,
  statusOptions,
  handleChange,
  handleUpdate,
}) => {
  return (
    <div className="ui cards">
      {maintenanceData.map((row, index) => (
        <div key={index} className="ui card">
          <div className="content">
            <div className="header">{row.machine?.[0] || 'N/A'}</div>
            <div className="meta">Work Order ID: {row.uuid || 'N/A'}</div>
          </div>

          <div className="content">
            <div className="description">
              <p><strong>Root Cause:</strong> {row.cause?.[0] || 'N/A'}</p>
              <p><strong>Downtime Duration:</strong> {row.downtime?.[0] || 'N/A'}</p>
              <p><strong>Operational Impact:</strong> {row.impact?.[0] || 'N/A'}</p>

              {/* Maintenance Category Dropdown */}
              <div className="field" style={{ marginTop: '1em' }}>
                <label><strong>Maintenance Category</strong></label>
                <div className="ui selection dropdown" id={`type-dropdown-${index}`}>
                  <input type="hidden" name="maintenanceType" value={row.maintenanceType} />
                  <i className="dropdown icon" />
                  <div className="default text">
                    {row.maintenanceType || 'Select Category'}
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
              </div>

              {/* Work Status Dropdown */}
              <div className="field" style={{ marginTop: '1em' }}>
                <label><strong>Work Status</strong></label>
                <div className="ui selection dropdown" id={`status-dropdown-${index}`}>
                  <input type="hidden" name="status" value={row.status} />
                  <i className="dropdown icon" />
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
              </div>

              {/* Technician Notes */}
              <div className="field" style={{ marginTop: '1em' }}>
                <label><strong>Technician Notes</strong></label>
                <textarea
                  rows="3"
                  placeholder="Enter any additional observations or remarks..."
                  value={row.notes || ''}
                  onChange={(e) => handleChange(index, 'notes', e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="extra content">
            <button className="ui mini red button" onClick={() => handleUpdate(row)}>
              Submit
            </button>
          </div>
        </div>


      ))}
    </div>
  );
};


