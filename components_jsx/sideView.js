//Commit Update
const SideView = ({
  selectedNumber,
  setSelectedNumber,
  imagePaths,
  row,
  workDetails,
  rowIndex,
  departmentRefName,
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
  headers,
  issesListData,
  clearLoading,
  getPdfPath,
  openPdfModal,
  openNoteModal,
  setPdfPath,
  setPdfPath2,
  setPdfPath3,
  setNotePath,
  isTimerRunning,
  setFilterTask,
  filterTask
}) => {

  return (
    <div
      className={`ui right  vertical menu sidebar  `}
      style={{ width: '900px' }}
    >
      <ItemDisplaySideBar
        selectedNumber={selectedNumber}
        setSelectedNumber={setSelectedNumber}
        imagePaths={imagePaths}
        row={row}
        workDetails={workDetails}
        rowIndex={rowIndex}
        departmentRefName={departmentRefName}
        workingThisRow={workingThisRow}
        goal={goal}
        progress={progress}
        setWorkingThisRow={setWorkingThisRow}
        setGoal={setGoal}
        setProgress={setProgress}
        calculateCompletion={calculateCompletion}
        calculateRemaining={calculateRemaining}
        departmentName={departmentName}
        spMethod={spMethod}
        headers={headers}
        issesListData={issesListData}
        clearLoading={clearLoading}
        getPdfPath={getPdfPath}
        openPdfModal={openPdfModal}
        openNoteModal={openNoteModal}
        setPdfPath={setPdfPath}
        setPdfPath2={setPdfPath2}
        setPdfPath3={setPdfPath3}
        setNotePath={setNotePath}
        filterTask={filterTask}
        setFilterTask={setFilterTask}
      /> 
    </div>
  );
};


