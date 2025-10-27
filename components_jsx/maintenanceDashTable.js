//Commit Update
const MaintenanceTable = ({
    maintenanceData,
    handleFilter,
}) => {

    return (
        <table className="ui very basic striped aligned center table compact selectable">
            <thead>
                <tr>
                    <th>Date Logged</th>
                    <th>Technician</th>
                    <th>Root Cause</th>
                    <th>Failure Description</th>
                </tr>
            </thead>
            <tbody>
                {maintenanceData.map((row, index) => (
                    <tr key={index}>
                        <td>{new Date(row.creationDate).toLocaleDateString()}</td>
                        <td>{row.requesterName || 'N/A'}</td>
                        <td>{row.cause?.[0] || 'N/A'}</td>
                        <td>
                            <button
                                className="ui mini black basic button"
                                onClick={() => handleFilter(row)}
                            >
                                View
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};


