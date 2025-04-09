

const OrdreShopFloorTimer = ({user,department}) => {
    const [time, setTime] = useState(0); // Global time in seconds
    const [modalOpen, setModalOpen] = useState(false);
    const [employeeName, setEmployeeName] = useState('');
    const [actionType, setActionType] = useState('start'); // 'start', 'pause' or 'stop'
    const [tasks, setTasks] = useState([
        {
            id: 1,
            name: `${department.toUpperCase()} Assembly`||'Main Assembly',
            assigned: user,
            workCenter: '026',
            expectedDuration: 60,
            realDuration: 0,
            status: 'Not Started',
            timer: null
        },
    ]);

    useEffect(()=>{},[employeeName])
    useEffect(() => {
        return () => {
            tasks.forEach(task => {
                if (task.timer) {
                    clearInterval(task.timer); // Clean up any active intervals
                }
            });
        };
    }, []);

    const formatTime = (timeInSeconds) => {
        const hours = String(Math.floor(timeInSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((timeInSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(timeInSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const startTaskTimer = (taskId) => {
        setEmployeeName(user);
        setModalOpen(true);
        const updatedTasks = [...tasks];
        const taskIndex = updatedTasks.findIndex((task) => task.id === taskId);
        const task = updatedTasks[taskIndex];

        // Only start the timer if the task is not already running
        if (!task.timer) {
            const timer = setInterval(() => {
                setTasks(prevTasks =>
                    prevTasks.map(t =>
                        t.id === taskId
                            ? { ...t, realDuration: t.realDuration + 1 }
                            : t
                    )
                );
            }, 1000);

            updatedTasks[taskIndex].timer = timer;
            updatedTasks[taskIndex].status = 'In Progress';
            setTasks(updatedTasks);
        }
    };

    const pauseTaskTimer = (taskId) => {
        const updatedTasks = [...tasks];
        const taskIndex = updatedTasks.findIndex((task) => task.id === taskId);
        const task = updatedTasks[taskIndex];

        if (task.timer) {
            clearInterval(task.timer); // Stop the timer
            updatedTasks[taskIndex].timer = null;
            updatedTasks[taskIndex].status = 'Paused'; // Update status to paused
            setTasks(updatedTasks);
        }
    };

    const stopTaskTimer = (taskId) => {
        setModalOpen(true);
        const updatedTasks = [...tasks];
        const taskIndex = updatedTasks.findIndex((task) => task.id === taskId);
        const task = updatedTasks[taskIndex];

        if (task.timer) {
            clearInterval(task.timer); // Stop the timer
            updatedTasks[taskIndex].timer = null;
            updatedTasks[taskIndex].status = 'Completed'; // Mark the task as completed
            setTasks(updatedTasks);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (employeeName.trim() === '') {
            alert('Please enter the employee name');
            return;
        }

        const updatedTasks = [...tasks];
        updatedTasks.forEach(task => {
            if (task.assigned === employeeName) {
                task.assigned = employeeName;
            }
        });

        setTasks(updatedTasks);
        setModalOpen(false);
        setEmployeeName('');
    };

    return (
        <div>
            <table className="ui celled table">
                <thead>
                    <tr>
                        <th>Operation</th>
                        <th>Assigned</th>
                        <th>Work Center</th>
                        <th>Expected Duration</th>
                        <th>Real Duration</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task, index) => (
                        <tr key={index}>
                            <td>{task.name}</td>
                            <td>{task.assigned || '-'}</td>
                            <td>{task.workCenter}</td>
                            <td>{task.expectedDuration > 0 ? `${task.expectedDuration} minutes` : '-'}</td>
                            <td>{task.realDuration > 0 ? formatTime(task.realDuration) : '-'}</td>
                            <td>{task.status}</td>
                            <td>
                                {task.status === 'Not Started' && (
                                    <button
                                        className="ui button mini labeled icon green "
                                        onClick={() => startTaskTimer(task.id)}>
                                        <i class="play icon"></i>
                                        Start
                                    </button>
                                )}
                                {task.status === 'In Progress' && (
                                    <div class='ui buttons mini' >
                                        <button
                                            className="ui button mini  labeled icon yellow "
                                            onClick={() => pauseTaskTimer(task.id)}>
                                            <i class="pause  icon"></i>
                                            Pause
                                        </button>
                                        <div class="or"></div>
                                        <button
                                            className="ui button mini labeled icon  red"
                                            onClick={() => stopTaskTimer(task.id)}>
                                            <i class="stop icon"></i>
                                            Stop
                                        </button>
                                    </div>
                                )}
                                {task.status === 'Paused' && (
                                    <button
                                        className="ui button mini labeled icon basic blue "
                                        onClick={() => startTaskTimer(task.id)}>
                                        <i class="play  icon"></i>
                                        Resume
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

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
    );
};


