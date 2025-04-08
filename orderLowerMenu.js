const OrderLowerMenu = ({ itemData, selectedNumber, departmentName }) => {
    const [prgs, setPassProgress] = useState(false);
    return (
        <>
            <div class="ui tabular menu">
                <a class="item active" data-tab="first">Components</a>
                <a class="item" data-tab="second">Work Orders</a>
                <a class="item" data-tab="third">Performance Monitoring </a>
            </div>

            <div class="ui tab active" data-tab="first">
                <OrderPartsList itemData={itemData} />
            </div>

            <div class="ui tab segment" data-tab="second">
                <OrdreShopFloorTimer
                    selectedNumber={selectedNumber}
                    departmentName={departmentName} />
                {/* <table class="ui celled table">
                    <thead>
                        <tr>
                            <th>Operation</th>
                            <th>Assigned</th>
                            <th>Work Center</th>
                            <th>Expected Duration</th>
                            <th>Real Duration</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Main Assembly</td>
                            <td>Mitchell Admin</td>
                            <td>Assembly Line 1</td>
                            <td>60 minutes</td>
                            <td></td>
                            <td>
                                <button class="ui button">Start</button>
                                <button class="ui button">Block</button>
                            </td>
                        </tr>
                        <tr>
                            <td>Drill Station 1</td>
                            <td></td>
                            <td>Drill Station 1</td>
                            <td></td>
                            <td></td>
                            <td>
                                <button class="ui button">Unblock</button>
                            </td>
                        </tr>
                    </tbody>
                </table> */}
            </div>

            <div class="ui tab " data-tab="third">
                <div class='ui horizontal  segments'>
                    <div class='ui segment'>
                        <OrderChartComponent
                            selectedNumber={selectedNumber}
                            departmentName={departmentName}
                            modelId={itemData.fields.Title}
                            progress={prgs}
                        />
                    </div>
                    <div class='ui segment'>
                        <Statistic
                            selectedNumber={selectedNumber}
                            departmentName={departmentName}
                            title={itemData.fields.Title}
                            setPassProgress={setPassProgress}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}