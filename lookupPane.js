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
    departmentName,
    lookuptable,
    spMethod,
    issue,
    lineSelection,
    selectedNumber,
    setSelectedNumber,
    chart,
    clearLoading,
    detailPaneMini,
     setWOnDev,
    woNdev
}) => {
    console.log('lookup Pane', departmentName);
    console.log(woNdev)
    const [toggleFilter, setToggleFilter] = useState(true);
    const [filterBtnName, setFilterBtnName] = useState('Hide Weekly Orders');
    const [quickVeiw, setQuickVeiw] = useState(true);
    const [quickVeiwTitle, setQuickVeiwTitle] = useState('Expand Details');
    const departmentRefName = departmentName.charAt(0).toUpperCase() + departmentName.slice(1);

    useEffect(() => {
        $('.ui.checkbox').checkbox();


    })
    const toggle = () => {
        setToggleFilter(!toggleFilter);
        setFilterBtnName(toggleFilter ? 'Show Weekly Orders' : 'Hide Weekly Orders');
    };

    const toggleQuickVeiw = () => {
        setQuickVeiw(!quickVeiw);
        setQuickVeiwTitle(!quickVeiw ? 'Expand Details' : 'View Summary');

    };

    const findThisEntry = departmentName === 'line' && selectedNumber !== null ?
        departmentName + selectedNumber :
        departmentName === 'line' && selectedNumber !== null ?
            departmentName + 1 :
            departmentName;

    // Filtered data based on localStorage if toggleFilter is on
    const filteredDataWithStorageCheck = toggleFilter && departmentName !== 'paint' ? filteredData.filter(row => {
        const localStorageKey = `goalProgress-${findThisEntry}-${row[0]}`;
        const storedValue = localStorage.getItem(localStorageKey);
        return storedValue;
    }) : filteredData;
   

    return React.createElement('div', { className: 'ui divided items  ', },
        //Filter toggles
        React.createElement('div', { className: 'ui segment  ' },
            React.createElement('h4', { className: 'header' }, 'Filter Settings'),
            React.createElement('div',
                {
                    className: 'ui toggle checkbox',
                    style: { padding: '1%' },
                    onClick: toggle
                },
                React.createElement('input', {
                    type: 'checkbox',
                    tabIndex: '0',
                    className: 'hidden',
                    checked: toggleFilter,
                    readOnly: true
                }),
                React.createElement('label', null, filterBtnName)
            ),

            React.createElement('div',
                {
                    className: 'ui toggle checkbox inline field',
                    style: { padding: '1%' },
                    onClick: toggleQuickVeiw
                },
                React.createElement('input', {
                    type: 'checkbox',
                    tabIndex: '0',
                    className: 'hidden',
                    checked: quickVeiw,
                    readOnly: true
                }),
                React.createElement('label', null, quickVeiwTitle)
            ),
        ),
        filteredDataWithStorageCheck.map((row, rowIndex) =>
            !quickVeiw ? React.createElement('div', { key: rowIndex, className: `ui segment black ${clearLoading ? 'loading' : ''}` },
               React.createElement('h1',{className:'ui header'},woNdev[1].fields['WO']),
               React.createElement('h1',{className:'ui sub header'},woNdev[1].fields['DEV']), 
               React.createElement('div', { className: 'ui divider' }),
                React.createElement('div', { className: 'ui divider hidden' }),
                departmentName === 'line' && React.createElement(lineSelection, { selectedNumber, setSelectedNumber }),
                React.createElement('div', { className: 'ui grid internally celled' },
                    React.createElement('div', { className: 'four wide column', style: { textAlign: 'center' } },
                        imagePaths[row[0]] && imagePaths[row[0]] !== 'img/default_image.jpg' ?
                            React.createElement('img', { className: 'ui fluid image', src: imagePaths[row[0]], alt: 'Loaded Image' }) :
                            React.createElement('div', { className: 'ui placeholder' },
                                React.createElement('div', { className: 'image' })
                            ),
                        React.createElement('div', { className: 'ui divider hidden' }),
                        React.createElement('div', { className: 'ui buttons' },
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
                                className: 'ui small button',
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
                    React.createElement('div', { className: 'ui sixteen wide column row', style: { padding: "2.5%" } },
                        React.createElement('div', { className: 'ui header huge' }, `Performance and Goal Monitoring Dashboard`,
                            React.createElement('div', { className: 'ui sub header' }, `${departmentRefName}`)
                        )
                    ),
                    React.createElement('div', { className: "ui grid sixteen wide column row", style: { padding: "2%" } },
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
                        })
                    ),
                    React.createElement('div', { className: 'ui sixteen wide column row', style: { padding: '2.5%' } },
                        React.createElement('div', { className: 'ui header huge' }, `Manufacturing Issues and Action Dashboard`,
                            React.createElement('div', { className: 'ui sub header' }, `${departmentRefName}`)
                        )
                    ),
                    React.createElement('div', { className: "ui grid  sixteen wide column row ", style: { padding: '2.5%' } },

                        React.createElement(issue, {
                            spMethod,
                            departmentName,
                            modelId: row[0],
                            responseBoxTitle: "Issue with Order",
                            selectedNumber,
                            listName: 'ISSUES',
                            issueArrayName: 'issues'

                        }),
                        React.createElement(issue, {
                            spMethod,
                            departmentName,
                            modelId: row[0],
                            responseBoxTitle: "Maintenance Issue",
                            selectedNumber,
                            listName: 'Maintenance',
                            issueArrayName: 'maintenance'
                        })

                    ),
                    departmentName === 'paint' && React.createElement(lookuptable, {
                        headers,
                        row
                    })
                )
            ) : React.createElement('div',
                { className: `ui items segment  `, style: { padding: '3%' }, key: rowIndex },
                // First Item: Image and Details
                departmentName === 'line' && React.createElement(lineSelection, { selectedNumber, setSelectedNumber }),

                React.createElement('div', { className: 'item', style: { marginRight: '60px' } },

                    React.createElement('div', { className: 'image' },
                        imagePaths[row[0]] && imagePaths[row[0]] !== 'img/default_image.jpg' ?
                            React.createElement('img', { className: 'ui fluid image', src: imagePaths[row[0]], alt: 'Loaded Image' }) :
                            React.createElement('div', { className: 'ui placeholder' },
                                React.createElement('div', { className: 'image' })
                            )
                    ),
                    // Second Item: Goal Monitoring and Progress
                    React.createElement('div', { className: 'item' },
                        React.createElement('h2', { className: 'header' }, row[0]),

                        React.createElement('div', { className: 'image' },
                            React.createElement('i', { className: 'ui icon chart bar' })
                        ),

                        React.createElement('div', { className: 'content' },
                            React.createElement('h4', { className: 'header' }, 'Performance and Goal Monitoring'),
                            React.createElement('div', { className: 'meta' },
                                React.createElement('span', null, departmentRefName)
                            ),
                            React.createElement('div', { className: 'description' },
                                React.createElement('p', null, 'Monitor the progress and goals associated with this item.')
                            ),
                            React.createElement('div', { className: 'extra' },
                                React.createElement(detailPaneMini, {
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
                                })
                            )
                        )
                    ),
                ),



            )
        )
    );
};

export default LookupComponent;
