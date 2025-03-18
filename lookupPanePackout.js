const { useState, useEffect } = React;

const PackoutLookup = ({
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
    departmentName,
    spMethod,
    issue,
    lineSelection,
    selectedNumber,
    setSelectedNumber,
    chart
}) => {
    console.log('look packout Pane');

    

    const [toggleFilter,setToggleFilter] = useState(true);
    const [filterBtnName,setFilterBtnName] = useState('Show Weekly Orders');
    const departmentRefName = departmentName.charAt(0).toUpperCase() + departmentName.slice(1);
    const toggle = ()=>{
        toggleFilter?setToggleFilter(false): setToggleFilter(true) 
        toggleFilter? setFilterBtnName('Hide Weekly Orders'):setFilterBtnName('Show Weekly Orders') 
    }
    // Filtered data based on localStorage if toggleFilter is on
    const filteredDataWithStorageCheck = filteredData.filter(row => {
        if (!toggleFilter) {
            // Create the key to check in localStorage
            const localStorageKey = `goalProgress-${departmentName}-${row[0]}`;
            const storedValue = localStorage.getItem(localStorageKey);

            // If the item exists in localStorage, we filter it out
            return storedValue;
        }
        return true; // If the filter is off, return all data
    });


    return React.createElement('div', { className: 'ui divided items sixteen wide column ' },
        React.createElement('div', { className: " ui button black ", onClick:toggle }, filterBtnName),
        filteredDataWithStorageCheck.map((row, rowIndex) =>
            React.createElement('div', { key: rowIndex, className: `ui segment black ` },
                React.createElement('div', { className: 'ui divider' }),
                React.createElement('div', { className: 'ui divider hidden ' }),

                React.createElement('div', { className: 'ui grid  internally celled ' },
                    React.createElement('div', { className: 'four wide column', style: { textAlign: 'center' } },
                        imagePaths[row[0]] && imagePaths[row[0]] !== 'img/default_image.jpg' ?
                            React.createElement('img', { className: 'ui fluid image', src: imagePaths[row[0]], alt: 'Loaded Image' }) :
                            React.createElement('div', { className: 'ui placeholder' },
                                React.createElement('div', { className: 'image' })
                            ),
                        React.createElement('div', { className: 'ui divider hidden ' }),
                        React.createElement('div', { className: 'ui buttons  ' },
                            React.createElement('button', {
                                className: 'ui black small button',
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
                                className: 'ui  small button',
                                onClick: () => {
                                    setNotePath(row[0]);
                                    openNoteModal();
                                }
                            }, 'Notes')
                        ),


                    ),

                    React.createElement(chart, {
                        columnSize: 'six',
                        headers,
                        row,
                        departmentName,
                        selectedNumber,
                        modelId: row[0],
                        progress
                    }),

                    React.createElement('div', { className: ' ui  sixteen wide column row', style: { padding: "2.5%" } },
                        React.createElement('div', { className: ' ui header huge ' }, `Performance and Goal Monitoring Dashboard`,
                            React.createElement('div', { className: ' ui sub header' }, `${departmentRefName}`)
                        )
                    ),
                    React.createElement('div', { className: "ui grid sixteen wide column row ", style: { padding: "2%" } },
                        // New section for Goal and Progress input
                        React.createElement(goalProgressInput, {
                            row,
                            workingThisRow,
                            goal,
                            progress,
                            setWorkingThisRow,
                            setGoal,
                            setProgress,
                            calculateCompletion,
                            calculateRemaining,
                            departmentName,
                            spMethod,
                            selectedNumber,
                            issue
                        })),

                    //Header Goal and Progress 
                    React.createElement('div', { className: ' ui  sixteen wide column row', style: { padding: '2.5%' } },

                        React.createElement('div', { className: ' ui header huge ' }, `Manufacturing Issues and Action Dashboard`,
                            React.createElement('div', { className: ' ui sub header' }, `${departmentRefName}`)
                        )),

                    React.createElement('div', { className: "ui grid sixteen wide column row ", style: { padding: "2%" } },

                        React.createElement(issue, {
                            spMethod,
                            departmentName,
                            modelId: row[0],
                            responseBoxTitle: "Issue with Order"
                        }),
                        React.createElement(issue, {
                            spMethod,
                            departmentName,
                            modelId: row[0],
                            responseBoxTitle: "Maintenance Issue"
                        }),
                    ),
                    departmentName === 'paint' && React.createElement(lookuptable, {
                        headers,
                        row
                    })
                )
            )
        )
    )
};


export default PackoutLookup;
