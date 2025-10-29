//Commit Update
const OrderChartComponent = ({
    departmentName,
    selectedNumber,
    modelId,
    progress,
    gpDataInput,
    reload
}) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null); // Store the chart instance
    const [storedGoalData, setStoredGoalData] = useState([]);
    const [runRate, setRunRates] = useState(JSON.parse(localStorage.getItem('runRates')));
    const rate = runRate.find(i => String(i['Unit']) === String(modelId))
    const dpName = departmentName === 'line' ? departmentName + selectedNumber : departmentName

    useEffect(() => {
        try {
            let logData = [];
            gpDataInput.reports.map(item => {
                let bool = String(modelId) === String(item.fields.Title) &&
                    item.fields[dpName] !== undefined;
                if (bool) {
                    const parsedData = JSON.parse(item.fields[dpName]);
                    setStoredGoalData(parsedData.efficiencyMetricsCaptured)
                };
            });

        } catch (error) {
            console.warn('------------------Waiting for report data ');
        };

    }, [gpDataInput, selectedNumber, departmentName, reload]);
    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');

        const getHourlyProgress = () => {
            const progressArray = Array(19).fill(0);
            storedGoalData?.forEach(item => {
                const index = item.hour - 6;
                if (index >= 0 && index < progressArray.length) {
                    progressArray[index] = item.progress ?? 0;
                }
            });
            return progressArray;
        };

        const dataSet = getHourlyProgress();
        const runRateValue = rate?.['Run Rate'] ?? 0;

        // Destroy existing chart if present
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        // Color bars based on Run Rate comparison
        const backgroundColors = dataSet.map(value =>
            value >= runRateValue ? 'rgba(21, 159, 63, 0.7)' : 'rgba(255, 99, 132, 0.7)'
        );

        // Plugin to draw horizontal Run Rate line
        const runRateLine = {
            id: 'runRateLine',
            afterDraw: (chart) => {
                if (!runRateValue) return;
                const { ctx, chartArea: { left, right }, scales: { y } } = chart;

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(left, y.getPixelForValue(runRateValue));
                ctx.lineTo(right, y.getPixelForValue(runRateValue));
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'red';
                ctx.setLineDash([6, 3]);
                ctx.stroke();

                // Label for the line
                ctx.fillStyle = 'red';
                ctx.font = '12px sans-serif';
                ctx.fillText(`Run Rate: ${runRateValue}`, right - 100, y.getPixelForValue(runRateValue) - 5);
                ctx.restore();
            }
        };

        // Create the chart
        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                datasets: [
                    {
                        label: 'Completed',
                        data: dataSet,
                        backgroundColor: backgroundColors,
                        borderColor: backgroundColors.map(c => c.replace('0.7', '1')),
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: { display: true, text: 'Hours' },
                    },
                    y: {
                        title: { display: true, text: 'Completed' },
                        beginAtZero: true,
                    },
                },
                plugins: {
                    legend: {
                        labels: { color: '#333' },
                    },
                },
            },
            plugins: [runRateLine],
        });
    }, [progress, departmentName, selectedNumber, modelId, storedGoalData]);

    /*     useEffect(() => {
    
            const ctx = canvasRef.current.getContext('2d');
    
            const getHourlyProgress = () => {
              
    
                const progressArray = Array(19).fill(0); // 0–24 shifted by -6 => index range 0–18
    
                storedGoalData?.forEach(item => {
                    const index = item.hour - 6;
                    if (index >= 0 && index < progressArray.length) {
                        progressArray[index] = item.progress ?? 0;
                    };
                });
                
                return progressArray
            };
    
    
            const dataSet = getHourlyProgress();
    
    
            // Destroy the existing chart if there is one
            if (chartRef.current) {
                chartRef.current.destroy();
            }
    
            // Create a new chart
            chartRef.current = new Chart(ctx, {
                type: 'bar', // Change to other types like 'bar' or 'pie' if needed
                data: {
                    labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Hours from 1 to 12
                    datasets: [
                        {
                            label: 'Completed',
                            data: dataSet, // Example data
                            borderColor: 'rgb(21, 159, 63)',
                            fill: true,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Hours',
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Completed',
                            },
                        },
                    },
                },
            });
    
        }, [progress, departmentName, selectedNumber, modelId, storedGoalData]);
     */
    return (<>
        <canvas
            ref={canvasRef}
            width={400}

        />
    </>
    );
};
