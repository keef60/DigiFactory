const OrderLowerMenu = ({ itemData, selectedNumber, departmentName,user,issesListData }) => {
    const [prgs, setPassProgress] = useState(false);
    return (
        <>
            <div class="ui tabular menu">
                <a class="item active" data-tab="first">Components</a>
                <a class="item" data-tab="second">Work Orders</a>
                <a class="item" data-tab="third">Performance Monitoring </a>
                <a class="item" data-tab="fourth">Comments</a>
                <a class="item" data-tab="fifth">Issues</a>
            </div>

            <div class="ui tab active" data-tab="first">
                <OrderPartsList itemData={itemData} />
            </div>

            <div class="ui tab " data-tab="second">
                <OrdreShopFloorTimer
                    selectedNumber={selectedNumber}
                    departmentName={departmentName}
                    user={user}
                    department={departmentName} />
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

            <div class="ui tab " data-tab="fourth">
                <OrderComments 
                department={departmentName} 
                noteId={itemData.fields.Title}
                user={user}
                workOrderRef={itemData.fields['WO']}
                 />
            </div>

            <div class="ui tab " data-tab="fifth">
            <OrderIssues 
                department={departmentName} 
                modelId={itemData.fields.Title}
                user={user} />
            </div>

        </>
    )
}