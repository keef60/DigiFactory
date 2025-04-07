const { useEffect, useRef, useState } = React


const ChartComponent = ({
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
                `hourlyProgress-${departmentName}${departmentName === 'line' ? selectedNumber : ''}-${modelId}`
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

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
        />
    );
};

const ChartContainer = ({
    columnSize,
    headers,
    row,
    departmentName,
    selectedNumber,
    modelId,
    progress
}) => {
    return (
        <div className={`ui segment ${columnSize} wide column`}>
            <div className="ui header huge four wide column">
                {`${headers[0]} ${row[0] || 'Unnamed'}`}
            </div>

            <ChartComponent
                departmentName={departmentName}
                selectedNumber={selectedNumber}
                modelId={modelId}
                progress={progress}
            />
        </div>
    );
};


