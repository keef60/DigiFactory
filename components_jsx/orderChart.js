
const OrderChartComponent = ({
    departmentName,
    selectedNumber,
    modelId,
    progress,
    gpDataInput,
    reload
}) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    const [storedGoalData, setStoredGoalData] = useState([]);
    const [runRate, setRunRates] = useState(
        JSON.parse(localStorage.getItem('runRates')) || []
    );

    const rate = runRate.find(i => String(i['Unit']) === String(modelId)) ?? 0;
    const dpName = departmentName === 'line'
        ? departmentName + selectedNumber
        : departmentName;

    useEffect(() => {
        try {
            gpDataInput.reports.forEach(item => {
                const match = String(modelId) === String(item.fields.Title) &&
                    item.fields[dpName] !== undefined;
                if (match) {
                    const parsedData = JSON.parse(item.fields[dpName]);
                    setStoredGoalData(parsedData.efficiencyMetricsCaptured || []);
                }
            });
        } catch (error) {
            console.warn('Waiting for report data');
        }
    }, [gpDataInput, selectedNumber, departmentName, reload, runRate]);

    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        const today = new Date().toDateString();
        const runRateValue = rate?.['Run Rate'] ?? 0;

        // Group entries by hour (adjusted for chart)
        const grouped = {};
        storedGoalData.forEach(item => {
            const hour = item.hour - 6; // shift for chart (1–12)
            if (hour >= 0 && hour < 12) {
                const date = new Date(item.date);
                const dateLabel = date.toDateString();
                const isToday = dateLabel === today;

                if (!grouped[hour]) grouped[hour] = [];
                grouped[hour].push({
                    progress: item.progress ?? 0,
                    label: isToday ? 'Today' : dateLabel,
                    isToday,
                    date,
                });
            }
        });

        const labels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const datasets = [];

        Object.entries(grouped).forEach(([hourIndex, entries]) => {
            entries.forEach((entry, i) => {
                const color = entry.isToday
                    ? entry.progress >= runRateValue
                        ? 'rgba(21, 159, 63, 0.7)' // green
                        : 'rgba(255, 99, 132, 0.7)' // red
                    : `rgba(${100 + i * 30}, ${100 + i * 20}, ${200 - i * 20}, 0.6)`;

                const borderColor = color.replace('0.6', '1').replace('0.7', '1');

                const data = Array(labels.length).fill(0);
                data[hourIndex] = entry.progress;

                datasets.push({
                    label: `Hour ${labels[hourIndex]} - ${entry.label}`,
                    data,
                    backgroundColor: color,
                    borderColor,
                    borderWidth: 1,
                });
            });
        });

        // Destroy previous chart
        if (chartRef.current) chartRef.current.destroy();

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

                ctx.fillStyle = 'red';
                ctx.font = '12px sans-serif';
                ctx.fillText(`Run Rate: ${runRateValue}`, right - 100, y.getPixelForValue(runRateValue) - 5);
                ctx.restore();
            }
        };

        // Create chart
        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets,
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: { display: true, text: 'Hours' },
                        stacked: true,
                    },
                    y: {
                        title: { display: true, text: 'Completed' },
                        beginAtZero: true,
                        stacked: true,
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

    return (
        <>
            <canvas ref={canvasRef} width={400} />
        </>
    );
};
