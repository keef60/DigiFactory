const OrderLowerMenu = ({
    itemData,
    selectedNumber,
    departmentName,
    user,
    issesListData,
    gpDataInput,
    inventoryRef,
    reload,
    setReload
}) => {

    const [liveStatus, setLiveStatus] = useState(false);
    const [prgs, setPassProgress] = useState(false);
    const [ips, setIps] = useState({
        FarSide: '/',
        OperatorSide: '/',
    });
    const didRun = useRef(false);


    useEffect(() => {
        try {
            if (!didRun.current) {
                main.fetchSharePointData('IP', 'load').then(e => {
                    const matchedItem = e.value.find(info => info.fields.Title === "DTXIP");
                    const { FarSide, OperatorSide } = matchedItem.fields;
                    setIps(prev => ({ ...prev, FarSide }));
                    setIps(prev => ({ ...prev, OperatorSide }));
                    didRun.current = true;
                });
            }
        } catch (err) {
            console.warn(err)
        }
    });
    return (
        <>
            <div class="ui tabular menu stackable">
                <a class="item active" data-tab="first">Components</a>
                <a class="item" data-tab="second">Work Order Timer</a>
                <a class="item" data-tab="third">Performance Monitoring </a>
                <a class="item" data-tab="fourth">Comments</a>
                <a class="item" data-tab="fifth">Issues</a>
                {departmentName === 'packout' && (
                    <a className="item" data-tab="six">
                        {liveStatus ? (
                            <>
                                <span className="live-dot" /> Live
                            </>
                        ) : (
                            'Live Viewer'
                        )}
                    </a>
                )}


            </div>

            <div class="ui tab active" data-tab="first">
                <OrderPartsList
                    itemData={itemData}
                    inventoryRef={inventoryRef} />
            </div>

            <div class="ui tab " data-tab="second">
                <OrdreShopFloorTimer
                    selectedNumber={selectedNumber}
                    departmentName={departmentName}
                    user={user}
                    department={departmentName}
                    modelID={itemData.fields.Title}
                    workOrderID={itemData.fields['WO']}
                />
            </div>

            <div class="ui tab " data-tab="third">
                <div class='ui equal width grid internally celled'>

                    <div class='column'>
                        <div class='ui segment '>
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
                    <div class='four wide column'>
                        <div class='ui segment basic '>
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

            <div class="ui tab " data-tab="fourth">
                <OrderComments
                    department={departmentName}
                    noteId={itemData.fields.Title}
                    user={user}
                    workOrderRef={itemData.fields['WO']}
                    selectedNumber={selectedNumber}
                />
            </div>

            <div class="ui tab " data-tab="fifth">
                <OrderIssues
                    department={departmentName}
                    modelId={itemData.fields.Title}
                    user={user} />
            </div>

            <div class="ui tab " data-tab="six">
                <div className="ui two column stackable grid">
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

        </>
    )
}