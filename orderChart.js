const OrderChartComponent = ({
    departmentName,
    selectedNumber,
    modelId,
    progress
}) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null); // Store the chart instance

    useEffect(() => {
    
        const ctx = canvasRef.current.getContext('2d');

        const getHourlyProgress = () => {
            const storedProgress = JSON.parse(localStorage.getItem(
                `hourlyProgress-${departmentName === 'line' ?departmentName+selectedNumber : departmentName}-${modelId}`
            )) || [];

            return storedProgress.map(item => item.progress);
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

    }, [progress, departmentName, selectedNumber, modelId]);

    return (<>
    <div>{progress}</div>
        <canvas
            ref={canvasRef}
            width={400}
            height={200}
        />
        </>
    );
};
