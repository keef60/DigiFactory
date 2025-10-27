//Commit Update
const LookUpTable = ({ headers, row }) => {
    return (
        <div className='sixteen wide column'>
            <table className='ui celled striped table'>
                <tbody>
                    {headers.slice().map((header, colIndex) => (
                        <tr key={colIndex}>
                            <td style={{ fontWeight: 'bold' }}>{header || 'Field'}</td>
                            <td>{row[colIndex] || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


