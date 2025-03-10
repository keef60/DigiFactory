const { useState, useEffect } = React;

const LookupComponent = ({
    filteredData, 
    headers, 
    imagePaths, 
    getPdfPath, 
    openPdfModal, 
    openNoteModal, 
    setPdfPath, 
    setPdfPath2, 
    setPdfPath3, 
    setNotePath, 
    setWorkingThisRow, 
    setGoal, 
    setProgress, 
    goal, 
    progress, 
    workingThisRow, 
    calculateCompletion, 
    calculateRemaining,
    goalProgressInput,
    departmentName
}) => {
console.log('lookup Pane',departmentName);
    return React.createElement('div', { className: 'ui divided items sixteen wide column ' }, 
        filteredData.slice().map((row, rowIndex) => 
            React.createElement('div', { key: rowIndex, className: 'ui segment basic' }, 
                React.createElement('div', { className: 'ui divider' }), 
                React.createElement('h1', { className: 'ui header' }, 
                    React.createElement('div', { className: 'ui label' }, `${headers[0]} ${row[0] || 'Unnamed'}`)
                ),
                React.createElement('div', { className: 'ui grid ' },
                    React.createElement('div', { className: 'four wide column', style: { textAlign: 'center' } }, 
                        imagePaths[row[0]] && imagePaths[row[0]] !== 'img/default_image.jpg' ? 
                            React.createElement('img', { className: 'ui fluid image', src: imagePaths[row[0]], alt: 'Loaded Image' }) : 
                            React.createElement('div', { className: 'ui placeholder' }, 
                                React.createElement('div', { className: 'image' })
                            ),
                        React.createElement('div', { className: 'ui divider hidden' }),
                        React.createElement('div', { className: 'ui buttons' }, 
                            React.createElement('button', {
                                className: 'ui blue small button',
                                onClick: async () => {
                                    const [pdf, pdf2, pdf3] = getPdfPath(row);
                                    setPdfPath(pdf);
                                    setPdfPath2(pdf2);
                                    setPdfPath3(pdf3);
                                    if (pdf) {
                                        openPdfModal(pdf, pdf2, pdf3);
                                    } else {
                                        alert('PDF not found.');
                                    }
                                }
                            }, 'Drawing'),
                            React.createElement('button', {
                                className: 'ui blue small button',
                                onClick: () => {
                                    setNotePath(row[0]);
                                    openNoteModal();
                                }
                            }, 'Notes')
                        )
                    ),



 // New section for Goal and Progress input
 React.createElement(goalProgressInput,{
    row,
    workingThisRow,
    goal,
    progress,
    setWorkingThisRow,
    setGoal,
    setProgress,
    calculateCompletion,
    calculateRemaining,
    departmentName }),

                    React.createElement('div', { className: 'sixteen wide column' },
                        React.createElement('table', { className: 'ui celled striped table' },
                            React.createElement('tbody', null,
                                // First row - Active Indicator if progress > 0
                                calculateCompletion(
                                    workingThisRow === row[0] ? goal : JSON.parse(localStorage.getItem(`goalProgress-paint-${row[0]}`))?.goal,
                                    workingThisRow === row[0] ? progress : JSON.parse(localStorage.getItem(`goalProgress-paint-${row[0]}`))?.progress
                                ) > 0 &&
                                React.createElement('tr', null,
                                    React.createElement('td', { colSpan: 2, style: { textAlign: 'center' } },
                                        React.createElement('div', { className: 'ui label green', style: { display: 'flex', alignItems: 'center', fontWeight: 'bold' } },
                                            React.createElement('div', { className: 'dot', style: { width: '10px', height: '10px', backgroundColor: 'green', borderRadius: '50%', marginRight: '5px' } }),
                                            'Active'
                                        )
                                    )
                                ),

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
                )
            )
        )
    );
};

export default LookupComponent;
