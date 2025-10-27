const Ostats = ({
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

  const { data: effectiveGpDataInput, isOffline } = useOfflineFallback(gpDataInput);

  const [storedGoalData, setStoredGoalData] = useState();
  const [currentProgressUpdate, setCurrentProgressUpdate] = useState();
  const [goal, setGoal] = useState();
  const [progress, setProgress] = useState();
  const [canStartOrder, setCanStartOrder] = useState(false);
  const [updatedHourly, setUpdatedHourly] = useState();
  const boolRef = useRef('');

  // Update progress when storedGoalData changes
  useEffect(() => {
    if (storedGoalData) {
      try {
        let total = 0;
        for (let p of storedGoalData.efficiencyMetricsCaptured || []) {
          total += p.progress;
        }
        setProgress(total);
        setGoal(storedGoalData?.goal);
      } catch (error) {
        console.warn('Error calculating progress from storedGoalData');
      }
    }
  }, [storedGoalData]);

  // Extract storedGoalData from reports
  useEffect(() => {
    try {
      effectiveGpDataInput?.reports?.forEach(i => {
        const hasValidData = String(modelId) === String(i.fields.Title) && i.fields[dpName] !== undefined;

        if (hasValidData) {
          try {
            const parsedData = JSON.parse(i.fields[dpName]);
            setStoredGoalData(parsedData);
          } catch (error) {
            console.error("Invalid JSON for:", i.fields.Title, error);
          }
        }
      });
    } catch (error) {
      console.warn('Waiting for report data');
    }
  }, [effectiveGpDataInput, dpName, modelId, reload]);

  // Determine if the order can start
  useEffect(() => {
    try {
      const canStart = effectiveGpDataInput?.materialsPicks?.some(item =>
        String(modelId) === String(item.fields.Title) &&
        item.fields[dpName] !== undefined
      );
      setCanStartOrder(!!canStart);
    } catch (error) {
      console.warn('Waiting for material picks data');
    }
  }, [effectiveGpDataInput, dpName, modelId, reload]);

  // Recalculate hourly progress when current progress updates
  useEffect(() => {
    trackProgressPerHour();
  }, [currentProgressUpdate]);

  const trackProgressPerHour = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const storedProgress = storedGoalData?.efficiencyMetricsCaptured || [];

    const hourIndex = storedProgress.findIndex(item => item.hour === currentHour);

    const updatedProgress = storedProgress.filter(item => {
      const itemTime = new Date(item.date);
      const diffInHours = (now - itemTime) / (1000 * 60 * 60);
      return diffInHours < 24;
    });

    const newEntry = {
      hour: currentHour,
      progress: currentProgressUpdate,
      date: now.toISOString()
    };

    if (hourIndex >= 0) {
      updatedProgress.splice(hourIndex, 1, newEntry);
    } else {
      updatedProgress.push(newEntry);
    }

    if (updatedProgress.length > 12) {
      updatedProgress.splice(0, updatedProgress.length - 12);
    }

    setUpdatedHourly(updatedProgress);
   // localStorage.setItem(`hourlyProgress-${dpName}-${modelId}`, JSON.stringify(updatedProgress));
  };

  const handleProgressChange = (e) => {
    const additionalProgress = Number(e.target.value);
    const newProgress = additionalProgress + Number(storedGoalData?.progress || 0);
    setProgress(newProgress);
    setCurrentProgressUpdate(additionalProgress);
  };

  const handleSave = () => {
    trackProgressPerHour();

    storedGoalData.progress = progress;
    const updatedData = handleLogs(storedGoalData).addLog("Efficiency Metrics Captured");
    handleLogs(updatedData).addDataToLog("Efficiency Metrics Captured", updatedHourly);

   // localStorage.setItem(`goalProgress-${dpName}-${modelId}`, JSON.stringify(storedGoalData));

    const listName = 'REPORTS';

    main.handleSubmit(modelId, updatedData, dpName, listName)
      .then(() => {
        alert('Goal and progress saved!');
        setPassProgress(true);
        setReload(prev => ({ ...prev, status: true }));
      })
      .catch(err => {
        console.error('Error submitting data:', err);
        alert('Error saving progress. You might be offline.');
      });
  };

  const handleReset = () => {
    setGoal('');
    setProgress('');
  };

  return (
    <>
      <h3 className="header ui">Hourly Production Entry</h3>
      <div className="ui divider"></div>

      {isOffline && (
        <div className="ui message warning">
          <strong>Offline Mode:</strong> Using previously saved data. Changes will sync when you're back online.
        </div>
      )}

      <div className="ui horizontal statistics tiny">
        <div className="ui statistic">
          <div className="value">{goal || storedGoalData?.goal || 0}</div>
          <div className="label">Goal</div>
        </div>

        <div className="ui statistic">
          <div className="value">
            {Math.round(
              calculateRemaining(storedGoalData?.goal, modelId ? progress : storedGoalData?.progress)
            )}
          </div>
          <div className="label">Remaining</div>
        </div>

        <div className="eight wide column grid">
          <div className="ui statistic">
            <div className="value">{progress || storedGoalData?.progress || 0}</div>
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

          {canStartOrder ? (
            <div className="ui buttons small">
              <button className="ui black button" onClick={handleSave}>Save</button>
              <button className="ui button" onClick={handleReset}>Reset</button>
            </div>
          ) : (
            <div className="ui message warning">
              Pick List Incomplete – Pending Item Selection
            </div>
          )}
        </div>
      </div>
    </>
  );
};

