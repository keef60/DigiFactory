//Commit Update
const Statistics_DashboardComponent = ({ stats }) => {

    // Helper function to count up from 0 to the final total value
    const countUp = (targetValue) => {
        const [value, setValue] = useState(0);
        
        useEffect(() => {
            const increment = targetValue / 100; // Control the speed of the counting animation
            let currentValue = 0;
            
            const interval = setInterval(() => {
                currentValue += increment;
                if (currentValue >= targetValue) {
                    setValue(targetValue);
                    clearInterval(interval);
                } else {
                    setValue(currentValue);
                }
            }, ); // Control the update interval (lower value means faster)
            
            return () => clearInterval(interval); // Cleanup interval on unmount
        }, [targetValue]);
        
        return value.toFixed(0); // Round to the nearest whole number
    };

    const statisticCreator = stats.map(i => {
        const animatedTotal = countUp(i.total);

        return (
            <div className=""  key={i.title} >
                <div className="ui statistic ">
                    
                    <div className="value">{animatedTotal}</div>
                    <div className="label">{i.title}</div>
                </div>
            </div>
        );
    });

    return (
        <div class="ui statistics horizontal tiny " /* style={{marginTop:'40%'}} */>
            {statisticCreator}
        </div>
    );
};


