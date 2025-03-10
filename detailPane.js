const { useState, useEffect } = React;

const DetailPane = ({
  row,
  workingThisRow,
  goal,
  progress,
  setWorkingThisRow,
  setGoal,
  setProgress,
  calculateCompletion,
  calculateRemaining,
  departmentName,
}) => {

  console.log("detail Pane: ", departmentName);

  const rowState = departmentName === 'packout' ? row[1] : row[0];
  const storedGoalData = JSON.parse(localStorage.getItem(`goalProgress-${departmentName}-${rowState}`));

  const handleGoalChange = (e) => {
    setWorkingThisRow(rowState);
    setGoal(e.target.value);
  };

  const handleProgressChange = (e) => {
    setWorkingThisRow(rowState);
    setProgress(Number(e.target.value) + Number(storedGoalData?.progress));
  };

  const handleSave = () => {
    storedGoalData.progress = progress;
    localStorage.setItem(`goalProgress-${departmentName}-${rowState}`, JSON.stringify(storedGoalData));
    setProgress('')
    alert('Goal and progress saved!');
  };

  const handleReset = () => {
    setGoal('');
    setProgress('');
  };

  // Step status logic: Returns the step status based on the progress
  const getStepStatus = (progress, goal) => {
    if (progress > 0 && progress < goal) return 'wip';        // In progress
    if (progress - goal === 0) return 'completed';   // Completed
  };

  // Steps at the Bottom - UI Ordered Steps
  const steps = () => {
    return React.createElement(
      'div',
      { className: 'ui ordered four steps bottom attached mini' },

      // Step 1: No Order
      React.createElement(
        'div',
        { className: `step ${getStepStatus(progress, storedGoalData?.goal) === 'no order' ? 'completed' : 'disabled'}` },
        React.createElement(
          'div',
          { className: 'content' },
          React.createElement('div', { className: 'title' }, 'No Order'),
          React.createElement('div', { className: 'description' }, 'No progress made yet')
        )
      ),

      // Step 2: Ordered
      React.createElement(
        'div',
        { className: `step ${storedGoalData?.isActive ? 'active' : 'disabled'}` },
        React.createElement(
          'div',
          { className: 'content' },
          React.createElement('div', { className: 'title' }, 'Ordered'),
          React.createElement('div', { className: 'description' }, 'Progress has been initiated')
        )
      ),

      // Step 3: WIP (Work in Progress)
      React.createElement(
        'div',
        { className: `step ${getStepStatus(storedGoalData?.progress > 0 ? storedGoalData?.progress : progress, storedGoalData?.goal) === 'wip' ? 'active' : 'disabled'}` },
        React.createElement(
          'div',
          { className: 'content' },
          React.createElement('div', { className: 'title' }, 'WIP'),
          React.createElement('div', { className: 'description' }, 'Work in progress')
        )
      ),

      // Step 4: Completed
      React.createElement(
        'div',
        { className: `step ${getStepStatus(storedGoalData?.progress, storedGoalData?.goal) === 'completed' ? 'completed' : 'disabled'}` },
        React.createElement(
          'div',
          { className: 'content' },
          React.createElement('div', { className: 'title' }, 'Completed'),
          React.createElement('div', { className: 'description' }, 'Order is complete')
        )
      )
    )
  }

  const stats = () => {
    return React.createElement(
      'div',
      { className: 'ui grid' },

      // Goal Statistic
      React.createElement(
        'div',
        { className: 'four wide column' },
        React.createElement(
          'div',
          { className: 'ui statistic' },
          React.createElement('div', { className: 'value' }, goal || storedGoalData?.goal || 0),
          React.createElement('div', { className: 'label' }, 'Goal')
        )
      ),

      // Remaining Statistic
      React.createElement(
        'div',
        { className: 'four wide column' },
        React.createElement(
          'div',
          { className: 'ui statistic' },
          React.createElement('div', { className: 'value' },
            Math.round(
              calculateRemaining(
                storedGoalData?.goal, workingThisRow === rowState ? progress : storedGoalData?.progress
              )
            )
          ),
          React.createElement('div', { className: 'label' }, 'Remaining')
        )
      ),

      React.createElement(
        'div',
        { className: 'eight wide column' },
        // Progress Statistic
        React.createElement(
          'div',
          { className: 'eight wide column grid' },
          React.createElement(
            'div',
            { className: 'ui statistic' },
            React.createElement('div', { className: 'value' }, progress || storedGoalData?.progress || 0),
            React.createElement('div', { className: 'label' }, 'Progress')
          ),
    
          // Progress Input
          React.createElement(
            'div',
            { className: 'ui grid  ' },
            React.createElement(
              'div',
              { className: 'sixteen wide column' },
              React.createElement(
                'div',
                { className: 'ui input' },
                React.createElement('input', {
                  type: 'number',
                  placeholder: 'Current Progress',
                  onChange: handleProgressChange,
                  min: '0',
                })
              )
            )
          ),
          React.createElement('div', { className: 'ui divider hidden' }),
          // Action Buttons
          React.createElement(
            'div',
            { className: 'ui buttons' },
            React.createElement(
              'button',
              { className: 'ui primary blue button', onClick: handleSave },
              'Save'
            ),
            React.createElement(
              'button',
              { className: 'ui red small button', onClick: handleReset },
              'Reset'
            )
          )
        )
      )
    )
  }

  return React.createElement(
    'div',
    { className: 'ui eleven wide column' },
    React.createElement(
      'div',
      { className: 'ui ' },

      // Title
      React.createElement('h2', { className: 'ui header' }, 'Goal and Progress Overview'),

      stats(),
      React.createElement('div', { className: 'ui divider' }),
    ), steps());
};

export default DetailPane;
