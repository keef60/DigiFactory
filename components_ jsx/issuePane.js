const { useEffect, useRef, useState } = React

const IssueSelectNew = ({
  spMethod,
  departmentName,
  modelId,
  responseBoxTitle,
  selectedNumber,
  listName,
  issueArrayName,
  issesListData
}) => {


  // State to store the selected skills
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [reportIssueList, setReportIssueList] = useState([]);
  const [reportImpactList, setReportImpactList] = useState([]);
  const [reportDowntimeDurationsList, setReportDowntimeDurationsList] = useState([]);
  const [reportMachineList, setReportMachineList] = useState([]);

  const handleChange = (event) => {
    setCorrectiveAction(event.target.value);
  };

  const handleClear = () => {
    setCorrectiveAction('');
  };

  // Initialize dropdown when the component is mounted
  useEffect(() => {
    $('.ui.dropdown').dropdown({
      allowAdditions: true,
    });
  }, [selectedSkills]);

  useEffect(() => {

    if (reportIssueList.length === 0) {
      const fields = issesListData;
      setReportIssueList(JSON.parse(fields[issueArrayName]));
      setReportDowntimeDurationsList(JSON.parse(fields['downtimeDurations']));
      setReportImpactList(JSON.parse(fields['impact']));
      setReportMachineList(JSON.parse(fields['machine']));
    }

  }, [reportIssueList, issesListData]);

  // Handle submit and get selected options
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Get selected options from the form
    const selectedCause = Array.from(event.target.cause.selectedOptions).map(option => option.value);
    const selectedDowntime = Array.from(event.target.downtime.selectedOptions).map(option => option.value);
    const selectedImpact = Array.from(event.target.impact.selectedOptions).map(option => option.value);
    const selectedMachine = Array.from(event.target.machine.selectedOptions).map(option => option.value);
    const actionText = event.target.action.value;

    const selectedOptions ={
      cause:selectedCause,
      downtime:selectedDowntime,
      impact:selectedImpact,
      machine:selectedMachine,
      creationDate: Date.now()
    }

    const currentDepartmentName = departmentName === 'line' ? `line${selectedNumber}` : departmentName;

    // Submit the selected options
    spMethod.handleSubmit(
      modelId,
      { selectedOptions: selectedOptions, actionText: actionText },
      currentDepartmentName,
      listName
    )
      .then(e => {
        console.log(e);

        // Reset the selected options after the submit is successful
        $('.ui.dropdown').dropdown("clear");
        document.getElementById("myForm").reset();  // Resets the form fields

        setSelectedSkills([]); // Optionally reset the selected skills state
      })
      .catch(err => console.log(err));
  };

  // Form input
  const form = () => (
    <div  className="ui form">
      <div className="ui equal width fields">
        <div className="field">
          <label>Corrective Action</label>
          <textarea
            name="action"
            rows="2"
            placeholder="Enter corrective action"
            value={correctiveAction}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );

  // Create issue list options
  const createList = (issueList, issueTitle) => {

    return (
    <div className='field'>
        <label>{issueTitle}</label>
        <select
          name={issueTitle.toLowerCase()}
          multiple
          className="ui dropdown fluid"
        >
          <option value="">Select option</option>
          {issueList.map((i, indx) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>
    )
  };

  return (
    <div className="ui segment grid container six wide column">
      <h2 className="ui header red">
        <i className="exclamation circle icon" />
        <div className="content">{responseBoxTitle}</div>
      </h2>
      <form id="myForm" className="ui sixteen wide column grid" onSubmit={handleSubmit}>

        {createList(reportIssueList, 'Cause')}
        {createList(reportDowntimeDurationsList, 'Downtime')}
        {createList(reportImpactList, 'Impact')}
        {createList(reportMachineList, 'Machine')}

        {form()}
        <button className="ui button fluid" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};


