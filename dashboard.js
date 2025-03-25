const { useEffect, useRef, useState } = React;

const Dashboard = (props) => {
    const { useEffect, useRef, useState } = React;


    const {  spMethod } = props;

    const [tableView, setTableView] = useState('bar');
    const [data, setData] = useState([]); // Add state to store data
    const chartRef = useRef(null); // Store the chart instance
    const [notes, setNotes] = useState([]);
    const [departmentClick,setDepartmentClick] = useState()
    const [departmentTitle,setDepartmentTitle] = useState()
    // Function to convert data from localStorage to the desired table structure

    async function convertToTableData() {
        const data = [];
        const noteData = []
        try {
            const runRates = await spMethod.fetchSharePointData('RunRates', 'runRates', false)
                .then(e => JSON.parse(e.value[0].fields.runRates))
                .catch(err => console.log(err));

            const issues = await spMethod.fetchSharePointData('ISSUES', departmentClick, false)
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
                        const thisDepartmentExist = key.fields[thisDepartment];
                        if (thisDepartmentExist) {
                            const isThere = String(t) === String(model);
                            isThere ? noteData.push(JSON.parse(thisDepartmentExist).selectedOptions.join(' , ')) : null;
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

                        const departmentExists = goal.find(item => thisSpot === departmentClick ? item.hasOwnProperty(thisSpot) : null);

                        if (departmentExists) {
                            let y = runRates.find(i => String(i['Unit']) === String(model));
                            if(y){
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
                            });}
                        }
                    });
                }
            });

            setData(data); // Set the data in state
            setNotes(noteData);

        } catch (err) {
            console.log(err);
        }



    }

    useEffect(() => {
        convertToTableData(); // Fetch and set data on mount
    }, [departmentClick]); // If selectedNumber changes, re-fetch data

    // Key Statistics
    const totalProduction = data.reduce((sum, row) => sum + row.machinePrd, 0);
    const totalRunRate = data.reduce((sum, row) => sum + row.runRate, 0);
    const totalVariance = data.reduce((sum, row) => sum + row.machVar, 0);

    // Chart.js Data for Production vs Run Rate
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
    }, [tableView, data]); // Re-render the chart if tableView or data changes

    useEffect(()=>{
        $('.ui.dropdown.line').dropdown()
    })
    const selectionTab = () => {
        return ['Paint', 'Handles', 'Pumps', 'Packout', 'Hose', 'Frames', 'Line'].map(department => {
          // Check if the department is "Line" to render a dropdown
          if (department === 'Line') {
            return React.createElement('div', { key: department, className:'ui buttons' }, [
              React.createElement('button', { className:'ui button', htmlFor: 'lineDropdown' }, 'Line'),
              React.createElement('select', {
                id: 'lineDropdown',
                className: 'ui floating dropdown  button line',
                onChange: (e) =>{ setDepartmentClick(`line${e.target.value}`);setDepartmentTitle(`Line ${e.target.value}`)}
              }, 
                [1, 2, 3, 4, 5, 6, 7].map(number => 
                  React.createElement('option', { key: number, value: number },`${number}`)
                )
              )
            ]);
          }
      
          // Default button rendering for other departments
          return React.createElement('button', {
            key: department,
            className: 'button ui circular',
            onClick: () => { setDepartmentClick(department.toLocaleLowerCase());setDepartmentTitle(department) }
          }, department);
        });
      }
      


    return React.createElement('div', { className: 'ui ', style: { 
        position: 'center',
        marginLeft: '5%',
       // transform: 'translate(-50%, 1%)',
        width: '90%' // Optional, you can set a specific width if desired
    } },
        React.createElement('div',{className:'ui segment '},
            selectionTab()
        ),
        React.createElement(
            "div",
            { className: "ui segment basic sixteen wide column ", style: { marginTop: "20px" } },
            React.createElement(
                "div",
                { className: "ui grid" },
                React.createElement(
                    "div",
                    { className: "row" },
                    React.createElement(
                        "div",
                        { className: "twelve wide column"},
                        React.createElement(
                            "div",
                            { className: "ui segment " , style:{ left:'20%'} },
                            React.createElement(
                                "div",
                                { className: "content" },
                                React.createElement("div", { className: "header" }, `Production vs Run Rate ${departmentTitle?departmentTitle:''}`)
                            ),
                            React.createElement(
                                'div',
                                { className: 'ui buttons small' },
                                React.createElement('button', { className: 'ui button black basic ', onClick: () => setTableView('bar') }, 'Bar Graph'),
                                React.createElement('button', { className: 'ui button', onClick: () => setTableView('line') }, 'Line Graph'),
                                React.createElement('button', { className: 'ui button black basic', onClick: () => setTableView('pie') }, 'Pie Graph')

                            )
                            ,
                            React.createElement(
                                "div",
                                { className: "content" },
                                React.createElement("canvas", {
                                    id: "productionChart",
                                    width: window.width,
                                    height: '200px',
                                })
                            )
                        )
                    )
                ),
                React.createElement(
                    "div",
                    { className: "row"  },
                    React.createElement(
                        "div",
                        { className: "five wide column" , style:{ left:'10%'} },
                        React.createElement(
                            "div",
                            { className: "ui statistic" },
                            React.createElement("div", { className: "label" }, "Total Production"),
                            React.createElement("div", { className: "value" }, totalProduction)
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "five wide column" , style:{ left:'15%'} },
                        React.createElement(
                            "div",
                            { className: "ui statistic" },
                            React.createElement("div", { className: "label" }, "Total Run Rate"),
                            React.createElement("div", { className: "value" }, totalRunRate)
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "five wide column", style:{ left:'20%'} },
                        React.createElement(
                            "div",
                            { className: "ui statistic" },
                            React.createElement("div", { className: "label" }, "Total Variance"),
                            React.createElement("div", { className: "value" }, totalVariance)
                        )
                    )
                ),
                React.createElement(
                    "div",
                    { className: "row" },
                    React.createElement(
                        "div",
                        { className: "sixteen wide column" },
                        React.createElement(
                            "div",
                            { className: "ui segment" },
                            React.createElement(
                                "div",
                                { className: "content" },
                                React.createElement("div", { className: " ui huge header" }, departmentTitle?`Assembly ${departmentTitle} Hour by Hour`:'Please select a department')
                            ),
                            departmentTitle && React.createElement(
                                "div",
                                { className: "content" },
                                React.createElement(
                                    "table",
                                    { className: "ui celled striped table" },
                                    React.createElement(
                                        "thead",
                                        null,
                                        React.createElement(
                                            "tr",
                                            null,
                                            React.createElement("th", null, "Hour"),
                                            React.createElement("th", null, "Model"),
                                            React.createElement("th", null, "Mach. Prd."),
                                            React.createElement("th", null, "Run Rate"),
                                            React.createElement("th", null, "Mach. Var."),
                                            React.createElement("th", null, "Var. %")
                                        )
                                    ),
                                    React.createElement(
                                        "tbody",
                                        null,
                                        data.map((row, index) =>
                                            React.createElement(
                                                "tr",
                                                { key: index },
                                                React.createElement("td", null, row.hour),
                                                React.createElement("td", null, row.model),
                                                React.createElement("td", null, row.machinePrd),
                                                React.createElement("td", null, row.runRate),
                                                React.createElement("td", null, row.machVar),
                                                React.createElement("td", null, row.varPercentage)
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                ),
                React.createElement(
                    "div",
                    { className: "row" },
                    React.createElement(
                        "div",
                        { className: "sixteen wide column" },
                        React.createElement(
                            "div",
                            { className: "ui segment" },
                            React.createElement(
                                "div",
                                { className: "content" },
                                React.createElement("div", { className: " ui  huge header" },departmentTitle? `Assembly ${departmentTitle} Notes`:'No data')
                            ),
                            departmentTitle&& React.createElement(
                                "div",
                                { className: "content" },
                                React.createElement(
                                    "table",
                                    { className: "ui celled striped table" },
                                    React.createElement(
                                        "thead",
                                        null,
                                        React.createElement(
                                            "tr",
                                            null,
                                            React.createElement("th", null, "Hour"),
                                            React.createElement("th", null, "Notes")
                                        )
                                    ),
                                    React.createElement(
                                        "tbody",
                                        null,
                                        notes.map((row, index) =>
                                            React.createElement(
                                                "tr",
                                                { key: index },
                                                React.createElement("td", null, index + 1),
                                                React.createElement("td", null, row)
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        ));
};

export default Dashboard;
