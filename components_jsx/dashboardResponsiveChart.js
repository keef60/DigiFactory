//Commit Update
const ResponsiveChart_DashboardComponent = ({ departmentTitle, setTableView }) => {

    return (
            <div className="">
              
                    <h2 className="ui header ">
                        {`Production vs Run Rate `}
                    </h2>
                  <div className="ui divider"></div>
                <div className="ui small">
                    <button className="ui button small circular" onClick={() => setTableView('bar')}>Bar</button>
                    <button className="ui button small circular" onClick={() => setTableView('line')}>Line</button>
                    <button className="ui button small circular" onClick={() => setTableView('pie')}>Pie</button>
                </div>
                <div className="content">
                    <canvas
                        id="productionChart"
                        width="50%"
                        
                    />
                </div>
            </div>
     

    );
};


