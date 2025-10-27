//Commit Update
const OrderLowerMenu = ({
  itemData,
  selectedNumber,
  departmentName,
  user,
  issesListData,
  gpDataInput,
  inventoryRef,
  reload,
  setReload,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [liveStatus, setLiveStatus] = useState(false);
  const [prgs, setPassProgress] = useState(false);
  const [ips, setIps] = useState({
    FarSide: '/',
    OperatorSide: '/',
  });
  const didRun = useRef(false);

  // Generate a unique storage key based on department and selected number
  const storageKey = `${departmentName}_${selectedNumber}_activeLowerTab`;

  const tabList = [
    { label: 'Components' },
    { label: 'Work Order Timer' },
    { label: 'Performance Monitoring' },
    { label: 'Comments' },
    { label: 'Issues' },
    ...(departmentName === 'packout' ? [{ label: 'Live Viewer' }] : []),
  ];

  useEffect(() => {
    if (!didRun.current) {
      // Load saved tab from IndexedDB for this department/order
      getSetting(storageKey).then(index => {
        if (index !== undefined && !isNaN(index)) {
          setActiveTab(index);
        }
      });

      // Load IP addresses
      main.fetchSharePointData('IP', 'load').then(e => {
        const matchedItem = e.value.find(info => info.fields.Title === 'DTXIP');
        const { FarSide, OperatorSide } = matchedItem.fields;
        setIps({ FarSide, OperatorSide });
      });

      didRun.current = true;
    }
  }, [storageKey]);

  const handleTabClick = (index) => {
    setActiveTab(index);
    saveSetting(storageKey, index);
  };

  return (
    <>
      {/* Tab Header Menu */}
      <div className="ui tabular menu stackable">
        {tabList.map((tab, index) => (
          <a
            key={index}
            className={`item ${activeTab === index ? 'active' : ''}`}
            onClick={() => handleTabClick(index)}
          >
            {index === 5 && departmentName === 'packout' ? (
              liveStatus ? (
                <>
                  <span className="live-dot" /> Live
                </>
              ) : (
                'Live Viewer'
              )
            ) : (
              tab.label
            )}
          </a>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 0 && (
        <div className="ui tab active">
          <OrderPartsList itemData={itemData} inventoryRef={inventoryRef} />
        </div>
      )}

      {activeTab === 1 && (
        <div className="ui tab active">
          <OrdreShopFloorTimer
            selectedNumber={selectedNumber}
            departmentName={departmentName}
            user={user}
            department={departmentName}
            modelID={itemData.fields.Title}
            workOrderID={itemData.fields['WO']}
          />
        </div>
      )}

      {activeTab === 2 && (
        <div className="ui tab active">
          <div className="ui equal width grid internally celled">
            <div className="column">
              <div className="ui segment">
                <OrderChartComponent
                  selectedNumber={selectedNumber}
                  departmentName={departmentName}
                  modelId={itemData.fields.Title}
                  progress={prgs}
                  gpDataInput={gpDataInput}
                  reload={reload}
                />
              </div>
            </div>
            <div className="four wide column">
              <div className="ui segment basic">
                <OrderStatistic
                  selectedNumber={selectedNumber}
                  departmentName={departmentName}
                  title={itemData.fields.Title}
                  setPassProgress={setPassProgress}
                  gpDataInput={gpDataInput}
                  reload={reload}
                  setReload={setReload}
                />

              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 3 && (
        <div className="ui tab active">
          <OrderComments
            department={departmentName}
            noteId={itemData.fields.Title}
            user={user}
            workOrderRef={itemData.fields['WO']}
            selectedNumber={selectedNumber}
          />
        </div>
      )}

      {activeTab === 4 && (
        <div className="ui tab active">
          <OrderIssues
            department={departmentName}
            modelId={itemData.fields.Title}
            user={user}
          />
        </div>
      )}

      {activeTab === 5 && departmentName === 'packout' && (
        <div className="ui tab active">
          <div className="ui two column stackable grid">
            {/* Live Viewer Component (uncomment if needed) */}
            {/* <div className="column">
              <LiveLaneViewer
                reload={reload}
                name="Far Side"
                wsUrl={`ws://${ips?.FarSide}/ws`}
                rawUrl={`${ips?.FarSide}`}
                statusId="status1"
                setLiveStatus={setLiveStatus}
                department={departmentName}
              />
            </div>
            <div className="column">
              <LiveLaneViewer
                reload={reload}
                name="Operator Side"
                wsUrl={`ws://${ips?.OperatorSide}/ws`}
                rawUrl={`${ips?.OperatorSide}`}
                statusId="status2"
                setLiveStatus={setLiveStatus}
                department={departmentName}
              />
            </div> */}
          </div>
        </div>
      )}
    </>
  );
};

