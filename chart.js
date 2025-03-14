const { useEffect, useRef } = React;

const ChartComponent = ({   
    departmentName,selectedNumber,modelId}) => {

    const canvasRef = useRef(null);

    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');

        const getHourlyProgress = () => {
            const storedProgress = JSON.parse(localStorage.getItem(`hourlyProgress-${departmentName}${departmentName === 'line' ? selectedNumber : ''}-${modelId}`)) || [];
           
            return storedProgress.map(item => item.progress);
          };
          
          console.log(getHourlyProgress())

        const dataSet = getHourlyProgress()

        new Chart(ctx, {
            type: 'line', // Change to other types like 'bar' or 'pie' if needed
            data: {
                labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Hours from 1 to 12
                datasets: [
                    {
                        label: 'Amount',
                        data: dataSet, // Example data
                        borderColor: 'rgb(83, 192, 75)',
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
                            text: 'Amount',
                        },
                    },
                },
            },
        });
    }, []);

    return React.createElement('canvas', {
        ref: canvasRef,
        width: 400,
        height: 400,
    });
};

const ChartContainer = ({ 
    columnSize,
    headers,
    row,
    departmentName,
    selectedNumber,
    modelId }) => {

        
    return React.createElement(
        'div',
        { className: `ui segement ${columnSize} wide column` },
        //Header Goal and Progress 
        React.createElement('div', { 
            className: ' ui header huge four wide column' 
        }, `${headers[0]} ${row[0] || 'Unnamed'}`
    ),

        React.createElement(ChartComponent,{     
            departmentName,
            selectedNumber,
            modelId})
    );
};

export default ChartContainer;
