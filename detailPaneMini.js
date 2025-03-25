const { useState, useEffect } = React;

const DetailPaneMini = ({
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
  const isLine = localStorage.getItem(`goalProgress-${departmentName}${departmentName === 'line' ? selectedNumber : '1'}-${modelId}`);
  const notLine = localStorage.getItem(`goalProgress-${departmentName}-${modelId}`);
  const storedGoalData = isLine ? JSON.parse(isLine) : JSON.parse(notLine);
  const [currentProgressUpdate, setCurrentProgressUpdate] = useState();

  const trackProgressPerHour = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const storedProgress = JSON.parse(localStorage.getItem(`hourlyProgress-${departmentName}${departmentName === 'line' ? selectedNumber : ''}-${modelId}`)) || [];

    const hourIndex = storedProgress.findIndex(item => item.hour === currentHour);

    const updatedProgress = storedProgress.filter(item => {
      const itemTime = new Date(item.date);
      const diffInHours = (now - itemTime) / (1000 * 60 * 60);
      return diffInHours < 24;
    });

    if (hourIndex !== -1) {
      updatedProgress[hourIndex] = { hour: currentHour, progress: currentProgressUpdate, date: now.toISOString() };
    } else {
      updatedProgress.push({ hour: currentHour, progress: currentProgressUpdate, date: now.toISOString() });
    }

    if (updatedProgress.length > 12) {
      updatedProgress.splice(0, updatedProgress.length - 12);
    }

    localStorage.setItem(`hourlyProgress-${departmentName}${departmentName === 'line' ? selectedNumber : ''}-${modelId}`, JSON.stringify(updatedProgress));
  };

  const handleGoalChange = (e) => {
    setWorkingThisRow(modelId);
    setGoal(e.target.value);
  };

  const handleProgressChange = (e) => {
    setWorkingThisRow(modelId);
    setProgress(Number(e.target.value) + Number(storedGoalData?.progress));
    setCurrentProgressUpdate(Number(e.target.value));
  };

  const handleSave = () => {
    const listName = 'REPORTS';

    storedGoalData.progress = progress;

    localStorage.setItem(`goalProgress-${departmentName}${departmentName === 'line' ? selectedNumber : ''}-${modelId}`, JSON.stringify(storedGoalData));

    const currentDepartmentName = departmentName === 'line' ? `line${selectedNumber}` : departmentName;

    spMethod.handleSubmit(
      modelId,
      JSON.stringify(storedGoalData),
      currentDepartmentName,
      listName
    ).then(e => console.log(e)).catch(err => console.log(err));

    trackProgressPerHour();
    setProgress('');

    alert('Goal and progress saved!');
  };

  const handleReset = () => {
    setGoal('');
    setProgress('');
  };

  // Step status logic
  const getStepStatus = (progress, goal) => {
    if (progress > 0 && progress < goal) return 'wip';
    if (progress - goal === 0) return 'completed';
  };

  // Steps at the Bottom - UI Ordered Steps
  const steps = () => {
    return React.createElement('div', { className: "ui five wide column" },
      React.createElement(
        'div',
        { className: 'ui ordered steps mini ' },

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
    );
  };

  const stats = () => {
    return React.createElement(
      'div',
      { className: 'ui grid internally celled' },
      React.createElement(
        'div',
        { className: 'five wide column' },
        React.createElement(
          'div',
          { className: 'ui statistic tiny' },
          React.createElement('div', { className: 'value' }, goal || storedGoalData?.goal || 0),
          React.createElement('div', { className: 'label' }, 'Goal')
        )
      ),
      React.createElement(
        'div',
        { className: 'five wide column' },
        React.createElement(
          'div',
          { className: 'ui statistic tiny' },
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
        { className: 'five wide column' },
        React.createElement(
          'div',
          { className: 'ui statistic tiny' },
          React.createElement('div', { className: 'value' }, progress || storedGoalData?.progress || 0),
          React.createElement('div', { className: 'label' }, 'Progress')
        ),
        React.createElement(
          'div',
          { className: 'ui grid' },
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
        React.createElement(
          'div',
          { className: 'ui buttons' },
          React.createElement(
            'button',
            { className: 'ui green button', onClick: handleSave },
            'Save'
          ),
          React.createElement(
            'button',
            { className: 'ui small button', onClick: handleReset },
            'Reset'
          )
        )
      ),
    );
  };

  return React.createElement(
    'div',
    { className: 'ui sixteen wide column' },
    React.createElement(
      'div',
      null,       
      // Title and Stats
      steps(),
      /* isLine ? stats() : notLine ? stats():'No Statistic' , */
      // Steps - move to the bottom
// Moving steps here
    )
  );
};

export default DetailPaneMini;
