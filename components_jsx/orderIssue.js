//Commit Update

const departmentOptions = [
  { key: 'paint', text: 'Paint', value: 'Paint' },
  { key: 'handles', text: 'Handles', value: 'Handles' },
  { key: 'pumps', text: 'Pumps', value: 'Pumps' },
  { key: 'packout', text: 'Packout', value: 'Packout' },
  { key: 'hose', text: 'Hose', value: 'Hose' },
  { key: 'frames', text: 'Frames', value: 'Frames' },
  { key: 'line', text: 'Lines', value: 'Line' },
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
  const [selectedIssue, setSelectedIssue] = useState();
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [reportIssueList, setReportIssueList] = useState([]);
  const [reportImpactList, setReportImpactList] = useState([]);
  const [reportDowntimeDurationsList, setReportDowntimeDurationsList] = useState([]);
  const [reportMachineList, setReportMachineList] = useState([]);
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [issuesListData, setIssuesListData] = useState(undefined);
  const [selectedImpact, setSelectedImpact] = useState();
  const [downtimeDuration, setDowntimeDuration] = useState();
  const [selectedMachine, setSelectedMachine] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ states: { status: false, messeage: '' } });


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
  event.preventDefault();
  setLoading(true);
  setError(prev => ({
    ...prev,
    states: { status: false, messeage: '' }
  }));

  const selectedOptions = {
    cause: [form.selectedIssue],
    downtime: [form.downtimeDuration],
    impact: [form.selectedImpact],
    machine: [form.selectedMachine],
    creationDate: Date.now(),
    uuid: generateUID()
  };

  const allRequiredFieldsFilled = 
    form.selectedIssue &&
    form.selectedMachine &&
    form.correctiveAction &&
    form.selectedImpact;

  if (allRequiredFieldsFilled) {
    main.handleSubmit(
      modelId,
      {
        selectedOptions: selectedOptions,
        actionText: form.correctiveAction
      },
      department,
      "ISSUES"
    )
      .then(() => {
        $('.ui.dropdown').dropdown("clear"); // Clear Semantic UI dropdowns
        resetForm(); // Reset to initial values (make sure resetForm sets form state correctly)
        setSelectedDepartment(department); // If this is needed elsewhere
        setLoading(false);
        alert('All set! The issue has been submitted successfully.');
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

  } else {
    setLoading(false);
    setError(prev => ({
      ...prev,
      states: {
        status: true,
        messeage: 'Required fields must be filled in.'
      }
    }));
  }
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
              data-value={option.key === selectedDepartment ? selectedDepartment : option.key}
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

  //Load inputs
  const storageKey = `${department}_${modelId}_issueForm`;

const [form, setForm, resetForm] = useFormPersistence(storageKey, {
  requesterName: user,
  selectedDepartment: department,
  selectedLine: null,
  selectedIssue: '',
  selectedImpact: '',
  downtimeDuration: '',
  selectedMachine: '',
  correctiveAction: ''
});

useEffect(() => {
  // Wait for DOM to be ready and form state loaded
  if (form) {
    setTimeout(() => {
      $('.ui.dropdown[name="department"]').dropdown('set selected', form.selectedDepartment);
      $('.ui.dropdown[name="line"]').dropdown('set selected', form.selectedLine);
      $('.ui.dropdown[name="issue"]').dropdown('set selected', form.selectedIssue);
      $('.ui.dropdown[name="impact"]').dropdown('set selected', form.selectedImpact);
      $('.ui.dropdown[name="downtime"]').dropdown('set selected', form.downtimeDuration);
      $('.ui.dropdown[name="machine"]').dropdown('set selected', form.selectedMachine);
    }, 0);
  }
}, [form]);

  return (
    <div className="ui segment basic very padded">
      {error.states.status && <div class='ui message negative'>{error.states.messeage}</div>}

      <form className={`ui form fluid ${loading ? 'loading' : ''}`} onSubmit={handleSubmit}>
  {/* Row 1: Requester, Department, Line */}
  <div className="three fields">
    <div className="field">
      <label>Requester Name</label>
      <input
        type="text"
        name="requesterName"
        value={form.requesterName}
        onChange={(e) => setForm(prev => ({ ...prev, requesterName: e.target.value }))}
        placeholder="Enter your name"
      />
    </div>

    <div className="field">
      <label>Department</label>
      <div className="ui fluid selection dropdown" name="department">
        <input type="hidden" name="department" value={form.selectedDepartment} />
        <i className="dropdown icon"></i>
        <div className="default text">Select Department</div>
        <div className="menu">
          {departmentOptions.map(option => (
            <div
              key={option.key}
              className="item"
              data-value={option.value}
              onClick={() =>
                setForm(prev => ({ ...prev, selectedDepartment: option.value }))
              }
            >
              {option.text}
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="field">
      <label>Line</label>
      <div className="ui fluid selection dropdown" name="line">
        <input type="hidden" name="line" value={form.selectedLine} />
        <i className="dropdown icon"></i>
        <div className="default text">Select Line</div>
        <div className="menu">
          {lineOptions.map(option => (
            <div
              key={option.key}
              className="item"
              data-value={option.value}
              onClick={() =>
                setForm(prev => ({ ...prev, selectedLine: option.value }))
              }
            >
              {option.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>

  {/* Row 2: Issues, Corrective Action, Impact */}
  <div className="three fields">
    <div className="field required">
      <label>Issues</label>
      <div className="ui fluid selection dropdown" name="issue">
        <input type="hidden" name="issue" value={form.selectedIssue} />
        <i className="dropdown icon"></i>
        <div className="default text">Select Issue</div>
        <div className="menu">
          {reportIssueList.map((issue, index) => (
            <div
              key={index}
              className="item"
              data-value={issue}
              onClick={() =>
                setForm(prev => ({ ...prev, selectedIssue: issue }))
              }
            >
              {issue}
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="field required">
      <label>Corrective Action</label>
      <textarea
        name="correctiveAction"
        rows="2"
        placeholder="Enter corrective action"
        value={form.correctiveAction}
        onChange={(e) =>
          setForm(prev => ({ ...prev, correctiveAction: e.target.value }))
        }
      />
    </div>

    <div className="field required">
      <label>Impact</label>
      <div className="ui fluid selection dropdown" name="impact">
        <input type="hidden" name="impact" value={form.selectedImpact} />
        <i className="dropdown icon"></i>
        <div className="default text">Select Impact</div>
        <div className="menu">
          {reportImpactList.map((impact, index) => (
            <div
              key={index}
              className="item"
              data-value={impact}
              onClick={() =>
                setForm(prev => ({ ...prev, selectedImpact: impact }))
              }
            >
              {impact}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>

  {/* Row 3: Downtime, Machine, Time */}
  <div className="three fields">
    <div className="field required">
      <label>Downtime Duration</label>
      <div className="ui fluid selection dropdown" name="downtime">
        <input type="hidden" name="downtime" value={form.downtimeDuration} />
        <i className="dropdown icon"></i>
        <div className="default text">Select Downtime</div>
        <div className="menu">
          {reportDowntimeDurationsList.map((downtime, index) => (
            <div
              key={index}
              className="item"
              data-value={downtime}
              onClick={() =>
                setForm(prev => ({ ...prev, downtimeDuration: downtime }))
              }
            >
              {downtime < 60
                ? `${downtime} min`
                : `${(downtime / 60).toFixed(1)} Hr(s)`}
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="field required">
      <label>Machine</label>
      <div className="ui fluid selection dropdown" name="machine">
        <input type="hidden" name="machine" value={form.selectedMachine} />
        <i className="dropdown icon"></i>
        <div className="default text">Select Machine</div>
        <div className="menu">
          {reportMachineList.map((machine, index) => (
            <div
              key={index}
              className="item"
              data-value={machine}
              onClick={() =>
                setForm(prev => ({ ...prev, selectedMachine: machine }))
              }
            >
              {machine}
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="field">
      <label>Current Date and Time</label>
      <input
        type="text"
        name="currentDateTime"
        value={currentDateTime}
        readOnly
      />
    </div>
  </div>

  {/* Submit */}
  <button className="ui black button" type="submit">
    Submit
  </button>
</form>



    </div>

  );
};
