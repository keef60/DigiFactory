const { useState, useEffect } = React;

const PaintEditor = (props) => {
    // Access the function from props
    const { 
        spMethod,
        pickListApp,
        selectedDepartment,
        displayPane,
        lookupComponent,
        departmentName,
        goalProgressInput,
        searchQueryLifted,
        visibleLifted,
        dataLifted,
        sheetNameLifted, 
        setData, 
        lookuptable,
        issue,
        chart
    } = props;

    /* const [data, setData] = useState(dataLifted); */
    const [sheetName, setSheetName] = useState(sheetNameLifted);
    const [searchQuery, setSearchQuery] = useState(searchQueryLifted);
    const [newRecord, setNewRecord] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imagePaths, setImagePaths] = useState({}); // Store image paths dynamically
    const [pdfPath, setPdfPath] = useState({});
    const [pdfPath2, setPdfPath2] = useState({});
    const [pdfPath3, setPdfPath3] = useState({});
    const [notePath, setNotePath] = useState({});
    const [notes, setNotes] = useState({});
    const [quantities, setQuantities] = useState({});
    const [pickListActiveTab, setPickListActiveTab] = useState(false);
    const [savedNotes, setSavedNotes] = useState(JSON.parse(localStorage.getItem('saved-notes-paint')) || {});
    const [visible, setVisible] = useState(visibleLifted);
    const [goal, setGoal] = useState(JSON.parse(localStorage.getItem(`goalProgress-paint-${notePath}`))?.goal);
    const [progress, setProgress] = useState(JSON.parse(localStorage.getItem(`goalProgress-paint-${notePath}`))?.progress);
    const [workingThisRow, setWorkingThisRow] = useState('');

    const handleClose = () => {
        setVisible(false);

    };

    const handleOpen = () => {
        setVisible(true);

    };

    useEffect(() => {
        // Access the first item of the `data` array (row is `data[i]`)
        const row = dataLifted[workingThisRow];  // `row` is now referring to `data[i]`
        const storedData = JSON.parse(localStorage.getItem(`goalProgress-paint-${row?.id}`)); // Assuming `row.id` is unique

        /* TODO make sure spMethod only works when localstorage is not blank */
        spMethod.fetchSharePointData('NOTES',departmentName);
        spMethod.fetchSharePointData('REPORTS',departmentName);
        spMethod.fetchSharePointData('ISSUES',departmentName);
        

        if (storedData) {
            /* TODO use spMethod to set the units for the schedule */
            setGoal(storedData.goal);
            setProgress(storedData.progress);
        }
    }, [dataLifted, workingThisRow]);  // Depend on `data` to load data when `data` changes

    useEffect(() => {
        localStorage.setItem('saved-notes-paint', JSON.stringify(savedNotes));
    }, [savedNotes]); // This will update localStorage whenever savedNotes changes

    $(document).on('click', '.icon.close', () => {
        handleClose();
    })

    useEffect(() => {
        $('.menu .item').tab();
        $('.ui .item').tab();
        $('.ui.dropdown').dropdown({
            allowAdditions: true
          }); // Initialize Semantic UI dropdown
        $('.ui.progress').progress();
        

    }, []);

    useEffect(() => {
        localStorage.setItem('notes-paint', JSON.stringify(notes));
        //  localStorage.setItem('quantities', JSON.stringify(quantities));
    }, [notes, quantities]);

    useEffect(() => {

        const fetchImages = async () => {
            const imageMap = {};
            await Promise.all(
                dataLifted.map(async (row) => {
                    const path = await getImagePath(row);
                    imageMap[row[0]] = path; // Store path using a unique identifier
                })
            );
            setImagePaths(imageMap);
        };

        if (dataLifted.length > 0) {
            fetchImages();
        }
    }, [dataLifted]);

    $(document).on('click', '.save-new-record-paint', function () {

        addNewRecord();
    });

    useEffect(() => {

        $(document).on('change', '.new-record', function (e) {
            handleNewRecordChange(e, e.target.placeholder);
        });
    }, [newRecord]);

    $(document).on('click', '.save-note-paint', function (e) {
        let rowIndex = $(this).data('rowindexsave'), // Access data-rowindex
            noteId = $(this).data('noteidsave'); // Access data-rowindex

        saveNoteToLocalStorage(noteId, rowIndex, notes[noteId]);
    });

    $(document).on('change', '.note-area', function (e) {

        let rowIndex = $(this).data('rowindex'), // Access data-rowindex
            noteId = $(this).data('noteid'); // Access data-rowindex
        handleNoteChange(rowIndex, e, noteId);
    });

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);

        return date.toLocaleString('en-US', {
            weekday: 'short',  // "Mon"
            month: 'short',     // "Mar"
            day: 'numeric',     // "3"
            hour: 'numeric',    // "3"
            minute: '2-digit',  // "45"
            hour12: true        // "PM" or "AM"
        }).replace(',', '');   // Remove extra comma
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
        let savedNotes = JSON.parse(localStorage.getItem('saved-notes-paint')) || {};

        // If the noteId doesn't exist in savedNotes, initialize it
        if (!savedNotes[noteId]) {
            savedNotes[noteId] = { noteId, date: Date.now() };
        }

        // If rowIndex doesn't exist for the noteId, initialize it as an empty array
        if (!savedNotes[noteId][rowIndex]) {
            savedNotes[noteId][rowIndex] = [];
        }

        // Ensure savedNotes[noteId][rowIndex] is an array before checking for duplicates
        if (Array.isArray(savedNotes[noteId][rowIndex])) {
            // Filter out any null values in the row to avoid errors
            savedNotes[noteId][rowIndex] = savedNotes[noteId][rowIndex].filter(note => note !== null);

            // Check if the newNote already exists in the row (only if newNote is valid)
            if (newNote && newNote.noteId) {
                const noteExists = savedNotes[noteId][rowIndex].some(note => note.noteId === newNote.noteId && note.date === newNote.date);

                // If the note doesn't exist, add it
                if (!noteExists) {
                    savedNotes[noteId][rowIndex].push(newNote);
                    localStorage.setItem('saved-notes-paint', JSON.stringify(savedNotes));

                    /* TODO make sure spMethod only works when localstorage is not blank */
                    spMethod.handleSubmit(noteId,JSON.stringify(savedNotes), 'paint','NOTES').then(e => console.log(e)).catch(err => console.log(err));            
                    setSavedNotes(savedNotes); // Update state to re-render with the latest saved notes
                }
            } else {
                console.error('Invalid newNote object', newNote);
            }
        } else {
            console.error(`Expected an array for savedNotes[${noteId}][${rowIndex}], but found:`, savedNotes[noteId][rowIndex]);
        }
    };

    const handleQuantityChange = (rowIndex, value) => {
        setQuantities({ ...quantities, [rowIndex]: value });
    };

    const handleFileUpload = (event) => {
        let file = event.target.files[0];
        if (!file) return;

        let reader = new FileReader();
        reader.onload = (e) => {
            try {
                let workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                let firstSheet = workbook.SheetNames[0];
                setSheetName(firstSheet);
                let worksheet = workbook.Sheets[firstSheet];
                let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                setData(jsonData);
            } catch (error) {
                console.error('Error reading file:', error);
                alert('Failed to load Excel file. Please check the file format.');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const saveFile = () => {
        try {
            let ws = XLSX.utils.aoa_to_sheet(dataLifted);
            let wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            XLSX.writeFile(wb, 'Paint_Open_This_Lastest_File.xlsx');
        } catch (error) {
            console.error('Error saving file:', error);
            alert('Failed to save file.');
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(searchQueryIn);
    };

    const handleNewRecordChange = (e, field) => {

        setNewRecord({ ...newRecord, [field]: e.target.value });

    };

    const addNewRecord = () => {
        if (headers.length === 0) return;

        const newRow = headers.map(header => newRecord[header] || '');

        setData([...dataLifted, newRow]);
        setNewRecord({});
        setIsModalOpen(false);
        handleOpen();
    };

    const getPdfPath = (row) => {

        const pdfFolder = "img/";

        const pdfName = row[2],
            pdfName2 = row[5],
            pdfName3 = row[9]; // Extract value from columns 2, 5 

        const pdfFile = `${pdfFolder}${pdfName}.pdf`,
            pdfFile2 = `${pdfFolder}${pdfName2}.pdf`,
            pdfFile3 = `${pdfFolder}${pdfName3}.pdf`;
        // Check existence using Image object


        return [pdfFile, pdfFile2, pdfFile3];
    };

    const openPdfModal = (pdfFile) => {
        //setPdfPath(pdfFile);
        $('.ui.fullscreen.modal.pdf-viewer.paint').modal('show'); // Show the PDF modal
    };

    // Filter data based on search query
    const filteredData = dataLifted.filter(row => {
        return row.some(cell => {
            const cellValue = (cell || '').toString().trim().toLowerCase();
            return cellValue.includes(searchQueryLifted.toLowerCase().trim());
        });
    });

    // Get headers (titles) for data
    const headers = dataLifted[0] || [];

    const openNoteModal = () => {
        $('.ui.small.modal.note-viewer.paint').modal('show'); // Use jQuery to show the modal 
    }

    const openModal = () => {
        $('.addRecord.small.modal.paint').modal('show'); // Use jQuery to show the modal
    };

    const toggleMainPane = () => {

        setPickListActiveTab(true);

    }
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

    // Calculate completion percentage
    const calculateCompletion = (goal, progress) => {
        if (!goal || !progress) return 0;
        return Math.min((progress / goal) * 100, 100); // Ensure it doesn't go over 100%
    };

    const calculateRemaining = (goal, progress) => {
        if (!goal || !progress) return 0;
        return (goal - progress); // Ensure it doesn't go over 100%
    };

    console.log('paint Pane', departmentName, dataLifted);
    // This function would simulate the image existence check.
    // In practice, this would need to be an actual file existence check (e.g., API request or file system check).

    return React.createElement('div', { className: 'ui container grid ', style: { marginTop: '20px' } },

        // **Display each row in its own segment with name on top**
        React.createElement(displayPane,
            {
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
                chart
            }),



        // **Modal for adding new record**
        React.createElement('div', { className: 'ui small modal addRecord paint' },
            React.createElement('div', { className: 'header' }, 'Add New Record'),
            React.createElement('div', { className: 'content' },
                headers.map((header, index) =>
                    React.createElement('div', { key: index, className: 'ui input' },
                        React.createElement('input', {
                            className: 'new-record',
                            type: 'text',
                            placeholder: header,
                        })
                    )
                )
            ),
            React.createElement('div', { className: 'actions' },
                React.createElement('button', { className: 'ui button deny' }, 'Cancel'),
                React.createElement('button', {
                    className: 'ui primary button approve save-new-record-paint',
                }, 'Add')
            )
        ),

        // **Modal for viewing pdf**
        React.createElement('div', { className: 'ui fullscreen modal pdf-viewer paint' },
            React.createElement('div', { className: 'header' }, 'Drawing'),
            React.createElement(
                'div',
                { className: 'content' },

                // Tabs Menu
                React.createElement(
                    'div',
                    { className: 'ui top attached tabular menu' },
                    React.createElement(
                        'a',
                        { className: 'item active', 'data-tab': headers[2] },
                        headers[2]
                    ),
                    React.createElement(
                        'a',
                        { className: 'item', 'data-tab': headers[5] },
                        headers[5]
                    ),
                    React.createElement(
                        'a',
                        { className: 'item', 'data-tab': headers[9] },
                        headers[9]
                    )

                ),

                // Tab Content Wrapper
                React.createElement(
                    'div',
                    { className: 'ui bottom attached active tab segment', 'data-tab': headers[2] },
                    React.createElement('embed', {
                        id: 'pdf-embed',
                        src: pdfPath,
                        type: 'application/pdf',
                        width: '100%',
                        height: '600px',
                    })
                ),
                React.createElement(
                    'div',
                    { className: 'ui bottom attached tab segment', 'data-tab': headers[5] },
                    React.createElement('embed', {
                        id: 'pdf-embed',
                        src: pdfPath2,
                        type: 'application/pdf',
                        width: '100%',
                        height: '600px',
                    })
                ), React.createElement(
                    'div',
                    { className: 'ui bottom attached tab segment', 'data-tab': headers[9] },
                    React.createElement('embed', {
                        id: 'pdf-embed',
                        src: pdfPath3,
                        type: 'application/pdf',
                        width: '100%',
                        height: '600px',
                    })
                )
            )
        ),
        // **Modal for viewing notes**
        React.createElement('div', { className: 'ui small modal note-viewer paint' },

            React.createElement('div', { className: 'header' }, 'Notes'),

            React.createElement('div', { className: 'content' },

                // Tabs Menu
                React.createElement('div', { className: 'ui top attached tabular menu' },

                    React.createElement(
                        'a',
                        { className: 'item active', 'data-tab': 'current' },
                        'Current Notes'
                    ),
                    React.createElement(
                        'a',
                        { className: 'item', 'data-tab': 'saved' },
                        'Saved Notes'
                    ),
                ),

                // Tab Content Wrapper

                React.createElement('div', { className: `ui bottom attached  tab segment`, 'data-tab': 'current' },

                    dataLifted.map((row, rowIndex) =>
                        notePath === row[0] && React.createElement('div', { key: rowIndex, className: 'ui segment basic' },
                            React.createElement('h3', {}, `Model ${row[0]}`),
                            React.createElement('div', { className: 'ui comments' },
                                React.createElement('div', { className: 'comment' },
                                    React.createElement('div', { className: 'content' },
                                        React.createElement('a', { className: 'author' }, 'User'),
                                        React.createElement('div', { className: 'metadata' },
                                            React.createElement('div', { className: 'date' }, 'Just now')
                                        ),
                                        React.createElement('div', { className: 'text' },
                                            notes[row[0]] && notePath === notes[row[0]].noteId
                                                ? notes[row[0]][rowIndex] ?? 'No notes yet...'
                                                : 'No notes yet...'
                                        ),
                                        React.createElement('form', { className: 'ui reply form' },
                                            React.createElement('div', { className: 'field' },
                                                React.createElement('textarea', {
                                                    className: 'note-area',
                                                    placeholder: 'Enter your note...',
                                                    'data-rowIndex': rowIndex,
                                                    'data-noteId': row[0]
                                                })
                                            )
                                        ),
                                        React.createElement('div', { className: 'ui divider hidden' }),
                                        React.createElement('button', {
                                            className: 'ui primary labeled icon button save-note-paint',
                                            'data-rowIndexSave': rowIndex,
                                            'data-noteIdSave': row[0],
                                        },
                                            React.createElement('i', { className: 'icon edit' }),
                                            'Add Note'
                                        )
                                    )
                                )
                            )
                        )
                    )

                ),


                React.createElement('div', {
                    className: `ui bottom attached tab segment`,
                    'data-tab': 'saved',
                    style: { maxHeight: '300px', overflowY: 'auto' },  // Add these styles for scrolling
                },
                    Object.keys(savedNotes).map((noteId) => {
                        const note = savedNotes[noteId];
                        // Render header once per noteId
                        return noteId === notePath.toString() && React.createElement('div', {
                            key: noteId,
                            className: 'ui segment basic',
                        },
                            // Render the header only once per noteId, making it sticky
                            React.createElement('h3', {
                                style: { top: '0', backgroundColor: 'white', zIndex: 1, padding: '3% 0' } // Added sticky styles
                            }, `Saved Notes for Model ${noteId}`),
                            React.createElement('div', { className: 'ui comments' },
                                // For each rowIndex in this noteId, render the corresponding notes
                                Object.keys(note).map((rowIndex) => {
                                    // Skip 'noteId' and 'date' keys as these are not part of the notes
                                    if (rowIndex !== 'noteId' && rowIndex !== 'date') {
                                        return Array.isArray(note[rowIndex]) ?
                                            note[rowIndex].map((entry, index) =>
                                                React.createElement('div', {
                                                    key: index,
                                                    className: 'comment',
                                                },
                                                    React.createElement('div', { className: 'content' },
                                                        React.createElement('a', { className: 'author' }, 'User'),
                                                        React.createElement('div', { className: 'metadata' },
                                                            React.createElement('div', { className: 'date' }, formatTimestamp(entry.date)) // Assuming you have a function to format the timestamp
                                                        ),
                                                        React.createElement('div', { className: 'text' }, entry[rowIndex]) // Display the note
                                                    )
                                                )
                                            ) : null;
                                    }
                                })
                            )
                        );
                    })
                )


            )
        )



    );
}
export default PaintEditor;

