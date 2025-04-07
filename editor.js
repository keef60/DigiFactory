const { useEffect, useRef, useState } = React

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
  filterTask

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
  const handleOpen = () => setVisible(true);

  useEffect(() => {
    const row = dataLifted[workingThisRow];
    const storedData = JSON.parse(localStorage.getItem(`goalProgress-paint-${row?.id}`));
    try {
      spMethod.fetchSharePointData('NOTES', departmentName);
      spMethod.fetchSharePointData('REPORTS', departmentName);
      spMethod.fetchSharePointData('ISSUES', departmentName);

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

    if (dataLifted.length > 0) fetchImages();
  }, [dataLifted]);


  $(document).on('click', '.save-note-paint', function (e) {
    e.preventDefault()
    let rowIndex = $(this).data('rowindexsave');
    let noteId = $(this).data('noteidsave');
    saveNoteToLocalStorage(noteId, rowIndex, notes[noteId]);
  });

  $(document).on('change', '.note-area', function (e) {
    let rowIndex = $(this).data('rowindex');
    let noteId = $(this).data('noteid');
    handleNoteChange(rowIndex, e, noteId);
  });

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(',', '');
  };

  const handleNoteChange = (rowIndex, e, noteId) => {
    setNotes(prevNotes => ({
      ...prevNotes,
      [noteId]: {
        [rowIndex]: e.target.value,
        noteId: noteId,
        date: Date.now()
      }
    }));
  };

  const saveNoteToLocalStorage = (noteId, rowIndex, newNote) => {
    let saveNotes = JSON.parse(localStorage.getItem('saved-notes-paint')) || {};

    if (!saveNotes[noteId]) saveNotes[noteId] = { noteId, date: Date.now() };
    if (!saveNotes[noteId][rowIndex]) saveNotes[noteId][rowIndex] = [];

    if (Array.isArray(saveNotes[noteId][rowIndex])) {
      // saveNotes[noteId][rowIndex] = saveNotes[noteId][rowIndex].filter(note => note !== null);

      if (newNote && newNote.noteId) {
        const noteExists = saveNotes[noteId][rowIndex].find(note => note.noteId === newNote.noteId && note.date === newNote.date);

        console.log(noteExists)
        if (!noteExists) {
          saveNotes[noteId][rowIndex].push(newNote);
          localStorage.setItem('saved-notes-paint', JSON.stringify(saveNotes));

          /* spMethod.handleSubmit(noteId, JSON.stringify(savedNotes), 'paint', 'NOTES')
              .then(e => console.log(e))
              .catch(err => console.log(err)); */
          setSavedNotes(saveNotes);
        }
      } else {
        console.error('Invalid newNote object', newNote);
      }
    } else {
      console.error(`Expected an array for savedNotes[${noteId}][${rowIndex}], but found:`, saveNotes[noteId][rowIndex]);
    }
  };


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

  const getImagePath = async (row) => {
    const imageName = row[0];
    const extensions = ['jpg', 'jpeg', 'png', 'gif', 'avif', 'webp'];

    for (let ext of extensions) {
      const path = `${departmentName !== 'packout' ? 'img/' : 'img/packout/'}${imageName}.${ext}`;
      if (await checkImageExists(path)) return path;
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

  const filteredData = dataLifted.filter(row => {
    return row.some(cell => (cell || '').toString().trim().toLowerCase().includes(searchQueryLifted.toLowerCase().trim()));
  });

  const headers = dataLifted[0] || [];

  return (
    <div className="ui grid" style={{ marginTop: '20px' }}>

     
      
      {/* Display each row in its own segment with name on top */}
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
        departmentName={departmentName}
        spMethod={spMethod}
        clearLoading={clearLoading}
        setWOnDev={setWOnDev}
        woNdev={woNdev}
        issesListData={issesListData}
        setSearchQuery={setSearchQuery}
        setFilterTask={setFilterTask}
        filterTask={filterTask}
      />

      {/* Modal for viewing pdf */}
      <div className="ui fullscreen modal pdf-viewer paint">
        <div className="header">Drawing</div>
        <div className="content">
          {/* Tabs Menu */}
          <div className="ui top attached tabular menu">
            <a className="item active" data-tab={headers[2]}>{headers[2]}</a>
            <a className="item" data-tab={headers[5]}>{headers[5]}</a>
            <a className="item" data-tab={headers[9]}>{headers[9]}</a>
          </div>

          {/* Tab Content Wrapper */}
          <div className="ui bottom attached active tab segment" data-tab={headers[2]}>
            <embed id="pdf-embed" src={pdfPath} type="application/pdf" width="100%" height="600px" />
          </div>
          <div className="ui bottom attached tab segment" data-tab={headers[5]}>
            <embed id="pdf-embed" src={pdfPath2} type="application/pdf" width="100%" height="600px" />
          </div>
          <div className="ui bottom attached tab segment" data-tab={headers[9]}>
            <iframe src="https://fnagroup-my.sharepoint.com/personal/kec1_fna-group_com/_layouts/15/embed.aspx?UniqueId=73a55f36-939d-4152-86f0-56da3a87eb01&nav=%7B%22playbackOptions%22%3A%7B%22startTimeInSeconds%22%3A0%7D%7D&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create" width="640" height="360" frameborder="0" scrolling="no" allowfullscreen title="IMG_2984.MOV"></iframe>
          </div>
        </div>
      </div>

      {/* Modal for viewing notes */}
      <div className="ui small modal note-viewer paint">
        <div className="header">Notes</div>

        <div className="content">
          {/* Tabs Menu */}
          <div className="ui top attached tabular menu">
            <a className="item active" data-tab="current">Current Notes</a>
            <a className="item" data-tab="saved">Saved Notes</a>
          </div>

          {/* Tab Content Wrapper */}
          <div className="ui bottom attached tab segment" data-tab="current">
            {dataLifted.map((row, rowIndex) =>
              notePath === row[0] && (
                <div key={rowIndex} className="ui segment basic">
                  <h3>Model {row[0]}</h3>
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
                          className="ui primary labeled icon button save-note-paint"
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
              )
            )}
          </div>

          <div
            className="ui bottom attached tab segment"
            data-tab="saved"
            style={{ maxHeight: '300px', overflowY: 'auto' }} // Add these styles for scrolling
          >
            {Object.keys(savedNotes).map((noteId) => {
              const note = savedNotes[noteId];
              return noteId === notePath.toString() && (
                <div key={noteId} className="ui segment basic">
                  <h3 style={{ top: '0', backgroundColor: 'white', zIndex: 1, padding: '3% 0' }}>
                    Saved Notes for Model {noteId}
                  </h3>
                  <div className="ui comments">
                    {Object.keys(note).map((rowIndex) => {
                      if (rowIndex !== 'noteId' && rowIndex !== 'date') {
                        return Array.isArray(note[rowIndex]) ? note[rowIndex].map((entry, index) => (
                          <div key={index} className="comment">
                            <div className="content">
                              <a className="author">User</a>
                              <div className="metadata">
                                <div className="date">{formatTimestamp(entry.date)}</div>
                              </div>
                              <div className="text">{entry[rowIndex]}</div>
                            </div>
                          </div>
                        )) : null;
                      }
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};


