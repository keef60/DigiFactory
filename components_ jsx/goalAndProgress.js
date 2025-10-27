const { useState, useEffect } = React;

const GoalProgressInput = ({
    row,
    workingThisRow,
    goal,
    progress,
    setWorkingThisRow,
    setGoal,
    setProgress,
    calculateCompletion,
    calculateRemaining,
    departmentName
  }) => {
  
    const storedGoalData = JSON.parse(localStorage.getItem(`goalProgress-${departmentName}-${row[0]}`));

    const handleGoalChange = (e) => {
      setWorkingThisRow(row[0]);
      setGoal(e.target.value);
    };
  
    const handleProgressChange = (e) => {
      setWorkingThisRow(row[0]);
      setProgress(e.target.value);
    };
 
    const handleSave = () => {
      const data = { goal, progress };
      localStorage.setItem(`goalProgress-${departmentName}-${row[0]}`, JSON.stringify(data));
      alert('Goal and progress saved!');
    };
  
    const handleReset = () => {
      setGoal('');
      setProgress('');
    };
  
    return React.createElement(
      'div',
      { className: 'ui segment container four wide column grid' },
      React.createElement('h3', null, 'Set Goal and Progress'),
  
      // Goal Input
      React.createElement(
        'div',
        { className: 'ui input sixteen wide column' },
        React.createElement('input', {
          type: 'number',
          placeholder: 'Set Goal (Total Quantity)',
          value: workingThisRow === row[0] ? goal : storedGoalData?.goal,
          onChange: handleGoalChange,
          min: '0',
        })
      ),
  
      // Progress Input
      React.createElement(
        'div',
        { className: 'ui input sixteen wide column' },
        React.createElement('input', {
          type: 'number',
          placeholder: 'Current Progress',
          value: workingThisRow === row[0] ? progress : storedGoalData?.progress,
          onChange: handleProgressChange,
          min: '0',
        })
      ),
  
      // Progress Completion Bar
      React.createElement(
        'div',
        { className: 'ui progress sixteen wide column active' },
        React.createElement(
          'div',
          {
            className: 'bar green',
            style: {
              width: `${calculateCompletion(
                workingThisRow === row[0] ? goal : storedGoalData?.goal,
                workingThisRow === row[0] ? progress : storedGoalData?.progress
              )}%`,
            },
          }
        ),
        React.createElement(
          'div',
          { className: 'label sixteen wide column' },
          `Completion: ${Math.round(
            calculateCompletion(goal, progress)
          )}%`
        )
      ),
  
      // Remaining
      React.createElement(
        'div',
        { className: 'label sixteen wide column' },
        `Remaining: ${Math.round(calculateRemaining(goal, progress))}`
      ),
  
      // Action Buttons
      React.createElement(
        'div',
        { className: 'ui buttons sixteen wide column' },
        React.createElement(
          'button',
          {
            className: 'ui primary blue button',
            onClick: handleSave,
          },
          'Save'
        ),
        React.createElement(
          'button',
          {
            className: 'ui red small button',
            onClick: handleReset,
          },
          'Reset'
        )
      )
    );
  };
  
  export default GoalProgressInput;
