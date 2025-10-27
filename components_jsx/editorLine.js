//Commit Update
const { useEffect, useRef, useState } = React

const LinesEditorNew = ( {
  spMethod,

  selectedDepartment,

  departmentName,
  goalProgressInput,
  searchQueryLifted,
  visibleLifted,
  dataLifted,
  sheetNameLifted,
  selectedNumber,
  setSelectedNumber,
  clearLoading,
  setWOnDev,
  woNdev,
  issesListData,
  setSearchQuery,
  setFilterTask,
  filterTask,
  inventoryDepartmentName,
  inventoryRef,
  gpDataInput,
  email,
  user,
  setLoginModalOpen,
  setClearLoading,
  loginModalOpen,
  handleDepartmentClick,
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

  useEffect(() => {
    if (selectedNumber !== null) {
      spMethod.fetchSharePointData('NOTES', `line${selectedNumber}`);
      spMethod.fetchSharePointData('REPORTS', `line${selectedNumber}`);
      spMethod.fetchSharePointData('ISSUES', `line${selectedNumber}`);
      spMethod.fetchSharePointData('Maintenance', `line${selectedNumber}`);
      spMethod.fetchSharePointData('PICKLIST', `line${selectedNumber}`);
      spMethod.fetchSharePointData('TIME', `line${selectedNumber}`);
    }
  }, [selectedNumber]);

  useEffect(() => {
    $('.menu .item').tab();
    $('.ui .item').tab();
    $('.ui.dropdown').dropdown({ allowAdditions: true });
    $('.ui.progress').progress();
  }, []);

  const getPdfPath = (row) => {
    const pdfFolder = 'img/';

    const pdfName = row[2],
      pdfName2 = row[5],
      pdfName3 = row[9];

    const pdfFile = `${pdfFolder}${pdfName}.pdf`,
      pdfFile2 = `${pdfFolder}${pdfName2}.pdf`,
      pdfFile3 = `${pdfFolder}${pdfName3}.pdf`;

    return [pdfFile, pdfFile2, pdfFile3];
  };

  const openPdfModal = (pdfFile) => {
    $('.ui.fullscreen.modal.pdf-viewer.line').modal('show');
  };

  const headers = dataLifted[0] || [];

  const openNoteModal = () => {
    $('.ui.small.modal.note-viewer.line').modal('show');
  };

  const checkImageExists = (path) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = path;
      img.onerror = () => resolve(false);
      img.onload = () => resolve(true);
    });
  };

  const getImagePath = async (row) => {
    const imageName = row[0];
    const extensions = ['jpg', 'jpeg', 'png', 'gif', 'avif', 'webp'];

    for (let ext of extensions) {
      const path = `img/${imageName}.${ext}`;
      if (await checkImageExists(path)) {
        return path;
      }
    }
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
    <div className="ui grid" style={{ marginTop: '20px' }}>
      <OrderDisplayPane
        selectedDepartment={selectedDepartment}
        imagePaths={imagePaths}
        headers={headers}
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
        setSearchQuery={setSearchQuery}
        goalProgressInput={goalProgressInput}
        departmentName={departmentName}
        spMethod={spMethod}
        selectedNumber={selectedNumber}
        setSelectedNumber={setSelectedNumber}
        clearLoading={clearLoading}
        setWOnDev={setWOnDev}
        woNdev={woNdev}
        issesListData={issesListData}
        setFilterTask={setFilterTask}
        inventoryDepartmentName={inventoryDepartmentName}
        inventoryRef={inventoryRef}
        gpDataInput={ gpDataInput}
        user={user}
        email={email}
        setClearLoading={setClearLoading}
        setLoginModalOpen={setLoginModalOpen}
        handleDepartmentClick={handleDepartmentClick}
        loginModalOpen={loginModalOpen}
        setReload={setReload}
        reload={reload}
      />

      <div className="ui fullscreen modal pdf-viewer line">
        <div className="header">Drawing</div>
        <div className="content">
          <div className="ui top attached tabular menu">
            <a className="item active" data-tab={headers[2]}>
              {headers[2]}
            </a>
            <a className="item" data-tab={headers[5]}>
              {headers[5]}
            </a>
            <a className="item" data-tab={headers[9]}>
              {headers[9]}
            </a>
          </div>
          <div className="ui bottom attached active tab segment" data-tab={headers[2]}>
            <embed
              id="pdf-embed"
              src={pdfPath}
              type="application/pdf"
              width="100%"
              height="600px"
            />
          </div>
          <div className="ui bottom attached tab segment" data-tab={headers[5]}>
            <embed
              id="pdf-embed"
              src={pdfPath2}
              type="application/pdf"
              width="100%"
              height="600px"
            />
          </div>
          <div className="ui bottom attached tab segment" data-tab={headers[9]}>
            <embed
              id="pdf-embed"
              src={pdfPath3}
              type="application/pdf"
              width="100%"
              height="600px"
            />
          </div>
        </div>
      </div>

    </div>
  );
};


