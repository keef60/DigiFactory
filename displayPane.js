const { useEffect, useRef, useState } = React

const DisplayPaneNew = ({
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
    departmentName,
    spMethod,
    selectedNumber,
    setSelectedNumber,
    clearLoading,
    setWOnDev,
    woNdev,
    issesListData,
    setSearchQuery,
    setFilterTask,filterTask

}) => {
    const [activeTab, setActiveTab] = useState('lookup'); // default to "Look Up" tab
    console.log('display Pane', departmentName);

    const tabContent = {
        lookup: (
            <LookupComponent
                filteredData={filteredData}
                headers={headers}
                imagePaths={imagePaths}
                getPdfPath={getPdfPath}
                openPdfModal={openPdfModal}
                openNoteModal={openNoteModal}
                setPdfPath={setPdfPath}
                setPdfPath2={setPdfPath2}
                setPdfPath3={setPdfPath3}
                setNotePath={setNotePath}
                setWorkingThisRow={setWorkingThisRow}
                setGoal={setGoal}
                setProgress={setProgress}
                goal={goal}
                progress={progress}
                workingThisRow={workingThisRow}
                calculateCompletion={calculateCompletion}
                calculateRemaining={calculateRemaining}
                departmentName={departmentName}
                spMethod={spMethod}
                selectedNumber={selectedNumber}
                setSelectedNumber={setSelectedNumber}
                clearLoading={clearLoading}
                setWOnDev={setWOnDev}
                woNdev={woNdev}
                issesListData={issesListData}
                setFilterTask={setFilterTask}
                filterTask={filterTask}
            />
        ),
        pickList: (
            <PickListAppNew
                selectedDepartment={selectedDepartment}
                departmentName={departmentName}
                selectedNumber={selectedNumber}
                setWOnDev={setWOnDev}
            />
        ),
        item:(
            <ItemTest 
            selectedDepartment={selectedDepartment}
            departmentName={departmentName}
            selectedNumber={selectedNumber}
            setWOnDev={setWOnDev}
            
            />
        )
    };

    return (
        <div style={{ position: 'center', marginLeft: '5%', width: '95%' }}>
            <div className="ui menu">
                <a
                    className={`item ${activeTab === 'lookup' ? 'active' : ''}`}
                    onClick={() => setActiveTab('lookup')}
                >
                    All Builds
                </a>
                <a
                    className={`item ${activeTab === 'pickList' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pickList')}
                >
                    My Pick List
                </a>

                <a
                    className={`item ${activeTab === 'pickList' ? 'active' : ''}`}
                    onClick={() => setActiveTab('item')}
                >
                   Test
                </a>

                <MiniSearch
                    searchThisClass={`displayPaneNewBar-${departmentName}`}
                    showMiniSearchOnlyBool={true}
                    inventoryRef={[]}
                    setSearchQuery={setSearchQuery} />

                          {/* Filter toggles */}


            </div>
            <div className={`ui bottom segment basic ${clearLoading ? 'ui active centered inline loader' : ''}`}>
                {tabContent[activeTab]} {/* Render content based on the active tab */}
            </div>
        </div>
    );
};


