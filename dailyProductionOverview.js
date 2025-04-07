const { useState, useEffect } = React;

const DailyProductionOverview = ({}) => {
  const [data, setData] = useState([]);
  const [goal, setGoal] = useState([]);
  const [departmentClick, setDepartmentClick] = useState();
  const [departmentTitle, setDepartmentTitle] = useState();
  const [expandedRows, setExpandedRows] = useState(new Set()); // Tracks expanded rows for individual progress

  // Function to toggle row expansion
  const toggleRow = (model) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(model)) {
      newExpandedRows.delete(model); // Collapse the model's hourly entries
    } else {
      newExpandedRows.add(model); // Expand the model's hourly entries
    }
    setExpandedRows(newExpandedRows);
  };

  useEffect(() => {
  });

  useEffect(() => {
    const processData = () => {
      let goal = [];
      let aggregatedData = [];

      const keys = Object.keys(localStorage);

      // Loop through goalProgress data
      keys.forEach(key => {
        if (key.includes('goalProgress')) {
          const model = key.split('-')[2];
          const thisDepartment = key.split('-')[1];
          const currentGoal = JSON.parse(localStorage.getItem(key));
          goal.push({ [thisDepartment]: { model: model, goal: currentGoal.goal } });
        }
      });

      // Loop through hourlyProgress data and aggregate hourly progress for each model
      keys.forEach((key) => {
        if (key.includes('hourlyProgress')) {
          const storedData = JSON.parse(localStorage.getItem(key));
          storedData.forEach(item => {
            const time = convertToDateFormat(item.date);
            const hour = `H ${item.hour - 6}`; // Adjusting the hour
            const model = key.split('-')[2];
            const thisSpot = key.split('-')[1];

            // Check if the department matches
            const departmentExists = goal.some(item => thisSpot === departmentClick ? item.hasOwnProperty(departmentClick) : null);

            if (departmentExists) {
              const machinePrd = item.progress;
              const goalForModel = goal.find(item => item[thisSpot] && item[thisSpot].model === model);
              const goalValue = goalForModel ? goalForModel[thisSpot].goal : 0;
              const progressPercentage = ((machinePrd / goalValue) * 100).toFixed(2);

              console.log(machinePrd)

              // Aggregate data for each model
              const existingModel = aggregatedData.find(row => row.model === model);
              if (existingModel) {
                existingModel.machinePrd += machinePrd; // Add to existing total progress
                existingModel.totalGoal = goalValue; // Total goal for that model
                existingModel.totalProgressPercentage = ((existingModel.machinePrd / existingModel.totalGoal) * 100).toFixed(2); // Update progress percentage
                existingModel.individualEntries.push({
                  time,
                  hour,
                  machinePrd,
                  goal: goalValue,
                  progressPercentage: `${progressPercentage}%`,

                });
              } else {
                // Add a new entry for the model if not already present
                aggregatedData.push({
                  model,
                  time,
                  hour,
                  machinePrd,
                  goal: goalValue,
                  carryover:goalValue-machinePrd,
                  progressPercentage: `${progressPercentage}%`,
                  totalProgressPercentage: `${progressPercentage}%`, // Adding percentage for the aggregated row
                  individualEntries: [
                    { time, hour, machinePrd, goal: goalValue, progressPercentage: `${progressPercentage}%` }
                  ]
                });
              }
            }
          });
        }
      });

      setGoal(goal);
      setData(aggregatedData);
    };

    processData();
  }, [departmentClick]);

  return (
    <div
      className="ui grid stackable"
      style={{
        marginLeft: '5%',
        width: '90%',
      }}
    >
      <div className="ui row">
        {/* Sidebar/Selection Menu */}
        <div className='three wide mobile five wide tablet five wide computer column'>
          <SelectionMenuTab_DashComponent
            setDepartmentTitle={setDepartmentTitle}
            setDepartmentClick={setDepartmentClick}
          />
        </div>

        {/* Table Section */}
        <div className='ui segment thirteen wide mobile eleven wide tablet eleven wide computer column'>
          <h3>{departmentTitle}</h3>
          <table className='ui celled striped table black compact very basic  selectable '>
            <thead>
              <tr>
                <th>Date</th>
                <th>Model</th>
                <th>Target Output</th>
                <th>Total Output</th>
                <th>Total Carryover</th>
                <th>Progress %</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <React.Fragment key={index}>
                  {/* Row for aggregated data */}
                  <tr>
                    <td>{row.time}</td>
                    <td>{row.model}</td>
                    <td>{row.goal}</td>
                    <td>{row.machinePrd}</td>
                    <td>{row.carryover}</td>
                    <td>{row.totalProgressPercentage}</td> {/* Show the total progress percentage */}
                    <td>
                      {/* Button to expand or collapse individual hourly entries */}
                      <button 
                        className="ui button" 
                        onClick={() => toggleRow(row.model)}
                      >
                        {expandedRows.has(row.model) ? 'Collapse' : 'Show Individual Entries'}
                      </button>
                    </td>
                  </tr>

                  {/* Row for individual hourly entries (only visible if expanded) */}
                  {expandedRows.has(row.model) && row.individualEntries.map((entry, entryIndex) => (
                    <tr key={`entry-${entryIndex}`}>
                      <td>{entry.time}</td>
                      <td>{entry.hour}</td>
                      <td>{entry.goal}</td>
                      <td>{entry.machinePrd}</td>
                      <td></td>
                      <td>{entry.progressPercentage}</td> {/* Show the progress percentage for each hourly entry */}
                      <td></td> {/* Empty column for alignment */}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};




