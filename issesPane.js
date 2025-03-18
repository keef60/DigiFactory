const { useState, useEffect } = React;

const IssueSelect = (props) => {
  const { spMethod, departmentName, modelId,responseBoxTitle } = props;

  // State to store the selected skills
  const [selectedSkills, setSelectedSkills] = useState([]);

  // Initialize dropdown when the component is mounted
  useEffect(() => {
    $('.ui.dropdown').dropdown({
      allowAdditions: true,
    });
  }, [selectedSkills]);

  // Handle submit and get selected options
  const handleSubmit = (event) => {
    const listName = 'ISSUES';
    event.preventDefault(); // Prevent default form submission behavior

    // Get selected options from the form
    const selectedOptions = Array.from(event.target.skills.selectedOptions).map(option => option.value);
    setSelectedSkills(selectedOptions);

    // Submit the selected options
    spMethod.handleSubmit(
      modelId,
      JSON.stringify(selectedOptions),
      departmentName,
      listName
    ).then(e => {
      console.log(e);

      // Reset the selected options after the submit is successful
      $('.ui.dropdown').dropdown("clear")
      // Alternatively, reset the state (if needed)
      setSelectedSkills([]); // Optionally reset the selected skills state

    }).catch(err => console.log(err));
  };

  return React.createElement(
    "div", // Wrapper div to hold the select and button
    { className: "ui segment   grid  four wide column " },
    React.createElement(
      "h2",
      { className: "ui header small red " },
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
        React.createElement("option", { value: "angular" }, "Angular"),
        React.createElement("option", { value: "css" }, "CSS"),
        React.createElement("option", { value: "design" }, "Graphic Design"),
        React.createElement("option", { value: "ember" }, "Ember"),
        React.createElement("option", { value: "html" }, "HTML"),
        React.createElement("option", { value: "ia" }, "Information Architecture"),
        React.createElement("option", { value: "javascript" }, "Javascript"),
        React.createElement("option", { value: "mech" }, "Mechanical Engineering"),
        React.createElement("option", { value: "meteor" }, "Meteor"),
        React.createElement("option", { value: "node" }, "NodeJS"),
        React.createElement("option", { value: "plumbing" }, "Plumbing"),
        React.createElement("option", { value: "python" }, "Python"),
        React.createElement("option", { value: "rails" }, "Rails"),
        React.createElement("option", { value: "react" }, "React"),
        React.createElement("option", { value: "repair" }, "Kitchen Repair"),
        React.createElement("option", { value: "ruby" }, "Ruby"),
        React.createElement("option", { value: "ui" }, "UI Design"),
        React.createElement("option", { value: "ux" }, "User Experience")
      ),
      React.createElement(
        "button",
        { className: "ui button fluid", type: "submit" },
        "Submit"
      )
    )
  );
};

export default IssueSelect;
