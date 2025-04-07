
const Table_DashboardComponent = ({ data }) => {

    return (
        <div className="content">
        <table className="ui celled striped table">
            <thead>
                <tr>
                    <th>Hour</th>
                    <th>Model</th>
                    <th>Mach. Prd.</th>
                    <th>Run Rate</th>
                    <th>Mach. Var.</th>
                    <th>Var. %</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, index) => (
                    <tr key={index}>
                        <td>{row.hour}</td>
                        <td>{row.model}</td>
                        <td>{row.machinePrd}</td>
                        <td>{row.runRate}</td>
                        <td>{row.machVar}</td>
                        <td>{row.varPercentage}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    );
};


