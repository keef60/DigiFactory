
//Commit Update
const ProgressCircle = ({reload}) => {

    const CYCLE_DURATION = 30; // in seconds
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let start = Date.now();

        const interval = setInterval(() => {
            const elapsed = (Date.now() - start) / 1000;
            const percentage = (elapsed % CYCLE_DURATION) / CYCLE_DURATION;
            setProgress(percentage);
        }, 100); // updates every 100ms

        return () => clearInterval(interval);
    }, [reload]);

    const radius = 10;
    const stroke = 2;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = 2 * Math.PI * normalizedRadius;
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <svg height={radius * 2} width={radius * 2} className="progress-circle">
            <circle
                stroke="#eee"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <circle
                stroke="#00aaff"
                fill="transparent"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
        </svg>
    );
};


