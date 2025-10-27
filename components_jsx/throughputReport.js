//Commit Update
const { useState, useEffect } = React;
const ThroughputReport = () => {

  const [departmentClick, setDepartmentClick] = useState();
  const [departmentTitle, setDepartmentTitle] = useState();

  const data = [
    { productionLine: 'Line 1', hoursOperated: 8, unitsProduced: 1200, throughputRate: 150 },
    { productionLine: 'Line 2', hoursOperated: 8, unitsProduced: 1000, throughputRate: 125 },
  ];

  return (
    <div className="ui grid" style={{ marginLeft: '5%', width: '90%' }}>
      <div className="ui row">
        {/* Sidebar/Selection Menu */}
        <div className="three wide mobile five wide tablet five wide computer column">
          <SelectionMenuTab_DashComponent
            setDepartmentTitle={setDepartmentTitle}
            setDepartmentClick={setDepartmentClick}
          />
        </div>

        {/* Table Section */}
        <div className="thirteen wide mobile eleven wide tablet eleven wide computer column">
          <h3>{departmentTitle}</h3>
          <table className="ui celled striped table black compact">
            <thead>
              <tr>
                <th>Production Line</th>
                <th>Hours Operated</th>
                <th>Units Produced</th>
                <th>Throughput Rate (units/hr)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <React.Fragment key={index}>
                  {/* Row for aggregated downtime data */}
                  <tr key={index}>
                    <td>{row.productionLine}</td>
                    <td>{row.hoursOperated}</td>
                    <td>{row.unitsProduced}</td>
                    <td>{row.throughputRate}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

