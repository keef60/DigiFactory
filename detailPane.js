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
  spMethod,
  selectedNumber,
  issue
}) => {

  console.log("detail Pane: ", departmentName);

  const modelId = departmentName === 'packout' ? row[0] : row[0];
  const isLine = localStorage.getItem(`goalProgress-${departmentName}${departmentName === 'line' ? selectedNumber : ''}-${modelId}`)
  const notLine = localStorage.getItem(`goalProgress-${departmentName}-${modelId}`);
  const storedGoalData = isLine ? JSON.parse(isLine) : JSON.parse(notLine);


  const trackProgressPerHour = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const storedProgress = JSON.parse(localStorage.getItem(`hourlyProgress-${departmentName}${departmentName === 'line' ? selectedNumber : ''}-${modelId}`)) || [];
  
    // Find the index of the hour that matches the current hour, or start fresh
    const hourIndex = storedProgress.findIndex(item => item.hour === currentHour);
  
    // Remove entries older than 24 hours
    const updatedProgress = storedProgress.filter(item => {
      const itemTime = new Date(item.date);
      const diffInHours = (now - itemTime) / (1000 * 60 * 60); // time difference in hours
      return diffInHours < 24; // Only keep entries within the last 24 hours
    });
  
    // If the hour exists in the array, overwrite it, otherwise add a new entry for that hour
    if (hourIndex !== -1) {
      updatedProgress[hourIndex] = { hour: currentHour, progress: progress, date: now.toISOString() };
    } else {
      // Push new entry
      updatedProgress.push({ hour: currentHour, progress: progress, date: now.toISOString() });
    }
  
    // Ensure only 12 hours worth of data is kept (from hour1 to hour12)
    if (updatedProgress.length > 12) {
      updatedProgress.splice(0, updatedProgress.length - 12);
    }
  
    // Update the localStorage
    localStorage.setItem(`hourlyProgress-${departmentName}${departmentName === 'line' ? selectedNumber : ''}-${modelId}`, JSON.stringify(updatedProgress));
  };
  
  



  const handleGoalChange = (e) => {
    setWorkingThisRow(modelId);
    setGoal(e.target.value);
  };

  const handleProgressChange = (e) => {
    setWorkingThisRow(modelId);
    setProgress(Number(e.target.value) + Number(storedGoalData?.progress));
  };

  const handleSave = () => {

    const listName = 'REPORTS'

    storedGoalData.progress = progress;

    localStorage.setItem(`goalProgress-${departmentName}${departmentName === 'line' ? selectedNumber : ''}-${modelId}`, JSON.stringify(storedGoalData));

    const currentDepartmentName = departmentName === 'line' ? `line${selectedNumber}` : departmentName;

    spMethod.handleSubmit(
      modelId,
      JSON.stringify(storedGoalData),
      currentDepartmentName,
      listName
    ).then(e => console.log(e)).catch(err => console.log(err));

      // Track the hourly progress
  trackProgressPerHour();
    setProgress('');

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
    return React.createElement('div', { className: "ui four wide column" },
      React.createElement(
        'div',
        { className: 'ui ordered  fluid vertical steps mini ' },

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
            React.createElement('div', { className: 'description' }, 'Order initiated')
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
    )
  }

  const stats = () => {
    return React.createElement(
      'div',
      { className: 'ui grid internally celled ' },
      steps(),
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
                storedGoalData?.goal, workingThisRow === modelId ? progress : storedGoalData?.progress
              )
            )
          ),
          React.createElement('div', { className: 'label' }, 'Remaining')
        )
      ),

      React.createElement(
        'div',
        { className: 'four wide column' },
        // Progress Statistic
        React.createElement(
          'div',
          { className: 'eight wide column grid ' },
          React.createElement(
            'div',
            { className: 'ui statistic  ' },
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
              { className: 'ui  green  button', onClick: handleSave },
              'Save'
            ),
            React.createElement(
              'button',
              { className: 'ui  small button', onClick: handleReset },
              'Reset'
            )
          )
        )
      ),
    )
  }


  return React.createElement(
    'div',
    { className: 'ui sixteen wide column   ' },
    React.createElement(
      'div',
      null,
      // Title
      stats(),

    ));
};

export default DetailPane;
