const ProductionDowntimeReport = () => {
  const [data, setData] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set()); // Track expanded rows
  const [departmentClick, setDepartmentClick] = useState();
  const [departmentTitle, setDepartmentTitle] = useState();

  // Function to toggle row expansion
  const toggleRow = (machine) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(machine)) {
      newExpandedRows.delete(machine); // Collapse
    } else {
      newExpandedRows.add(machine); // Expand
    }
    setExpandedRows(newExpandedRows);
  };

  useEffect(() => {
    const fetchDowntimeData = async () => {
      try {
        // Fetch issues from SharePoint
        const issues = await main.fetchSharePointData('ISSUES', 'issues', false)
          .then(e => e.value)
          .catch(err => console.log(err));

        let downtimeData = [];
        // Loop through the SharePoint issues and structure the data
        issues.forEach((issue) => {
          const issueOrderData = JSON.parse(issue.fields[departmentClick]);
          const issueWithThisOrder = issueOrderData.selectedOptions

          const machine = issueWithThisOrder['machine'] ? issueWithThisOrder['machine'].join(",") : ""; // Assuming 'Machine' is a field in issues
          const downtimeDuration = parseInt(issueWithThisOrder['downtime'][0]) || 0; // Assume downtime in minutes
          const reasons = issueWithThisOrder['cause'] ? issueWithThisOrder['cause'].map(c => {
            return <div class="ui label horizontal basic red">{c}</div>
          }) : "";
          const impacts = issueWithThisOrder['impact'] ? issueWithThisOrder['impact'].join(",") : "";
          const correctiveAction = issueOrderData['actionText'] ? issueOrderData['actionText'] : "No Corrective Action Available ";

          // Aggregating downtime data for each machine
          const existingMachine = downtimeData.find(row => row.machine === machine);
          if (existingMachine) {
            existingMachine.downtimeDuration += downtimeDuration; // Accumulate downtime
            existingMachine.impact = `${existingMachine.impact}, ${impacts}`; // Concatenate impacts

          } else {

            downtimeData.push({
              machine,
              downtimeDuration,
              reason: reasons,
              impact: impacts,
              individualEntries: [
                {
                  downtimeDuration,
                  reason: reasons,
                  impact: impacts,
                  correctiveAction
                }
              ]
            });
          }

          // Set the processed data into state
          setData(downtimeData);
        });
      } catch (error) {
        console.error('Error fetching downtime data', error);
      }

    };

    fetchDowntimeData();
  }, [departmentClick]);

  return (
    <div className="ui" style={{ marginLeft: '5%', width: '90%' }}>
      <SelectionMenuTab_DashComponent
        setDepartmentTitle={setDepartmentTitle}
        setDepartmentClick={setDepartmentClick}
      />

      {/* Table Section */}
      <div className=" ui segment black ui thirteen wide mobile eleven wide tablet eleven wide computer column">
        <h3>{departmentTitle}</h3>
        <table className="ui celled striped table black very basic compact">
          <thead>
            <tr>
              <th>Machine</th>
              <th>Downtime Duration</th>
              <th>Reason</th>
              <th>Impact on Output</th>
              <th>Corrective Actions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <React.Fragment key={index}>
                {/* Row for aggregated downtime data */}
                <tr>
                  <td>{row.machine}</td>
                  <td>{row.downtimeDuration} mins</td>
                  <td>{row.reason}</td>
                  <td>{row.impact}</td>
                  <td></td>
                  <td>
                    <button
                      className="ui button"
                      onClick={() => toggleRow(row.machine)}
                    >
                      {expandedRows.has(row.machine)
                        ? 'Collapse'
                        : 'Show Individual Entries'}
                    </button>
                  </td>
                </tr>

                {/* Row for individual downtime entries (only visible if expanded) */}
                {expandedRows.has(row.machine) &&
                  row.individualEntries.map((entry, entryIndex) => (
                    <tr key={`entry-${entryIndex}`}>
                      <td>{entry.machine}</td>
                      <td>{entry.downtimeDuration} mins</td>
                      <td>{entry.reason}</td>
                      <td>{entry.impact}</td>
                      <td>{entry.correctiveAction}</td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
