//Commit Update
const ClassificationChart = ({ rawData }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    try {
      const validEntries = rawData?.data?.filter(entry =>
        Array.isArray(entry.info)
      );

      const labels = validEntries.map(entry => {
        const date = new Date(entry.timeStamp);
        return date.toLocaleTimeString();
      });

      const allNames = new Set();
      validEntries.forEach(entry => {
        entry.info.forEach(item => {
          if (typeof item.data === 'number' || typeof item.data === 'string') {
            allNames.add(item.name);
          }
        });
      });

      const datasets = Array.from(allNames).map(name => {
        const isNumeric = validEntries.some(
          entry => typeof entry.info.find(i => i.name === name)?.data === 'number'
        );

        const data = validEntries.map(entry => {
          const item = entry.info.find(i => i.name === name);
          return isNumeric
            ? item?.data ?? null
            : item?.data === 'OK' ? 1 : item?.data ? 0 : null;
        });

        return {
          label: name,
          data,
          backgroundColor: getRandomColor(),
          type: isNumeric ? 'line' : 'bar',
          stack: isNumeric ? undefined : 'categoricalStack'
        };
      });

      // Destroy old chart
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      chartInstanceRef.current = new Chart(ctx, {
        data: {
          labels,
          datasets
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Classification and Count Over Time'
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Value / OK Count'
              }
            }
          }
        }
      });
    } catch (err) {
      console.warn(err);
    }
  }, [rawData]);

  const getRandomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;

  return (
    <div>
      <canvas ref={chartRef} height={400}></canvas>
    </div>
  );
};

