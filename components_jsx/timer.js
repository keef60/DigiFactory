
//Commit Update
const ShopFloorTimer = ({
    selectedNumber,
    setSelectedNumber,
    imagePaths,
    row,
    workDetails,
    rowIndex,
    departmentRefName,
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
    headers,
    issesListData,
    clearLoading,
    getPdfPath,
    openPdfModal,
    openNoteModal,
    setPdfPath,
    setPdfPath2,
    setPdfPath3,
    setNotePath,
    setFilterTask,
    filterTask }) => {
    // State for the timer
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [time, setTime] = useState(0); // Time in seconds
    const [timerInterval, setTimerInterval] = useState(null);
    const [employeeName, setEmployeeName] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [actionType, setActionType] = useState('start'); // 'start' or 'stop'

    useEffect(() => {
        // Check localStorage for saved state on page load
        const savedTime = localStorage.getItem('timerTime');
        const savedIsTimerRunning = localStorage.getItem('isTimerRunning') === 'true';

        if (savedTime) {
            setTime(Number(savedTime)); // Restore saved time
        }

        if (savedIsTimerRunning) {
            setIsTimerRunning(true); // Restore running state if timer was running
        }

        return () => clearInterval(timerInterval);
    }, []);

    useEffect(() => {
        // Save the current time and timer state to localStorage when they change
        localStorage.setItem('timerTime', time);
        localStorage.setItem('isTimerRunning', isTimerRunning);
    
        if (isTimerRunning) {
            const interval = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
            setTimerInterval(interval);
        } else {
            clearInterval(timerInterval);
            setTimerInterval(null);
        }

        return () => clearInterval(timerInterval);
    }, [time, isTimerRunning]); // Effect triggers whenever time or isTimerRunning changes

    const formatTime = (timeInSeconds) => {
        const hours = String(Math.floor(timeInSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((timeInSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(timeInSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const handleStart = () => {
        setActionType('start');
        setModalOpen(true);
    };

    const handleStop = () => {
        setActionType('stop');
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (employeeName.trim() === '') {
            alert('Please enter the employee name');
            return;
        }

        // Stop the timer if action is stop
        if (actionType === 'stop') {
            setIsTimerRunning(false);
            console.log(`Task stopped at ${formatTime(time)} for employee: ${employeeName}`);
            setTime(0); // Reset time after stopping
            localStorage.removeItem('timerTime'); // Clear time from localStorage when stopped
        } else if (actionType === 'start') {
            setIsTimerRunning(true);
            setFilterTask(true);
        }

        setModalOpen(false);
        setEmployeeName('');
    };

    return (
        <div>
            <SideView
                selectedNumber={selectedNumber}
                setSelectedNumber={setSelectedNumber}
                imagePaths={imagePaths}
                row={row}
                workDetails={workDetails}
                rowIndex={rowIndex}
                departmentRefName={departmentRefName}
                workingThisRow={workingThisRow}
                goal={goal}
                progress={progress}
                setWorkingThisRow={setWorkingThisRow}
                setGoal={setGoal}
                setProgress={setProgress}
                calculateCompletion={calculateCompletion}
                calculateRemaining={calculateRemaining}
                departmentName={departmentName}
                spMethod={spMethod}
                headers={headers}
                issesListData={issesListData}
                clearLoading={clearLoading}
                getPdfPath={getPdfPath}
                openPdfModal={openPdfModal}
                openNoteModal={openNoteModal}
                setPdfPath={setPdfPath}
                setPdfPath2={setPdfPath2}
                setPdfPath3={setPdfPath3}
                setNotePath={setNotePath}
                setFilterTask={setFilterTask}
                isTimerRunning={isTimerRunning}
                filterTask={filterTask} />

            <div className="ui segment black">
                <h2>Shop Floor - Task Timer</h2>
                <div className="ui buttons">
                    <button
                        className="ui primary button"
                        onClick={handleStart}
                        disabled={isTimerRunning}
                    >
                        Start Task
                    </button>
                    <button
                        className="ui secondary button"
                        onClick={handleStop}
                        disabled={!isTimerRunning}
                    >
                        Stop Task
                    </button>
                </div>

                <div className="ui segment" style={{ marginTop: '20px' }}>
                    <h3>Elapsed Time: {formatTime(time)}</h3>
                </div>

                {/* Modal for Employee Input */}
                {modalOpen && (
                    <div className="ui dimmer modals page active">
                        <div className="ui standard modal active">
                            <div className="header">
                                {actionType === 'start' ? 'Enter Employee Name to Start Task' : 'Enter Employee Name to Stop Task'}
                            </div>
                            <div className="content">
                                <div className="ui form">
                                    <div className="field">
                                        <label>Employee Name</label>
                                        <input
                                            type="text"
                                            value={employeeName}
                                            onChange={(e) => setEmployeeName(e.target.value)}
                                            placeholder="Enter employee name"
                                        />
                                    </div>
                                    <button className="ui primary button" onClick={handleSubmit}>
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


