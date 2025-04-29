const TaskDataChart = ({ data }) => {
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [chartType, setChartType] = useState('line'); // Can be 'line', 'bar', 'pie'

  // Filter data based on selected action and department
  const filteredData = data.filter(task => {
    const actionMatches = selectedAction === 'all' || task.action === selectedAction;
    const departmentMatches = selectedDepartment === 'all' || task.department === selectedDepartment;
    return actionMatches && departmentMatches;
  });

  // Prepare data for the chart
  const chartData = {
    labels: filteredData.map(task => new Date(task.timestamp).toLocaleTimeString()),
    data: filteredData.map(task => task.realDurationAtAction),
  };

  // Function to generate chart
  const generateChart = () => {
    const ctx = document.getElementById('taskDurationChart').getContext('2d');
    if (window.chartInstance) {
      window.chartInstance.destroy();
    }

    window.chartInstance = new Chart(ctx, {
      type: chartType,
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Task Duration (Seconds)',
          data: chartData.data,
          borderColor: chartType === 'line' ? 'rgba(75, 192, 192, 1)' : 'rgba(54, 162, 235, 1)',
          backgroundColor: chartType === 'line' ? 'rgba(75, 192, 192, 0.2)' : 'rgba(54, 162, 235, 0.2)',
          fill: chartType === 'line',
          borderWidth: 2,
          tension: chartType === 'line' ? 0.1 : 0,
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Duration (Seconds)'
            },
            ticks: {
              beginAtZero: true
            }
          }
        }
      }
    });
  };

  useEffect(() => {
    generateChart(); // Create chart when the data changes
  }, [chartData, chartType]); // Re-run whenever filtered data or chart type changes

  return (
    <div className="ui container">
      <h1 className="ui header">Task Duration Dashboard</h1>

      {/* Filters */}
      <div className="ui form">
        <div className="field">
          <label>Action</label>
          <select
            className="ui dropdown"
            onChange={(e) => setSelectedAction(e.target.value)}
            value={selectedAction}
          >
            <option value="all">All Actions</option>
            <option value="start">Start</option>
            <option value="stop">Stop</option>
            <option value="pause">Pause</option>
          </select>
        </div>

        <div className="field">
          <label>Department</label>
          <select
            className="ui dropdown"
            onChange={(e) => setSelectedDepartment(e.target.value)}
            value={selectedDepartment}
          >
            <option value="all">All Departments</option>
            <option value="HANDLES">HANDLES</option>
            <option value="PACKOUT">PACKOUT</option>
            <option value="FRAMES">FRAMES</option>
            <option value="LINE">LINE</option>
          </select>
        </div>

        <div className="field">
          <label>Chart Type</label>
          <select
            className="ui dropdown"
            onChange={(e) => setChartType(e.target.value)}
            value={chartType}
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="ui segment">
        <canvas id="taskDurationChart" width="800" height="400"></canvas>
      </div>
    </div>
  );
};