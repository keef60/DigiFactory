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
  setLoginModalOpen,
  setClearLoading,
  loginModalOpen,
  handleDepartmentClick,
  gpDataInput,
  setReload,
  reload


}) => {


  const [sheetName, setSheetName] = useState(sheetNameLifted);
  const [searchQuery, setSearchQueryOld] = useState(searchQueryLifted);
  const [imagePaths, setImagePaths] = useState({});
  const [pdfPath, setPdfPath] = useState({});
  const [pdfPath2, setPdfPath2] = useState({});
  const [pdfPath3, setPdfPath3] = useState({});
  const [notePath, setNotePath] = useState({});
  const [notes, setNotes] = useState({});
  const [savedNotes, setSavedNotes] = useState(JSON.parse(localStorage.getItem('saved-notes-paint')) || {});
  const [visible, setVisible] = useState(visibleLifted);
  const [goal, setGoal] = useState(JSON.parse(localStorage.getItem(`goalProgress-paint-${notePath}`))?.goal);
  const [progress, setProgress] = useState(JSON.parse(localStorage.getItem(`goalProgress-paint-${notePath}`))?.progress);
  const [workingThisRow, setWorkingThisRow] = useState('');

  const handleClose = () => setVisible(false);


  useEffect(() => {
    const row = dataLifted[workingThisRow];
    const storedData = JSON.parse(localStorage.getItem(`goalProgress-paint-${row?.id}`));
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

    if (storedData) {
      setGoal(storedData.goal);
      setProgress(storedData.progress);
    }
  }, [dataLifted, workingThisRow]);

  $(document).on('click', '.icon.close', handleClose);

  useEffect(() => {
    $('.menu .item').tab();
    $('.ui .item').tab();
    $('.ui.dropdown').dropdown({ allowAdditions: true });
    $('.ui.progress').progress();
  }, []);




/*   $(document).on('click', '.save-note-paint', function (e) {
    e.preventDefault()
    let rowIndex = $(this).data('rowindexsave');
    let noteId = $(this).data('noteidsave');
    saveNoteToLocalStorage(noteId, rowIndex, notes[noteId]);
  });

  $(document).on('change', '.note-area', function (e) {
    let rowIndex = $(this).data('rowindex');
    let noteId = $(this).data('noteid');
    handleNoteChange(rowIndex, e, noteId);
  }); */

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


