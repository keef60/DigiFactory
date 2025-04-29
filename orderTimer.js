
const OrdreShopFloorTimer = ({ user, department, workOrderID, modelID }) => {
    const [tasks, setTasks] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [employeeName, setEmployeeName] = useState('');
    const [actionType, setActionType] = useState('start');
    const [pauseModalTaskId, setPauseModalTaskId] = useState(null);
    const [pauseReason, setPauseReason] = useState('');
    
    const pauseReasons = [
        'Machine issue',
        'Material delay',
        'Break',
        'Operator error',
        'Waiting for supervisor',
    ];

    const actionLogRef = useRef([]);

    // Load and conditionally add task
    useEffect(() => {
        if (!department || !user || !workOrderID) return;
    
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const savedLogs = JSON.parse(localStorage.getItem('taskActionLogs')) || [];
    
        // Only create task if none exists with the same department and workOrderID
        const taskExists = savedTasks.some(
            (task) =>
                task.workOrderID === workOrderID &&
                task.name === `${department.toUpperCase()} Assembly`
        );
    
        let updatedTasks = [...savedTasks];
    
        if (!taskExists) {
            const newTask = {
                id: Date.now(),
                name: `${department.toUpperCase()} Assembly`,
                assigned: user,
                workCenter: '026',
                expectedDuration: 60,
                realDuration: 0,
                startTime: null,
                status: 'Not Started',
                workOrderID: workOrderID,
            };
    
            updatedTasks.push(newTask);
            localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        }
    
        setTasks(updatedTasks);
        actionLogRef.current = savedLogs;
    }, [department, user, workOrderID]);
    
    // Live refresh for durations
    useEffect(() => {
        const interval = setInterval(() => {
            setTasks((prev) => [...prev]);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (timeInSeconds) => {
        const hours = String(Math.floor(timeInSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((timeInSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(timeInSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    const getLiveDuration = (task) => {
        if (task.status === 'In Progress' && task.startTime) {
            const now = new Date();
            const start = new Date(task.startTime);
            const elapsed = Math.floor((now - start) / 1000);
            return task.realDuration + elapsed;
        }
        return task.realDuration;
    };

    const logTaskAction = ({ task, action, reason = null }) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            taskId: task.id,
            taskName: task.name,
            employee: user,
            action,
            department: department.toUpperCase(),
            workCenter: task.workCenter,
            realDurationAtAction: getLiveDuration(task),
            statusAfterAction: task.status,
            workOrderID: task.workOrderID,
            ...(reason && { pauseReason: reason }),
        };

        actionLogRef.current.push(logEntry);
        localStorage.setItem('taskActionLogs', JSON.stringify(actionLogRef.current));

        main.handleSubmit(modelID, actionLogRef.current, department, 'TIME');
    };

    const persistTasks = (updatedTasks) => {
        setTasks(updatedTasks);
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    };

    const startTaskTimer = (taskId) => {
        setEmployeeName(user);
        setModalOpen(true);
        setActionType('start');

        const updatedTasks = [...tasks];
        const index = updatedTasks.findIndex((t) => t.id === taskId);
        const task = updatedTasks[index];

        if (!task.startTime) {
            updatedTasks[index].startTime = new Date().toISOString();
            updatedTasks[index].status = 'In Progress';
            persistTasks(updatedTasks);
            logTaskAction({ task: updatedTasks[index], action: 'start' });
        }
    };

    const pauseTaskTimer = (taskId) => {
        setPauseModalTaskId(taskId);
        const updatedTasks = [...tasks];
        const index = updatedTasks.findIndex((t) => t.id === taskId);
        if (updatedTasks[index].startTime) {
            updatedTasks[index].status = 'Paused';
            updatedTasks[index].startTime = null;
            persistTasks(updatedTasks);
        }
    };

    const stopTaskTimer = (taskId) => {
        setModalOpen(true);
        setActionType('stop');

        const updatedTasks = [...tasks];
        const index = updatedTasks.findIndex((t) => t.id === taskId);
        const task = updatedTasks[index];

        if (task.startTime) {
            const now = new Date();
            const start = new Date(task.startTime);
            const elapsed = Math.floor((now - start) / 1000);
            updatedTasks[index].realDuration += elapsed;
        }

        updatedTasks[index].startTime = null;
        updatedTasks[index].status = 'Completed';

        persistTasks(updatedTasks);
        logTaskAction({ task: updatedTasks[index], action: 'stop' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (employeeName.trim() === '') {
            alert('Please enter the employee name');
            return;
        }

        const updatedTasks = tasks.map((task) => {
            if (task.assigned === user) {
                return { ...task, assigned: employeeName };
            }
            return task;
        });

        persistTasks(updatedTasks);
        setModalOpen(false);
        setEmployeeName('');
    };

    const handlePauseSubmit = () => {
        const updatedTasks = [...tasks];
        const index = updatedTasks.findIndex((task) => task.id === pauseModalTaskId);
        const task = updatedTasks[index];

        logTaskAction({
            task,
            action: 'pause',
            reason: pauseReason,
        });

        setPauseModalTaskId(null);
        setPauseReason('');
        setModalOpen(false);
        persistTasks(updatedTasks);
    };

    const exportLogs = () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(actionLogRef.current, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', 'task_action_logs.json');
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
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
                    {tasks.map((task) => (
                        <tr key={task.id}>
                            <td>{task.name}</td>
                            <td>{task.assigned || '-'}</td>
                            <td>{task.workCenter}</td>
                            <td>{task.expectedDuration > 0 ? `${task.expectedDuration} minutes` : '-'}</td>
                            <td>{getLiveDuration(task) > 0 ? formatTime(getLiveDuration(task)) : '-'}</td>
                            <td>{task.status}</td>
                            <td>
                                {task.status === 'Not Started' && (
                                    <button className="ui button mini labeled icon green" onClick={() => startTaskTimer(task.id)}>
                                        <i className="play icon"></i> Start
                                    </button>
                                )}
                                {task.status === 'In Progress' && (
                                    <div className="ui buttons mini">
                                        <button className="ui button mini labeled icon yellow" onClick={() => pauseTaskTimer(task.id)}>
                                            <i className="pause icon"></i> Pause
                                        </button>
                                        <div className="or"></div>
                                        <button className="ui button mini labeled icon red" onClick={() => stopTaskTimer(task.id)}>
                                            <i className="stop icon"></i> Stop
                                        </button>
                                    </div>
                                )}
                                {task.status === 'Paused' && (
                                    <button className="ui button mini labeled icon basic blue" onClick={() => startTaskTimer(task.id)}>
                                        <i className="play icon"></i> Resume
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button className="ui button teal" onClick={exportLogs}>Export Logs</button>

            {modalOpen && (
                <div className="ui dimmer modals page active">
                    <div className="ui standard modal active">
                        <div className="header">
                            {actionType === 'start'
                                ? 'Enter Employee Name to Start Task'
                                : 'Enter Employee Name to Stop Task'}
                        </div>
                        <div className="content">
                            <form className="ui form" onSubmit={handleSubmit}>
                                <div className="field">
                                    <label>Employee Name</label>
                                    <input
                                        type="text"
                                        value={employeeName}
                                        onChange={(e) => setEmployeeName(e.target.value)}
                                        placeholder="Enter employee name"
                                    />
                                </div>
                                <button className="ui primary button" type="submit">
                                    Submit
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {pauseModalTaskId && (
                <div className="ui dimmer modals page active">
                    <div className="ui standard modal active">
                        <div className="header">Select Reason for Pause</div>
                        <div className="content">
                            <div className="ui form">
                                <div className="field">
                                    <label>Pause Reason</label>
                                    <select
                                        value={pauseReason}
                                        onChange={(e) => setPauseReason(e.target.value)}
                                    >
                                        <option value="">Select a reason</option>
                                        {pauseReasons.map((reason, idx) => (
                                            <option key={idx} value={reason}>
                                                {reason}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button className="ui primary button" onClick={handlePauseSubmit}>
                                    Submit Pause Reason
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

