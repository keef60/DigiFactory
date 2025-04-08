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

}) => {


  const [sheetName, setSheetName] = useState(sheetNameLifted);
  const [searchQuery, setSearchQueryOld] = useState(searchQueryLifted);
  const [newRecord, setNewRecord] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePaths, setImagePaths] = useState({});
  const [pdfPath, setPdfPath] = useState({});
  const [pdfPath2, setPdfPath2] = useState({});
  const [pdfPath3, setPdfPath3] = useState({});
  const [notePath, setNotePath] = useState({});
  const [notes, setNotes] = useState({});
  const [pickListActiveTab, setPickListActiveTab] = useState(false);
  const [savedNotes, setSavedNotes] = useState(
    JSON.parse(localStorage.getItem(`saved-notes-line${selectedNumber}`)) || {}
  );
  const [visible, setVisible] = useState(visibleLifted);
  const [goal, setGoal] = useState(
    JSON.parse(localStorage.getItem(`goalProgress-line${selectedNumber}-${notePath}`))?.goal
  );
  const [progress, setProgress] = useState(
    JSON.parse(localStorage.getItem(`goalProgress-line${selectedNumber}-${notePath}`))?.progress
  );
  const [workingThisRow, setWorkingThisRow] = useState('');

  const handleClose = () => {
    setVisible(false);
  };

  const handleOpen = () => {
    setVisible(true);
  };

  useEffect(() => {
    if (selectedNumber !== null) {
      spMethod.fetchSharePointData('NOTES', departmentName + selectedNumber);
      spMethod.fetchSharePointData('REPORTS', departmentName + selectedNumber);
      spMethod.fetchSharePointData('ISSUES', departmentName + selectedNumber);
    }
  }, [selectedNumber]);

  useEffect(() => {
    const row = dataLifted[workingThisRow];
    const storedData = JSON.parse(
      localStorage.getItem(`goalProgress-line${selectedNumber}-${row?.id}`)
    );

    if (storedData) {
      setGoal(storedData.goal);
      setProgress(storedData.progress);
    }
  }, [dataLifted, workingThisRow]);

  useEffect(() => {
    localStorage.setItem(`saved-notes-line${selectedNumber}`, JSON.stringify(savedNotes));
  }, [savedNotes]);

  useEffect(() => {
    setSavedNotes(
      JSON.parse(localStorage.getItem(`saved-notes-line${selectedNumber}`)) || {}
    );
  }, [selectedNumber]);

  useEffect(() => {
    $('.menu .item').tab();
    $('.ui .item').tab();
    $('.ui.dropdown').dropdown({ allowAdditions: true });
    $('.ui.progress').progress();
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      const imageMap = {};
      await Promise.all(
        dataLifted.map(async (row) => {
          const path = await getImagePath(row);
          imageMap[row[0]] = path;
        })
      );
      setImagePaths(imageMap);
    };

    if (dataLifted.length > 0) {
      fetchImages();
    }
  }, [dataLifted]);

  useEffect(() => {
    $(document).on('click', `.save-new-record-line${selectedNumber}`, function () {
      addNewRecord();
    });

    $(document).on('change', '.new-record', function (e) {
      handleNewRecordChange(e, e.target.placeholder);
    });

    $(document).on('click', `.save-note-line`, function (e) {
      let rowIndex = $(this).data('rowindexsave');
      let noteId = $(this).data('noteidsave');
      saveNoteToLocalStorage(noteId, rowIndex, notes[noteId]);
    });

    $(document).on('change', '.note-area', function (e) {
      let rowIndex = $(this).data('rowindex');
      let noteId = $(this).data('noteid');
      handleNoteChange(rowIndex, e, noteId);
    });
  }, [newRecord]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);

    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).replace(',', '');
  };

  const handleNoteChange = (rowIndex, e, noteId) => {
    setNotes((prevNotes) => ({
      ...prevNotes,
      [noteId]: {
        [rowIndex]: e.target.value,
        noteId: noteId,
        date: Date.now(),
      },
    }));
  };

  const saveNoteToLocalStorage = (noteId, rowIndex, newNote) => {
    let savedNotes = JSON.parse(localStorage.getItem(`saved-notes-line${selectedNumber}`)) || {};

    if (!savedNotes[noteId]) {
      savedNotes[noteId] = { noteId, date: Date.now() };
    }

    if (!savedNotes[noteId][rowIndex]) {
      savedNotes[noteId][rowIndex] = [];
    }

    if (Array.isArray(savedNotes[noteId][rowIndex])) {
      savedNotes[noteId][rowIndex] = savedNotes[noteId][rowIndex].filter((note) => note !== null);

      if (newNote && newNote.noteId) {
        const noteExists = savedNotes[noteId][rowIndex].some(
          (note) => note.noteId === newNote.noteId && note.date === newNote.date
        );

        if (!noteExists) {
          savedNotes[noteId][rowIndex].push(newNote);
          localStorage.setItem(`saved-notes-line${selectedNumber}`, JSON.stringify(savedNotes));
          spMethod.handleSubmit(noteId, JSON.stringify(savedNotes), `line${selectedNumber}`, 'NOTES')
            .then((e) => console.log(e))
            .catch((err) => console.log(err));
          setSavedNotes(savedNotes);
        }
      } else {
        console.error('Invalid newNote object', newNote);
      }
    } else {
      console.error(`Expected an array for savedNotes[${noteId}][${rowIndex}], but found:`, savedNotes[noteId][rowIndex]);
    }
  };

  const handleNewRecordChange = (e, field) => {
    setNewRecord({ ...newRecord, [field]: e.target.value });
  };

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

  const filteredData = dataLifted.filter((row) => {
    return row.some((cell) => {
      const cellValue = (cell || '').toString().trim().toLowerCase();
      return cellValue.includes(searchQueryLifted.toLowerCase().trim());
    });
  });

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
      <DisplayPaneNew
        selectedDepartment={selectedDepartment}
        filteredData={filteredData}
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

      <div className="ui small modal note-viewer line">
        <div className="header">Notes</div>
        <div className="content">
          <div className="ui top attached tabular menu">
            <a className="item active" data-tab="current">
              Current Notes
            </a>
            <a className="item" data-tab="saved">
              Saved Notes
            </a>
          </div>
          <div className="ui bottom attached tab segment" data-tab="current">
            {dataLifted.map((row, rowIndex) =>
              notePath === row[0] ? (
                <div key={rowIndex} className="ui segment basic">
                  <h3>{`Model ${row[0]}`}</h3>
                  <div className="ui comments">
                    <div className="comment">
                      <div className="content">
                        <a className="author">User</a>
                        <div className="metadata">
                          <div className="date">Just now</div>
                        </div>
                        <div className="text">
                          {notes[row[0]] && notePath === notes[row[0]].noteId
                            ? notes[row[0]][rowIndex] ?? 'No notes yet...'
                            : 'No notes yet...'}
                        </div>
                        <form className="ui reply form">
                          <div className="field">
                            <textarea
                              className="note-area"
                              placeholder="Enter your note..."
                              data-rowIndex={rowIndex}
                              data-noteId={row[0]}
                            />
                          </div>
                        </form>
                        <div className="ui divider hidden" />
                        <button
                          className="ui primary labeled icon button save-note-line"
                          data-rowIndexSave={rowIndex}
                          data-noteIdSave={row[0]}
                        >
                          <i className="icon edit" />
                          Add Note
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null
            )}
          </div>
          <div
            className="ui bottom attached tab segment"
            data-tab="saved"
            style={{ maxHeight: '300px', overflowY: 'auto' }}
          >
            {Object.keys(savedNotes).map((noteId) => {
              const note = savedNotes[noteId];
              return noteId === notePath.toString() ? (
                <div key={noteId} className="ui segment basic">
                  <h3
                    style={{
                      top: '0',
                      backgroundColor: 'white',
                      zIndex: 1,
                      padding: '3% 0',
                    }}
                  >
                    {`Saved Notes for Model ${noteId}`}
                  </h3>
                  <div className="ui comments">
                    {Object.keys(note)
                      .filter((rowIndex) => rowIndex !== 'noteId' && rowIndex !== 'date')
                      .map((rowIndex) =>
                        Array.isArray(note[rowIndex])
                          ? note[rowIndex].map((entry, index) => (
                              <div key={index} className="comment">
                                <div className="content">
                                  <a className="author">User</a>
                                  <div className="metadata">
                                    <div className="date">{formatTimestamp(entry.date)}</div>
                                  </div>
                                  <div className="text">{entry.text}</div>
                                </div>
                              </div>
                            ))
                          : null
                      )}
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};


