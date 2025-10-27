function LiveLaneViewer({
  name,
  wsUrl,
  statusId,
  rawUrl,
  reload,
  setLiveStatus,
  department
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
    imageUrl: '',
    listFiles: null,
    selectedJob: null
  });
  const [incomingData, setIncomingData] = useState({
    FarSide: undefined,
    OperatorSide: undefined
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
      const lowCase = name.toLowerCase();


      main.fetchSharePointData('Live Packout', 'load').then(e => {
        const matchedItem = e.value.find(info => info.fields.Title === jobFileName);

        if (matchedItem) {
          const { FarSide, OperatorSide } = matchedItem.fields;
          let parsed = {};
          try {
            parsed = typeof FarSide === 'string' ? JSON.parse(FarSide) : FarSide;
            console.log(parsed)
            setIncomingData(parsed);
            const foundData = parsed?.data ?? [];
            const data1 = { data: foundData };
            data1.data.push({
              info: data,
              timeStamp: Date.now()
            });

            main.handleSubmit(jobFileName, data1, 'FarSide', 'Live Packout').then(e => console.log(e));
          } catch (e) {
            console.warn('Failed to parse FarSide:', e);
          }


        } else {

          try {
            console.log(data)

            const data1 = {
              info: data,
              timeStamp: Date.now()
            };

            main.handleSubmit(jobFileName, data1, 'FarSide', 'Live Packout').then(e => console.log(e));
          } catch (e) {
            console.warn(e);
          }
        }
      });

    } catch (err) {
      console.warn(err);
    }
  }


  useEffect(() => {
    $('.job.dropdown')
      .dropdown({
        onChange: function (value, text) {
          // custom action
          setJobListenerDetails(prev => ({ ...prev, selectedJob: value }));
        }
      });
  });

  useEffect(() => {
    if (sessionIdUrl ) {
      socket.log = (msg) => console.log(`[${name}]`);

      socket.onopen = () => {
        setStatus("Connected ✅");
        socket.addListener(sessionIdUrl + "/resultChanged", (payload) => {
          const link = ("http://" + rawUrl + payload.acqImageView.layers[0].url);
          console.log("============================================>",link)
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


      setTimeout(() => {
        listFiles();
      }, [5000])
      return () => { if (socket) socket.close(); };
    }
  }, [sessionIdUrl, jobListenerDetails]);


  const routes = ['cam0/hmi/hs/~12706e62/liveMode', "cam0/hmi/hs/~50378263/listFiles", "cam0/hmi/hs/~8be739d6/loadJob"

  ]


  const liveMode = () => {
    socket.post(sessionIdUrl + '/liveMode', (res) =>
      setJobListenerDetails(prev => ({ ...prev, ready: res }))
    )
  }

  const listFiles = () => {
    socket.post(sessionIdUrl + '/listFiles', [''], (res) => {
      setJobListenerDetails(prev => ({ ...prev, listFiles: res }))
    }
    );
  }


  const loadJob = () => {
    console.log("Jod selected: ", jobListenerDetails.selectedJob);

    socket.post(sessionIdUrl + '/loadJob', [jobListenerDetails.selectedJob], (res) => {
    }
    )
  }



  useEffect(() => {
    if (sessionIdUrl === undefined  || reload ) {
      socket.log = (msg) => console.log(`[${name}]`);
      socket.onopen = () => {
        setLiveStatus(true);
        socket.get("cam0/hmi/job", (res) => {
          const onlyJobDigits = res.name.match(/\d+/g)?.join('').slice(0, 6)
          setJobFileName(res.name);
          setJobName(onlyJobDigits);
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
          setStatus("Connected ✅");

        });
      };


      socket.onerror = () => setStatus("Error ❌");
      socket.onclose = (e) => { setStatus("Disconnected 🔁"); }


      return () => { if (socket) socket.close(); };
    }
  }, [wsUrl, reload]);


  return (

    <div className="ui grid centered stackable">
      <div className="eight wide column">
        <div className="ui raised card">
          <div className="content">
            {loading ? (
              <div className="ui placeholder">
                <div className="image"></div>
              </div>
            ) : (
              <>
                <img
                  className={`ui medium image job-image ${name === 'Far Side' ? 'flipped' : ''}`}
                  src={jobListenerDetails.imageUrl}
                  alt={`${name} Job Image`}
                />
                <div className="ui segment">
                  <ClassificationChart rawData={incomingData} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="eight wide column">
        <div className="ui raised card">
          <div className="content">
            <p id={statusId} className="job-status">
              <strong>{status}</strong>
            </p>

            {loading ? (
              <div className="ui placeholder">
                <div className="paragraph">
                  <div className="line"></div>
                  <div className="line"></div>
                  <div className="line"></div>
                </div>
              </div>
            ) : (
              <>
                <h3 className="ui header job-file-name">{jobFileName}</h3>
                <small className="job-id grey-text">ID: {jobId}</small>

                <div className="ui divided list" style={{ marginTop: '1em' }}>
                  {results.map((cell, index) => (
                    <div key={index} className="item">
                      <div className="content grey-text">{cell.data}</div>
                    </div>
                  ))}
                </div>

                <div className="ui form" style={{ marginTop: '2em' }}>
                  <div className="field">
                    <label>Select Job</label>
                    <div className="ui fluid search selection dropdown job">
                      <input type="hidden" name="job" />
                      <i className="dropdown icon"></i>
                      <div className="default text">Select Job</div>
                      <div className="menu">
                        {jobListenerDetails.listFiles?.map((itemn) => (
                          <div key={itemn.name} className="item" data-value={itemn.name}>
                            {itemn.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ui buttons" style={{ marginTop: '2em' }}>
                  <button className="ui primary button" onClick={loadJob}>
                    <i className="folder open icon"></i> Load Job
                  </button>
                  <button className="ui red button" onClick={triggerCameraManually}>
                    <i className="video icon"></i> Trigger
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>


  )
}

