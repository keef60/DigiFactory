

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
const OrderIssues = ({ department, user, modelId }) => {
  const [requesterName, setRequesterName] = useState(user);
  const [selectedDepartment, setSelectedDepartment] = useState(department);
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [reportIssueList, setReportIssueList] = useState([]);
  const [reportImpactList, setReportImpactList] = useState([]);
  const [reportDowntimeDurationsList, setReportDowntimeDurationsList] = useState([]);
  const [reportMachineList, setReportMachineList] = useState([]);
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [issuesListData, setIssuesListData] = useState(undefined);
  const [selectedImpact, setSelectedImpact] = useState('');
  const [downtimeDuration, setDowntimeDuration] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleString());
    }, 1000); // Update every second

    $('.ui.dropdown').dropdown();

    return () => clearInterval(intervalId); // Cleanup the interval on unmount
  }, []);

  useEffect(() => {

    const data = async () => {
      await main.fetchSharePointData('IssueList', 'issues')
        .then((e) => {
          const fields = e.value[0].fields;
          setIssuesListData(fields)
        }).catch(err => {
          console.log('================> STOCK ERROR', err);
        });
    }

    if (issuesListData) {
      const fetchedData = {
        issues: JSON.parse(issuesListData.issues),
        impacts: JSON.parse(issuesListData.impact),
        downtimeDurations: JSON.parse(issuesListData.downtimeDurations),
        machines: JSON.parse(issuesListData.machine)
      };
      setReportIssueList(fetchedData.issues);
      setReportImpactList(fetchedData.impacts);
      setReportDowntimeDurationsList(fetchedData.downtimeDurations);
      setReportMachineList(fetchedData.machines);
    } else {
      data()
    }
  }, [issuesListData]);

  // Handle submit and get selected options
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    setLoading(true);
    // Get selected options from the form
    /*   const selectedCause = Array.from(event.target.issue.selectedOptions).map(option => option.value);
      const selectedDowntime = Array.from(event.target.downtime.selectedOptions).map(option => option.value);
      const selectedImpact = Array.from(event.target.impact.selectedOptions).map(option => option.value);
      const selectedMachine = Array.from(event.target.machine.selectedOptions).map(option => option.value);
      const actionText = event.target.action.value; */

    const selectedOptions = {
      cause: [selectedIssue],
      downtime: [downtimeDuration],
      impact: [selectedImpact],
      machine: [selectedMachine],
      creationDate: Date.now(),
      uuid: generateUID()
    }


    // Submit the selected options
    main.handleSubmit(
      modelId,
      {
        selectedOptions: selectedOptions,
        actionText: correctiveAction
      },
      department,
      "ISSUES"
    )
      .then(e => {
        console.log(e);
        // Reset the selected options after the submit is successful
        $('.ui.dropdown').dropdown("clear");
        setCorrectiveAction('');
        setLoading(false);
        alert('All set! The issue has been submitted successfully.')
      })
      .catch(err => console.log(err));
  };

  // Create dropdown list
  const createDropdown = (name, options, label) => (
    <div className="field">
      <label>{label}</label>
      <div className="ui fluid selection dropdown">
        <input
          type="hidden"
          name={name}
          value={name === 'department' ? selectedDepartment : name === 'line' ? selectedLine : selectedIssue}
          onChange={(e) => {
            if (name === 'department') {
              setSelectedDepartment(e.target.value);
            } else if (name === 'line') {
              setSelectedLine(e.target.value);
            } else {
              setSelectedIssue(e.target.value);
            }
          }}
        />
        <i className="dropdown icon"></i>
        <div className="default text">Select {label}</div>
        <div className="menu">
          {options.map((option) => (
            <div
              key={option.key}
              className="item"
              data-value={option.value}
              onClick={() => {
                if (name === 'department') {
                  setSelectedDepartment(option.value);
                } else if (name === 'line') {
                  setSelectedLine(option.value);
                } else {
                  setSelectedIssue(option.value);
                }
              }}
            >
              {option.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="ui segment basic very padded">
      <form className={`ui form fluid ${loading ? 'loading' : ''}`} onSubmit={handleSubmit}>

        {/* First set of 3 fields */}
        <div className="three fields">
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
            {/* Department Dropdown */}
            {createDropdown('department', departmentOptions, 'Department')}
          </div>

          <div className="field">
            {/* Line Dropdown */}
            {createDropdown('line', lineOptions, 'Line')}
          </div>
        </div>

        {/* Second set of 3 fields */}
        <div className="three fields">
          <div className="field">
            {/* Issue Dropdown */}
            <label>Issues</label>
            <div className="ui fluid selection dropdown" multiple>
              <input
                type="hidden"
                name="issue"
                value={selectedIssue}
                onChange={(e) => setSelectedIssue(e.target.value)}
              />
              <i className="dropdown icon"></i>
              <div className="default text">Select Issue</div>
              <div className="menu">
                {reportIssueList.map((issue, index) => (
                  <div
                    key={index}
                    className="item"
                    data-value={issue}
                    onClick={() => setSelectedIssue(issue)}
                  >
                    {issue}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="field">
            {/* Corrective Action Field */}
            <div className="field">
              <label>Corrective Action</label>
              <textarea
                name="action"
                rows="2"
                placeholder="Enter corrective action"
                value={correctiveAction}
                onChange={(e) => setCorrectiveAction(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            {/* Impact Dropdown */}
            <div className="field">
              <label>Impact</label>
              <div className="ui fluid selection dropdown">
                <input
                  type="hidden"
                  name="impact"
                  value={selectedIssue}
                  onChange={(e) => setSelectedImpact(e.target.value)}
                />
                <i className="dropdown icon"></i>
                <div className="default text">Select Impact</div>
                <div className="menu">
                  {reportImpactList.map((impact, index) => (
                    <div
                      key={index}
                      className="item"
                      data-value={impact}
                      onClick={() => setSelectedImpact(impact)}
                    >
                      {impact}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Third set of 3 fields */}
        <div className="three fields">
          <div className="field">
            {/* Downtime Duration Dropdown */}
            <div className="field">
              <label>Downtime Duration</label>
              <div className="ui fluid selection dropdown">
                <input
                  type="hidden"
                  name="downtime"
                  value={selectedIssue}
                  onChange={(e) => setDowntimeDuration(e.target.value)}
                />
                <i className="dropdown icon"></i>
                <div className="default text">Select Downtime</div>
                <div className="menu">
                  {reportDowntimeDurationsList.map((downtime, index) => (
                    <div
                      key={index}
                      className="item"
                      data-value={downtime}
                      onClick={() => setDowntimeDuration(downtime)}
                    >
                      {downtime < 60 ? `${downtime} min` : `${minutesToHours(downtime)} Hr(s)`}

                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="field">
            {/* Machine Dropdown */}
            <div className="field">
              <label>Machine</label>
              <div className="ui fluid selection dropdown">
                <input
                  type="hidden"
                  name="machine"
                  value={selectedIssue}
                  onChange={(e) => setSelectedMachine(e.target.value)}
                />
                <i className="dropdown icon"></i>
                <div className="default text">Select Machine</div>
                <div className="menu">
                  {reportMachineList.map((machine, index) => (
                    <div
                      key={index}
                      className="item"
                      data-value={machine}
                      onClick={() => setSelectedMachine(machine)}
                    >
                      {machine}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="field">
            {/* Current Date and Time Field */}
            <div className="field">
              <label>Current Date and Time</label>
              <input
                type="text"
                value={currentDateTime}
                readOnly
                style={{ backgroundColor: '#f1f1f1' }}
              />
            </div>
          </div>
        </div>



        {/* Submit Button */}
        <button className="ui primary button" type="submit">
          Submit
        </button>
      </form>

    </div>

  );
};
