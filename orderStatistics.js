const OrderStatistic = ({
  departmentName,
  selectedNumber,
  title,
  setPassProgress,
  gpDataInput,
  reload,
  setReload
}) => {

  const modelId = title;
  const dpName = departmentName === 'line' ? departmentName + selectedNumber : departmentName;
  const [gpData] = useState(gpDataInput);
  const [canStartOrder, setCanStartOrder] = useState(false);
  const isLine = localStorage.getItem(`goalProgress-${dpName}-${modelId}`);
  const notLine = localStorage.getItem(`goalProgress-${dpName}-${modelId}`);
  //const storedGoalData = isLine ? JSON.parse(isLine) : JSON.parse(notLine);
  const [storedGoalData, setStoredGoalData] = useState()
  const [currentProgressUpdate, setCurrentProgressUpdate] = useState();
  const [goal, setGoal] = useState(storedGoalData?.goal);
  const [progress, setProgress] = useState(storedGoalData?.progress);
  const boolRef = useRef('');
  const [updatedHourly, setUpdatedHourly] = useState()

 

  useEffect(() => {
    try {
      if (storedGoalData) {
        let total = 0;
        for (let p of storedGoalData.efficiencyMetricsCaptured) {
          total += (p.progress);
        };
        setProgress(total);
      };
    } catch (error) {
      console.warn('------------------Waiting for storedGoalData data ');

    }

  }, [storedGoalData])
  useEffect(() => {
    try {

      gpDataInput.reports.map(item => {
        let bool = String(modelId) === String(item.fields.Title) &&
          item.fields[dpName] !== undefined;
        const parsedData = JSON.parse(item.fields[dpName]);
        if (bool) setStoredGoalData(parsedData);
      });

    } catch (error) {
      console.warn('------------------Waiting for report data ');
    }

  }, [gpDataInput, selectedNumber, reload]);

  useEffect(() => {
    try {

      gpDataInput.materialsPicks.map(item => {
        String(modelId) === String(item.fields.Title) &&
          item.fields[dpName] !== undefined ?
          setCanStartOrder(true) : setCanStartOrder(false);
      });
    } catch (error) {
      console.warn('------------------Waiting for material Picks data ');
    }

  }, [gpDataInput, selectedNumber, reload]);

  useEffect(() => {
    trackProgressPerHour();
  }, [currentProgressUpdate]);

  const trackProgressPerHour = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const storedProgress = storedGoalData?.efficiencyMetricsCaptured || [] /* || JSON.parse(localStorage.getItem(`hourlyProgress-${dpName}-${modelId}`)) */;

    const hourIndex = storedProgress?.findIndex(item => item.hour === currentHour);

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

    setUpdatedHourly(updatedProgress);

    localStorage.setItem(`hourlyProgress-${dpName}-${modelId}`, JSON.stringify(updatedProgress));
  };

  const handleProgressChange = (e) => {
    let prgs = Number(e.target.value) + Number(storedGoalData?.progress);
    setProgress(prgs);
    setCurrentProgressUpdate(Number(e.target.value));
  };

  const handleSave = () => {
    trackProgressPerHour()
    const listName = 'REPORTS';

    storedGoalData.progress = progress;

    const logUpdatedData = handleLogs(storedGoalData).addLog("Efficiency Metrics Captured");
    handleLogs(logUpdatedData).addDataToLog("Efficiency Metrics Captured", updatedHourly);

    localStorage.setItem(`goalProgress-${dpName}-${modelId}`, JSON.stringify(storedGoalData));

    const currentDepartmentName = dpName;

    main.handleSubmit(
      modelId,
      logUpdatedData,
      currentDepartmentName,
      listName
    ).then(e => { }).catch(err => console.log(err));
    setReload(prev => ({ ...prev, status: true }));

    alert('Goal and progress saved!');
    setPassProgress(true);
  };

  const handleReset = () => {
    setGoal('');
    setProgress('');
  };

  return (<>
    <h3 class='header ui'>Hourly Production Entry  </h3>
    <div class='ui divider'></div>
    <div className="ui  horizontal statistics tiny" >
      <div className="ui statistic">
        <div className="value">{goal || storedGoalData?.goal || 0}</div>
        <div className="label">Goal</div>
      </div>

      <div className="ui statistic">
        <div className="value">
          {Math.round(calculateRemaining(storedGoalData?.goal, modelId ? progress : storedGoalData?.progress))}
        </div>
        <div className="label">Remaining</div>
      </div>

      <div className="eight wide column grid">
        <div className="ui statistic">
          <div className="value">{progress || storedGoalData?.progress  || 0}</div>
          <div className="label">Progress</div>
        </div>
        <div className="ui grid">
          <div className="sixteen wide column">
            <div className="ui input">
              <input
                type="number"
                placeholder="Current Progress"
                onChange={handleProgressChange}
                min="0"
              />
            </div>
          </div>
        </div>
        <div className="ui divider hidden" />
        {canStartOrder && <div className="ui buttons small">
          <button className="ui black button" onClick={handleSave}>Save</button>
          <button className="ui  button" onClick={handleReset}>Reset</button>
        </div>}
        {!canStartOrder && <div class='ui message warning'>Pick List Incomplete – Pending Item Selection</div>}
      </div>
    </div></>)
};