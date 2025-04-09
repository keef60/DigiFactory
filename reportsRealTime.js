const ReportsRealTimeDashboard = ({ }) => {

    const [tableView, setTableView] = useState('bar');
    const [data, setData] = useState([]);
    const chartRef = useRef(null);
    const [notes, setNotes] = useState([]);
    const [departmentClick, setDepartmentClick] = useState();
    const [departmentTitle, setDepartmentTitle] = useState();

    async function convertToTableData() {
        const data = [];
        const noteData = []
        try {
            const runRates = await main.fetchSharePointData('RunRates', 'runRates', false)
                .then(e => JSON.parse(e.value[0].fields.runRates))
                .catch(err => console.log(err));

            const issues = await main.fetchSharePointData('ISSUES', departmentClick, false)
                .then(e => e.value)
                .catch(err => console.log(err));

            const keys = Object.keys(localStorage);

            let goal = [];
            keys.forEach(key => {
                if (key.includes('goalProgress')) {
                    const model = key.split('-')[2];
                    const thisDepartment = key.split('-')[1];
                    const currentGoal = JSON.parse(localStorage.getItem(key));
                    goal.push({ [thisDepartment]: { model: model, goal: currentGoal.goal } });
                    issues.forEach(key => {
                        const t = key.fields['Title'];
                        const thisDepartmentExist = key.fields[departmentClick];

                        if (thisDepartmentExist && thisDepartment === departmentClick) {
                            const isThere = String(t) === String(model);
                            const now = new Date();

                            const itemTime = new Date(JSON.parse(thisDepartmentExist).selectedOptions.creationDate).getHours() - 6;

                            isThere ? noteData.push({
                                casue: JSON.parse(thisDepartmentExist).selectedOptions.cause.join(' , '),
                                model: t,
                                date: itemTime
                            }) : null;
                        }

                    });
                }
            });

            keys.forEach((key) => {
                if (key.includes('hourlyProgress')) {
                    const storedData = JSON.parse(localStorage.getItem(key));
                    storedData.forEach(item => {
                        const hour = `H ${item.hour - 6}`;
                        const model = key.split('-')[2];
                        const thisSpot = key.split('-')[1];
                        let runRate;

                        const departmentExists = goal.some(item => thisSpot === departmentClick ? item.hasOwnProperty(departmentClick) : null);

                        if (departmentExists) {
                            let y = runRates.find(i => String(i['Unit']) === String(model));
                            if (y) {
                                runRate = y["Run Rate"];
                                const machinePrd = item.progress;
                                const machVar = machinePrd - runRate;
                                const varPercentage = ((machinePrd / runRate) * 100).toFixed(2);
                                data.push({
                                    hour,
                                    model,
                                    machinePrd,
                                    runRate,
                                    machVar,
                                    varPercentage: `${varPercentage}%`
                                });
                            }
                        }
                    });
                }
            });

            setData(data);
            setNotes(noteData);

        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        convertToTableData();
    }, [departmentClick]);

    const totalProduction = data.reduce((sum, row) => sum + row.machinePrd, 0);
    const totalRunRate = data.reduce((sum, row) => sum + row.runRate, 0);
    const totalVariance = data.reduce((sum, row) => sum + row.machVar, 0);

    const chartData = {
        labels: data.map((row) => row.hour),
        datasets: [
            {
                label: "Machine Production",
                data: data.map((row) => row.machinePrd),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
            {
                label: "Run Rate",
                data: data.map((row) => row.runRate),
                backgroundColor: "rgba(153, 102, 255, 0.6)",
                borderColor: "rgba(153, 102, 255, 1)",
                borderWidth: 1,
            },
        ],
    };

    useEffect(() => {
        if (window.Chart) {
            const ctx = document.getElementById("productionChart").getContext("2d");

            if (chartRef.current) {
                chartRef.current.destroy();
            }

            chartRef.current = new window.Chart(ctx, {
                type: tableView,
                data: chartData,
                options: {
                    responsive: true,
                },
            });
        }
    }, [tableView, data]);


    return (
        <div className="ui" style={{ position: 'center', marginLeft: '5%', width: '90%' }}>
             <SelectionMenuTab_DashComponent
                            setDepartmentTitle={setDepartmentTitle}
                            setDepartmentClick={setDepartmentClick}
                        />
            <div className="ui segment very padded black " style={{ marginTop: "2px" }}>

                <div className="ui grid centered">
                <div class='row'>
                 <div class=' ui segment ten wide column'>
                        <ResponsiveChart_DashboardComponent
                            departmentTitle={departmentTitle}
                            setTableView={setTableView} />
                    </div>
                    <div class=' ui segment four wide column'>
                  <Statistics_DashboardComponent stats={[
                        {
                            total: totalProduction,
                            title: 'Production'
                        }
                        , {
                            total: totalRunRate,
                            title: 'Run Rate'
                        }
                        , {
                            total: totalVariance,
                            title: 'Variance'
                        }
                    ]} />
                    </div>
                    </div>
                </div>

                <div className="ui grid centered">
                    <div className="row">
                        <div className=" ui segment fourteen wide column">
                            
                                <h3 className="ui  header">
                                    {departmentTitle ? `Assembly ${departmentTitle} Hour by Hour` : 'Please select a department'}
                                </h3>
                           
                            {departmentTitle && (
                                <Table_DashboardComponent data={data} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="ui grid centered">
                    <div className="row">
                        <div className=" ui segment  fourteen wide column">
                                <h3 className="ui  header">
                                    {departmentTitle ? `Assembly ${departmentTitle} Notes` : 'No data'}
                                </h3>
                           
                            {departmentTitle && (
                                    <table className="ui celled striped table black selectable ">
                                        <thead>
                                            <tr>
                                                <th>Hour</th>
                                                <th>Model</th>
                                                <th>Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {notes.map((row, index) => (
                                                <tr key={index}>
                                                    <td>H {row.date}</td>
                                                    <td>{row.model}</td>
                                                    <td>{row.casue}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                              
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};


