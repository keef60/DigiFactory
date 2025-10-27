const { useState, useEffect } = React;

const IssueSelect = (props) => {
  const { spMethod, departmentName, modelId, responseBoxTitle, selectedNumber, listName, issueArrayName } = props;

  // State to store the selected skills
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [reportIssueList, setReportIssueList] = useState([])


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

    const r = async () => {
      try {
        await spMethod.fetchSharePointData('IssueList', issueArrayName)
        .then(e => setReportIssueList(JSON.parse(e.value[0].fields[issueArrayName])))

      } catch (error) {
        return error
      }
    }
    if (reportIssueList.length === 0) r().then(e => e)


  });

  // Handle submit and get selected options
  const handleSubmit = (event) => {

    event.preventDefault(); // Prevent default form submission behavior

    // Get selected options from the form
    const selectedOptions = Array.from(event.target.skills.selectedOptions).map(option => option.value);
    const actionText = event.target.action.value;

    setSelectedSkills({ selectedOptions: selectedOptions, actionText: actionText });
    const currentDepartmentName = departmentName === 'line' ? `line${selectedNumber}` : departmentName;

    // Submit the selected options
    spMethod.handleSubmit(
      modelId,
      { selectedOptions: selectedOptions, actionText: actionText },
      currentDepartmentName,
      listName
    ).then(e => {
      console.log(e);

      // Reset the selected options after the submit is successful
      $('.ui.dropdown').dropdown("clear")
      // Alternatively, reset the state (if needed)
      setSelectedSkills([]); // Optionally reset the selected skills state

    }).catch(err => console.log(err));
  };
  //Form input
  const form = () => {
    return React.createElement('div', { className: 'ui form' },
      React.createElement('div', { className: ' ui  equal width fields' },
        React.createElement('div', { className: 'field' },
          React.createElement('label', null, 'Corrective Action'),
          React.createElement('textarea', {
            name: "action",
            rows: 2,
            placeholder: 'Enter corrective action',
            value: correctiveAction,
            onChange: handleChange
          })
        )
      )

    )

  }

  const createList = () => {
    return reportIssueList.map(i => {
      return React.createElement("option", { value: i }, i)
    })
  }

  return React.createElement(
    "div", // Wrapper div to hold the select and button
    { className: "ui segment  grid container  six wide column " },
    React.createElement(
      "h2",
      { className: "ui header  red " },
      React.createElement("i", { className: "  exclamation circle icon", }),
      React.createElement(
        "div",
        { className: "content" },
        responseBoxTitle
      )
    ),
    React.createElement(
      "form",
      { className: "ui sixteen wide column grid ", onSubmit: handleSubmit },
      React.createElement(
        "select",
        {
          name: "skills",
          multiple: true,
          className: "ui dropdown fluid "
        },
        React.createElement("option", { value: "" }, "Report Issue"),
        createList()
      ),
      form(),
      React.createElement(
        "button",
        { className: "ui button fluid", type: "submit" },
        "Submit"
      )
    )
  );
};

export default IssueSelect;
