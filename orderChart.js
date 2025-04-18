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
    const [storedGoalDataArray, setStoredGoalDataArray] = useState();
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
            const storedProgress = JSON.parse(localStorage.getItem(
                `hourlyProgress-${dpName}-${modelId}`
            )) || [];

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

    return (<>
        <div>{progress}</div>
        <canvas
            ref={canvasRef}
            width={400}

        />
    </>
    );
};
