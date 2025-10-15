const ReportsRealTimeDashboard = ({ }) => {

    const [tableView, setTableView] = useState('bar');
    const [data, setData] = useState([]);
    const chartRef = useRef(null);
    const [notes, setNotes] = useState([]);
    const [departmentClick, setDepartmentClick] = useState();
    const [departmentTitle, setDepartmentTitle] = useState();

    async function convertToTableData1() {
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

    async function convertToTableData() {
        const data = [];
        const noteData = [];

        try {
            const runRates = await main.fetchSharePointData('RunRates', 'runRates', false)
                .then(e => JSON.parse(e.value[0].fields.runRates))
                .catch(err => console.log("RunRates error", err));

            const issues = await main.fetchSharePointData('ISSUES', departmentClick, false)
                .then(e => e.value)
                .catch(err => console.log("Issues error", err));

            const reportItems = await main.fetchSharePointData('REPORTS', departmentClick, false)
                .then(e => e.value)
                .catch(err => console.log("Reports error", err));

            for (const item of reportItems) {

                const fields = item.fields;

                // Loop through each field to find departments
                for (const key in fields) {
                    // Skip non-department fields

                    if (![departmentClick].includes(key)) continue;

                    let departmentJson;
                    try {
                        departmentJson = JSON.parse(fields[key]);

                    } catch (e) {
                        console.warn(`Skipping malformed field: ${key}`, e);
                        continue;
                    }

                    const model = departmentJson?.product?.id || fields["Title"];
                    const department = departmentJson?.assignedTo?.department || key;
                    const goal = parseInt(departmentJson?.goal || 0);
                    const logs = departmentJson?.efficiencyMetricsCaptured || [];


                    // Log entries per hour



                    const hourData = logs || [];

                    for (const entry of hourData) {
                        const hour = `H ${entry.hour - 6}`;
                        const machinePrd = entry.progress;

                        const runRateEntry = runRates.find(r => String(r['Unit']) === String(model));
                        if (runRateEntry) {
                            const runRate = runRateEntry["Run Rate"];
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


                    // Match with issues (if any)
                    for (const issue of issues) {
                        const title = issue.fields["Title"];
                        const deptField = issue.fields[department];
                        if (deptField && String(title) === String(model)) {
                            const deptData = JSON.parse(deptField);

                            const cause = deptData.selectedOptions?.cause?.join(', ') || 'N/A';
                            const creationDate = new Date(deptData.selectedOptions?.creationDate);
                            const hour = creationDate.getHours() - 6;
                            console.log({ cause, creationDate, hour })
                            noteData.push({
                                cause,
                                model,
                                date: hour
                            });
                        }
                    }
                }
            }
            setNotes(noteData);
            setData(data);

        } catch (err) {
            console.log("convertToTableData failed", err);
        }
    };
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
                backgroundColor: "hsla(350, 91%, 43%, 0.60)",
                borderColor: "rgba(209, 10, 43, 1)",
                borderWidth: 1,
            },
            {
                label: "Run Rate",
                data: data.map((row) => row.runRate),
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                borderColor: "rgb(34, 34, 34)",
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


    const handleExportToExcel = () => {
        const transformedData = {
            runRates: [], // Optional: fill if you want to include
            report: [],   // Optional
            overview: [], // Optional
            efficiency: [], // Optional
            lineHourByHour: data.map(row => ({
                hour: row.hour,
                line: departmentTitle || "N/A",
                model: row.model,
                produced: row.machinePrd,
                runRate: row.runRate,
                variance: row.machVar,
                variancePercent: parseFloat(row.varPercentage.replace('%', '')) || 0
            })),
            kitting: [], // Optional
            recap: { coldWater: [] }, // Optional
            unitInfo: [], // Optional
            assemblyNotes: notes.map(note => ({
                timestamp: `H ${note.date}`,
                line: departmentTitle || "N/A",
                author: "N/A", // Replace if you have author info
                content: note.cause
            })),
            productionSummary: [] // Optional
        };

        const formatter = new DTXProductionFormatter(transformedData);
        formatter.buildWorkbook();
    };


    return (
        <div className="ui">
            <SelectionMenuTab_DashComponent
                setDepartmentTitle={setDepartmentTitle}
                setDepartmentClick={setDepartmentClick}
            />
            <div className="ui segment very padded black " style={{ marginTop: "2px" }}>

                <div className="ui grid centered">
                    <div class='row'>
                        <div class=' ten wide column'>
                            <div class='ui segment black '>
                                <ResponsiveChart_DashboardComponent
                                    departmentTitle={departmentTitle}
                                    setTableView={setTableView} />
                            </div>
                        </div>
                        <div class=' four wide column '>
                            <div class='ui segment  black '>
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
                </div>

                <div className="ui grid centered">
                    <div className="row">
                        <div className=" fourteen wide column">
                            <div className=" ui segment ">
                                <h3 className="ui  header">
                                    {departmentTitle ?
                                        `Assembly ${departmentTitle} Hour by Hour` :
                                        'Please select a department'}
                                </h3>

                                {departmentTitle && (

                                    <>
                                        <button
                                            className="ui primary button"
                                            onClick={handleExportToExcel}
                                            style={{ marginBottom: "1em" }}
                                        >
                                            Export to Excel
                                        </button>
                                        <Table_DashboardComponent data={data} />

                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ui grid centered">
                    <div className="row">
                        <div className="  fourteen wide column">
                            <div className=" ui segment ">
                                <h3 className="ui  header">
                                    {departmentTitle ?
                                        `Assembly ${departmentTitle} Notes` :
                                        'No data'}
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
                                                    <td>{row.cause}</td>
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
        </div>
    );
};


