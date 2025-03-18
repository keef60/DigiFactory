const { useState, useEffect } = React;

const DisplayPane = ({
    pickListApp,
    selectedDepartment,
    filteredData,
    imagePaths,
    headers,
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
    calculateCompletion,
    calculateRemaining,
    workingThisRow,
    lookupComponent,
    goalProgressInput,
    departmentName,
    lookuptable,
    spMethod,
    issue,
    lineSelection,
    selectedNumber,
    setSelectedNumber,
    chart,clearLoading
}) => {
    const [activeTab, setActiveTab] = useState('lookup'); // default to "Look Up" tab
console.log('display Pane',departmentName);
    const tabContent = {
        lookup: React.createElement(lookupComponent, {
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
            clearLoading
            
        }),
        pickList: React.createElement(pickListApp, { selectedDepartment, departmentName,selectedNumber}),
    };

    return React.createElement('div', null,
        React.createElement('div', { className: 'ui top attached tabular menu ',style:{ marginTop: "2.5%"} },
            React.createElement('a', {
                className: `item ${activeTab === 'lookup' ? 'active' : ''}`,
                onClick: () => setActiveTab('lookup')
            }, 'Look Up'),
            React.createElement('a', {
                className: `item ${activeTab === 'pickList' ? 'active' : ''}`,
                onClick: () => setActiveTab('pickList')
            }, 'My Pick List')
        ),
        React.createElement('div', { className: `ui bottom attached segment basic ${clearLoading? 'loading':''}`  },
            tabContent[activeTab]  // Render content based on the active tab
        )
    );
};

export default DisplayPane;
