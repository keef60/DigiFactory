//Commit Update
const { useEffect, useRef, useState } = React

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
  departmentName,
  spMethod,
  selectedNumber,
  setSelectedNumber,
  clearLoading,
  setWOnDev,
  woNdev,
  issesListData,
  setFilterTask,
  filterTask
}) => {
  console.log('lookup Pane', departmentName);

  const [toggleFilter, setToggleFilter] = useState(true);
  const [filterBtnName, setFilterBtnName] = useState('Hide Weekly Orders');
  const [quickVeiw, setQuickVeiw] = useState(true);
  const [quickVeiwTitle, setQuickVeiwTitle] = useState('Expand Details');
  const departmentRefName = departmentName.charAt(0).toUpperCase() + departmentName.slice(1);

  useEffect(() => {
    $('.ui.checkbox').checkbox();
  }, [toggleFilter]);

  const toggle = () => {
    setToggleFilter(!toggleFilter);
    setFilterBtnName(toggleFilter ? 'Show Weekly Orders' : 'Hide Weekly Orders');
  };

  const toggleQuickVeiw = () => {
    setQuickVeiw(!quickVeiw);
    setQuickVeiwTitle(!quickVeiw ? 'Expand Details' : 'View Summary');
  };

  const findThisEntry =
    departmentName === 'line' && selectedNumber !== null
      ? departmentName + selectedNumber
      : departmentName === 'line' && selectedNumber !== null
        ? departmentName + 1
        : departmentName;

  let workDetails = [];
  // Filtered data based on localStorage if toggleFilter is on
  const filteredDataWithStorageCheck =
    toggleFilter && departmentName !== 'paint'
      ? filteredData.filter((row) => {
        const localStorageKey = `goalProgress-${findThisEntry}-${row[0]}`;
        const storedValue = localStorage.getItem(localStorageKey);
        if (storedValue !== null && toggleFilter) {
          workDetails.push(JSON.parse(storedValue));
        }
        if (!toggleFilter) {
          workDetails.push(JSON.parse(storedValue));
        }
        return storedValue;
      })
      : filteredData;


  return (
    <div className="ui divided items">
      {/* Filter toggles */}
      <FilterSettings
        toggle={toggle}
        toggleFilter={toggleFilter}
        filterBtnName={filterBtnName}
        toggleQuickVeiw={toggleQuickVeiw}
        quickVeiw={quickVeiw}
        quickVeiwTitle={quickVeiwTitle}

      />

      {filteredDataWithStorageCheck.map((row, rowIndex) =>
        !quickVeiw ? (
          <ItemDisplay
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
          />
        ) : (
          <ItemDisplayMini
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
            setFilterTask={setFilterTask}
            filterTask={filterTask}
          />
        )
      )}
    </div>
  );
};

