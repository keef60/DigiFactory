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
        return date.toLocaleTimeString(); // Just time
      });

      const classify1Data = validEntries.map(entry => {
        const c1 = entry.info.find(i => i.name === 'Classify_1.PredictedClass');
        return c1?.data || null;
      });

      const classify2Data = validEntries.map(entry => {
        const c2 = entry.info.find(i => i.name === 'Classify_2.PredictedClass');
        return c2?.data || null;
      });

      // Destroy old chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Create new chart instance
      const ctx = chartRef.current.getContext('2d');
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Classify_1.PredictedClass',
              data: classify1Data,
              backgroundColor: 'rgba(54, 162, 235, 0.6)'
            },
            {
              label: 'Classify_2.PredictedClass',
              data: classify2Data,
              backgroundColor: 'rgba(255, 99, 132, 0.6)'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Predicted Class Comparison'
            }
          },
          scales: {
            y: {
              type: 'category',
              labels: Array.from(new Set([...classify1Data, ...classify2Data]))
            }
          }
        }
      });
    } catch (err) {
      console.warn(err)
    }
  }, [rawData]);

  return (
    <div className="  ">
      <canvas ref={chartRef} className="classification-chart"   height={400}></canvas>
    </div>
  );
};

