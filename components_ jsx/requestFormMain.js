const { useState, useEffect } = React;

const departmentOptions = [
  { key: 'paint', text: 'Paint', value: 'Paint' },
  { key: 'handles', text: 'Handles', value: 'Handles' },
  { key: 'pumps', text: 'Pumps', value: 'Pumps' },
  { key: 'packout', text: 'Packout', value: 'Packout' },
  { key: 'hose', text: 'Hose', value: 'Hose' },
  { key: 'frames', text: 'Frames', value: 'Frames' },
  { key: 'lines', text: 'Lines', value: 'Lines' },
  { key: 'inventory', text: 'Inventory', value: 'Inventory' },
];

const lineOptions = [
  { key: 1, text: '1', value: 1 },
  { key: 2, text: '2', value: 2 },
  { key: 3, text: '3', value: 3 },
  { key: 4, text: '4', value: 4 },
  { key: 5, text: '5', value: 5 },
  { key: 6, text: '6', value: 6 },
  { key: 7, text: '7', value: 7 },
];

const issueOptions = [
  { key: 'issue1', text: 'Issue 1', value: 'Issue 1' },
  { key: 'issue2', text: 'Issue 2', value: 'Issue 2' },
  { key: 'issue3', text: 'Issue 3', value: 'Issue 3' },
  { key: 'issue4', text: 'Issue 4', value: 'Issue 4' },
];

const MaintenanceRequest = () => {
  const [requesterName, setRequesterName] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString());
    }, 1000); // Update every second

    $('.ui.dropdown').dropdown();

    return () => clearInterval(intervalId); // Cleanup the interval on unmount


  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({
      requesterName,
      selectedDepartment,
      selectedLine,
      selectedIssue,
      currentDateTime,
    });
  };

  return (
    <div class='ui segment black'>
    <div className="ui grid segment " style={{ padding:'2%', marginTop: '2%', marginLeft: '5%', width: '90%' }}>

      <form className="ui form fluid" onSubmit={handleSubmit}>
        <div className="field">
          <label>Requester Name</label>
          <input
            type="text"
            value={requesterName}
            onChange={(e) => setRequesterName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <div className="field">
          <label>Department</label>
          <div className="ui fluid selection dropdown">
            <input
              type="hidden"
              name="department"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            />
            <i className="dropdown icon"></i>
            <div className="default text">Select Department</div>
            <div className="menu">
              {departmentOptions.map((option) => (
                <div
                  key={option.key}
                  className="item"
                  data-value={option.value}
                  onClick={() => setSelectedDepartment(option.value)}
                >
                  {option.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="field">
          <label>Line</label>
          <div className="ui fluid selection dropdown">
            <input
              type="hidden"
              name="line"
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
            />
            <i className="dropdown icon"></i>
            <div className="default text">Select Line</div>
            <div className="menu">
              {lineOptions.map((option) => (
                <div
                  key={option.key}
                  className="item"
                  data-value={option.value}
                  onClick={() => setSelectedLine(option.value)}
                >
                  {option.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="field">
          <label>Sample Issue</label>
          <div className="ui fluid selection dropdown">
            <input
              type="hidden"
              name="issue"
              value={selectedIssue}
              onChange={(e) => setSelectedIssue(e.target.value)}
            />
            <i className="dropdown icon"></i>
            <div className="default text">Select Issue</div>
            <div className="menu">
              {issueOptions.map((option) => (
                <div
                  key={option.key}
                  className="item"
                  data-value={option.value}
                  onClick={() => setSelectedIssue(option.value)}
                >
                  {option.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="field">
          <label>Current Date and Time</label>
          <input
            type="text"
            value={currentDateTime}
            readOnly
            style={{ backgroundColor: '#f1f1f1' }}
          />
        </div>

        <button className="ui primary button" type="submit">
          Submit
        </button>
      </form>
    </div>
    </div>
  );
};


