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
      <div key={index} className="ui  fluid card" style={{ padding: '1em' }}>
        <div className="content">
          <h3 className="ui header">
            <i className="wrench icon"></i> Work Order: {row.uuid || 'N/A'}
          </h3>
        </div>
  
        <div className="content">
          <div className="ui form">
            <div className="two fields">
              <div className="field">
                <label>Affected Machine</label>
                <div className="ui label">{row.machine?.[0] || 'N/A'}</div>
              </div>
              <div className="field">
                <label>Root Cause</label>
                <div className="ui label">{row.cause?.[0] || 'N/A'}</div>
              </div>
            </div>
  
            <div className="two fields">
              <div className="field">
                <label>Downtime Duration</label>
                <div className="ui label">{row.downtime?.[0] || 'N/A'}</div>
              </div>
              <div className="field">
                <label>Operational Impact</label>
                <div className="ui label">{row.impact?.[0] || 'N/A'}</div>
              </div>
            </div>
  
            <div className="field">
              <label>Technician Description</label>
              <p>{row.actionText || 'N/A'}</p>
            </div>
  
            <div className="two fields">
              <div className="field">
                <label>Maintenance Category</label>
                <div className={`ui selection dropdown ${row.maintenanceType ? 'active visible' : ''}`} id={`type-dropdown-${index}`}>
                  <input type="hidden" name="maintenanceType" value={row.maintenanceType} />
                  <i className="dropdown icon" />
                  <div className="default text">{row.maintenanceType || 'Select Category'}</div>
                  <div className="menu transition visible ">
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
  
              <div className="field">
                <label>Work Status</label>
                <div className={`ui selection dropdown  ${row.status ? 'active visible' : ''}`} id={`status-dropdown-${index}`}>
                  <input type="hidden" name="status" value={row.status} />
                  <i className="dropdown icon" />
                  <div className="default text">{row.status || 'Select Status'}</div>
                  <div className="menu  transition visible">
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
            </div>
  
            <div className="field">
              <label>Technician Notes</label>
              <textarea
                rows="3"
                placeholder="Enter any additional observations or remarks..."
                value={row.notes || ''}
                onChange={(e) => handleChange(index, 'notes', e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>
  
        <div className="extra content" style={{ textAlign: 'right' }}>
          <button className="ui primary mini button" onClick={() => handleUpdate(row)}>
            <i className="check icon" /> Submit
          </button>
        </div>
      </div>
    ))}
  </div>
  
  );
};


