function LiveLaneViewer({
    name,
    wsUrl,
    statusId,
    rawUrl,
    reload,
    setLiveStatus
}) {
    const [status, setStatus] = useState('Connecting...');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sessionIdUrl, setSeesionIdUrl] = useState(undefined);
    const [jobName, setJobName] = useState();
    const [jobFileName, setJobFileName] = useState();
    const [jobId, setId] = useState();
    const [imageUrl, setImageUrl] = useState();
    const [jobListenerDetails, setJobListenerDetails] = useState({
        sessionDisposed: {},
        jobLoadingChanged: {},
        jobChanged: {},
        keepAlive: {},
        ready: {},
        imageUrl: ''
    });
    const [incomingData, setIncomingData] = useState({
        FarSide: {},
        OperatorSide: {}
    })

    const exports = {};
    const module = { exports };
    define_module(null, exports, module);
    const CogSocket = module.exports;

    const root = {
        some: {
            value: "test value",
            addListener: (event, cb) => console.log("Mock addListener", event),
            removeListener: (event, cb) => console.log("Mock removeListener", event),
        },
    };

    const ws = new WebSocket(wsUrl);
    const socket = new CogSocket(ws, root, 2);

    const triggerCameraManually = () => {
        socket.post(sessionIdUrl + '/manualTrigger', (res) =>
            setJobListenerDetails(prev => ({ ...prev, ready: res }))
        );
    }

    const handleSubmitData = (data) => {
        try {
            const lowCase = name.toLowerCase()
            main.fetchSharePointData('Live Packout', 'load').then(e => {
                const matchedItem = e.value.find(info => info.fields.Title === "777");
                const { FarSide, OperatorSide } = matchedItem.fields;
                if (matchedItem) {


                    let parsed = {};
                    try {
                        parsed = typeof FarSide === 'string' ? JSON.parse(FarSide) : FarSide;

                        const foundData = parsed?.data ?? [];
                        const data1 = { data: foundData };
                        data1.data.push({
                            info: data,
                            timeStamp: Date.now()
                        });

                        main.handleSubmit("777", data1, 'FarSide', 'Live Packout').then(e => console.log(e));
                    } catch (e) {
                        console.error('Failed to parse FarSide:', e);
                    }


                }
            });

        } catch (err) {
            console.warn(err);
        }
    }


    useEffect(() => {
        if (sessionIdUrl) {
            socket.log = (msg) => console.log(`[${name}]`, msg);
            socket.onopen = () => {
                setStatus("Connected ✅");

                socket.addListener(sessionIdUrl + "/resultChanged", (payload) => {
                    const link = ("http://" + rawUrl + payload.acqImageView.layers[0].url);
                    setJobListenerDetails(prev => ({ ...prev, imageUrl: link }));
                    const cells = payload?.cells || [];
                    setId(payload.id);
                    setResults(cells);
                    setLoading(false);
                    handleSubmitData(payload?.cells);
                });

                socket.addListener("cam0/hmi/jobChanged", (payload) =>
                    setJobListenerDetails(prev => ({ ...prev, jobChanged: payload }))
                );

                socket.addListener("cam0/hmi/jobLoadingChanged", (payload) =>
                    setJobListenerDetails(prev => ({ ...prev, jobLoadingChanged: payload }))
                );

                socket.addListener("cam0/hmi/sessionDisposed", (payload) =>
                    setJobListenerDetails(prev => ({ ...prev, sessionDisposed: payload }))
                );

                socket.post(sessionIdUrl + '/ready', (res) =>
                    setJobListenerDetails(prev => ({ ...prev, ready: res }))
                );

                setInterval(() => {
                    socket.post(sessionIdUrl + '/keepAlive', (res) =>
                        setJobListenerDetails(prev => ({ ...prev, keepAlive: res }))
                    );

                }, 20000);
            };

            socket.onerror = () => {
                setStatus("Error ❌");
            };

            socket.onclose = (e) => {
                setStatus("Disconnected 🔁");
                console.warn(`[${name}] WebSocket closed`, e);
            };

            return () => { if (socket) socket.close(); };
        }
    }, [sessionIdUrl, jobListenerDetails, reload]);

    useEffect(() => {
        if (sessionIdUrl === undefined || reload) {
            socket.log = (msg) => console.log(`[${name}]`, msg);
            socket.onopen = () => {
                setStatus("Connected ✅");
                setLiveStatus(true);
                socket.get("cam0/hmi/job", (res) => {
                    setJobFileName(res.name);
                    setJobName(res.name.match(/\d+/g));
                });

                socket.post("cam0/hmi/openSession", {
                    $type: "HmiSessionInfo",
                    enableQueuedResults: true,
                    cellNames: ["Classify_1.PredictedClass", "Classify_2.PredictedClass"],
                    includeCustomView: true,
                    includeEasyView: true
                }, (res) => {
                    setSeesionIdUrl(res);
                    socket.post(`${res}/login`, ["YWRtaW4=", "", true, true], () => { });
                });
            };

            socket.onerror = () => setStatus("Error ❌");
            socket.onclose = (e) => { setStatus("Disconnected 🔁"); handleSubmitData("Disconnected 🔁"); }

            return () => { if (socket) socket.close(); };
        }
    }, [wsUrl, reload]);


    return (

        <div className="ui segments horizontal  lane-card">
            {loading ? (
                <div className=" ui segment">
                    <div className="ui placeholder">
                        <div className="image"></div>
                    </div>
                </div>
            ) : (
                <div className=" ui segment">
                    <img
                        className={`ui image medium job-image ${name === 'Far Side' ? 'flipped' : ''}`}
                        src={jobListenerDetails.imageUrl}
                        alt={`${name} Job Image`}
                    />
                </div>
            )}


            {loading ? (
                <div className=" ui segment">
                    <p id={statusId}
                        className="job-status">
                        <strong>{status}</strong>
                    </p>

                    <div className="ui placeholder">
                        <div class="paragraph">
                            <div class="line"></div>
                            <div class="line"></div>
                            <div class="line"></div>
                            <div class="line"></div>
                            <div class="line"></div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className=" ui segment">
                    <p id={statusId} className="job-status"><strong>{status}</strong></p>
                    <div className="ui header job-file-name">{jobFileName}</div>
                    <small className="job-id grey-text">id:{jobId}</small>

                    {results.map((cell, index) => (
                        <div
                            key={index}
                            className="ui header grey-text">
                            {cell.data}
                        </div>
                    ))}
                    <button
                        className="ui button"
                        onClick={() => triggerCameraManually()}
                    >Trigger</button>
                </div>
            )}


        </div>

    )
}

