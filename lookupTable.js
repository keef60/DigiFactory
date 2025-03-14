const LookUpTable = ({
    headers,
    row
}) => {

    return    React.createElement('div', { className: 'sixteen wide column' },
        React.createElement('table', { className: 'ui celled striped table' },
            React.createElement('tbody', null,
                // Other rows from the headers
                headers.slice().map((header, colIndex) =>
                    React.createElement('tr', { key: colIndex },
                        React.createElement('td', { style: { fontWeight: 'bold' } }, header || 'Field'),
                        React.createElement('td', null, row[colIndex] || 'N/A')
                    )
                )
            )
        )
    )
};

export default LookUpTable;
