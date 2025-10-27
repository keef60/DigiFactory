//Commit Update
const Editor = ({
  spMethod,
  selectedDepartment,
  departmentName,
  searchQueryLifted,
  visibleLifted,
  dataLifted,
  sheetNameLifted,
  setData,
  clearLoading,
  setWOnDev,
  woNdev,
  issesListData,
  setError,
  setSearchQuery,
  setFilterTask,
  filterTask,
  inventoryDepartmentName,
  inventoryRef,
  user,
  email,
  setLoginModalOpen,
  setClearLoading,
  loginModalOpen,
  handleDepartmentClick,
  gpDataInput,
  setReload,
  reload


}) => {
  const [imagePaths, setImagePaths] = useState({});
  const [pdfPath, setPdfPath] = useState({});
  const [pdfPath2, setPdfPath2] = useState({});
  const [pdfPath3, setPdfPath3] = useState({});
  const [notePath, setNotePath] = useState({});

  const [goal, setGoal] = useState(0);
  const [progress, setProgress] = useState(0);
  const [workingThisRow, setWorkingThisRow] = useState('');

  const handleClose = () => setVisible(false);


  useEffect(() => {
    const row = dataLifted[workingThisRow];
    try {
      spMethod.fetchSharePointData('NOTES', departmentName);
      spMethod.fetchSharePointData('REPORTS', departmentName);
      spMethod.fetchSharePointData('ISSUES', departmentName);
      spMethod.fetchSharePointData('Maintenance', departmentName);
      spMethod.fetchSharePointData('PICKLIST', departmentName);
      spMethod.fetchSharePointData('TIME', departmentName);
      spMethod.fetchSharePointData('Live Packout', 'FarSide');
      spMethod.fetchSharePointData('IP', 'FarSide');
      spMethod.fetchSharePointData('ELECTRIC KIT', departmentName);
      
    } catch (error) {
      setError(error)
    }


  }, [dataLifted, workingThisRow]);

  $(document).on('click', '.icon.close', handleClose);

  useEffect(() => {
    $('.menu .item').tab();
    $('.ui .item').tab();
    $('.ui.dropdown').dropdown({ allowAdditions: true });
    $('.ui.progress').progress();
  }, []);


  const getPdfPath = (row) => {
    const pdfFolder = departmentName === 'packout' ? "img/packout/pdfs/" : "img/";
    const pdfName = row[2], pdfName2 = row[5], pdfName3 = row[9];
    return [`${pdfFolder}${pdfName}.pdf`, `${pdfFolder}${pdfName2}.pdf`, `${pdfFolder}${pdfName3}.pdf`];
  };

  const openPdfModal = (pdfFile) => $('.ui.fullscreen.modal.pdf-viewer.paint').modal('show');
  const openNoteModal = () => $('.ui.small.modal.note-viewer.paint').modal('show');

  const checkImageExists = (path) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = path;
      img.onerror = () => resolve(false);
      img.onload = () => resolve(true);
    });
  };

  const calculateCompletion = (goal, progress) => {
    if (!goal || !progress) return 0;
    return Math.min((progress / goal) * 100, 100);
  };

  const calculateRemaining = (goal, progress) => {
    if (!goal || !progress) return 0;
    return goal - progress;
  };

  return (
    <div className="ui grid" style={{ marginTop: '10px' }}>

      {/* Display each row in its own segment with name on top */}
      <OrderDisplayPane
        selectedDepartment={selectedDepartment}
        imagePaths={imagePaths}
        getPdfPath={getPdfPath}
        setPdfPath={setPdfPath}
        setPdfPath2={setPdfPath2}
        setPdfPath3={setPdfPath3}
        setNotePath={setNotePath}
        setWorkingThisRow={setWorkingThisRow}
        setGoal={setGoal}
        setProgress={setProgress}
        goal={goal}
        progress={progress}
        calculateCompletion={calculateCompletion}
        calculateRemaining={calculateRemaining}
        workingThisRow={workingThisRow}
        departmentName={departmentName}
        spMethod={spMethod}
        clearLoading={clearLoading}
        setWOnDev={setWOnDev}
        woNdev={woNdev}
        issesListData={issesListData}
        setSearchQuery={setSearchQuery}

        inventoryDepartmentName={inventoryDepartmentName}
        inventoryRef={inventoryRef}
        user={user}
        email={email}
        setClearLoading={setClearLoading}
        setLoginModalOpen={setLoginModalOpen}
        handleDepartmentClick={handleDepartmentClick}
        loginModalOpen={loginModalOpen}
        gpDataInput={gpDataInput}
        setReload={setReload}
        reload={reload}
      />

    </div>
  );
};


