
const ResponsiveChart_DashboardComponent = ({ departmentTitle, setTableView }) => {

    return (

        <div className="twelve wide column">
            <div className="ui segment">
                <div className="content">
                    <div className="ui header">
                        {`Production vs Run Rate ${departmentTitle ? departmentTitle : ''}`}
                    </div>
                </div>
                <div className="ui small">
                    <button className="ui button small circular" onClick={() => setTableView('bar')}>Bar</button>
                    <button className="ui button small circular" onClick={() => setTableView('line')}>Line</button>
                    <button className="ui button small circular" onClick={() => setTableView('pie')}>Pie</button>
                </div>
                <div className="content">
                    <canvas
                        id="productionChart"
                        width="900px"
                        height="300px"
                    />
                </div>
            </div>
        </div>

    );
};


