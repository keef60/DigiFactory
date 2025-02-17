const { useState, useEffect } = React;


const PackOutEditor = () => {
    const [data, setData] = useState([]);
    const [sheetName, setSheetName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [newRecord, setNewRecord] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imagePaths, setImagePaths] = useState({}); // Store image paths dynamically
    const [pdfPath, setPdfPath] = useState({});
    const [pdfPath2, setPdfPath2] = useState({});
    const [pdfPath3, setPdfPath3] = useState({});
    const [notePath, setNotePath] = useState({});
    const [notes, setNotes] = useState({});
    const [quantities, setQuantities] = useState({});
    const [activeTab, setActiveTab] = useState('current');
    const [savedNotes, setSavedNotes] = useState(JSON.parse(localStorage.getItem('saved-notes-packout')) || {});
    const [visible, setVisible] = useState(false);
    const [goal, setGoal] = useState(JSON.parse(localStorage.getItem(`goalProgress-packout-${notePath}`))?.goal);
    const [progress, setProgress] = useState(JSON.parse(localStorage.getItem(`goalProgress-packout-${notePath}`))?.progress);
    const[workingThisRow,setWorkingThisRow]= useState('')
    const handleClose = () => {
      setVisible(false);
    };

    const handleOpen = () => {
        setVisible(true);
  
      };
      
      useEffect(() => {
        // Access the item of the `data` array (row is `data[i]`)
        const row = data[workingThisRow];  // `row` is now referring to `data[i]`
        const storedData = JSON.parse(localStorage.getItem(`goalProgress-packout-${row?.id}`)); // Assuming `row.id` is unique
        if (storedData) {
          setGoal(storedData.goal);
          setProgress(storedData.progress);
        }
      }, [data,workingThisRow,goal,progress]);  // Depend on `data` to load data when `data` changes

    useEffect(() => {
        localStorage.setItem('saved-notes-packout', JSON.stringify(savedNotes));
    }, [savedNotes]); // This will update localStorage whenever savedNotes changes

    $(document).on('click','.icon.close',()=>{
        handleClose();
    })

    useEffect(() => {
        $('.menu .item').tab();
        $('.ui .item').tab();
        $('.ui.dropdown').dropdown(); // Initialize Semantic UI dropdown
        $('.ui.progress').progress();
 
    }, []);

    useEffect(() => {
        localStorage.setItem('notes-packout', JSON.stringify(notes));
        //localStorage.setItem('quantities', JSON.stringify(quantities));
    }, [notes, quantities]);

    useEffect(() => {

        const fetchImages = async () => {
            const imageMap = {};
            await Promise.all(
                data.map(async (row) => {
                    const path = await getImagePath(row);
                    imageMap[row[1]] = path; // Store path using a unique identifier
                })
            );
            setImagePaths(imageMap);
        };

        if (data.length > 0) {
            fetchImages();
        }
    }, [data]);

    $(document).on('click', '.save-new-record', function () {

        addNewRecord();
    });

    useEffect(() => {

        $(document).on('change', '.new-record', function (e) {
            handleNewRecordChange(e, e.target.placeholder);
        });
    }, [newRecord]);

    $(document).on('click', '.save-note', function (e) {
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
        let savedNotes = JSON.parse(localStorage.getItem('saved-notes-packout')) || {};

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
                    localStorage.setItem('saved-notes-packout', JSON.stringify(savedNotes));
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
            let ws = XLSX.utils.aoa_to_sheet(data);
            let wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            XLSX.writeFile(wb, 'PackOut_Open_This_Lastest_File.xlsx');
        } catch (error) {
            console.error('Error saving file:', error);
            alert('Failed to save file.');
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };
 
    const handleNewRecordChange = (e, field) => {
     
        setNewRecord({ ...newRecord, [field]: e.target.value });
   
    };

    const addNewRecord = () => {
        if (headers.length === 0) return;

        const newRow = headers.map(header => newRecord[header] || '');

        setData([...data, newRow]);
        setNewRecord({});
        setIsModalOpen(false);
        handleOpen();
    };

    const getPdfPath = (row) => {

        const pdfFolder = "img/packout/pdfs/";

        const pdfName = row[3] ==='No Packout Kit'? row[1] : row[3],
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
        $('.ui.fullscreen.modal.pdf-viewer.packout').modal('show'); // Show the PDF modal
    };

    // Filter data based on search query
    const filteredData = data.filter(row => {
        return row.some(cell => {
            const cellValue = (cell || '').toString().trim().toLowerCase();
            return cellValue.includes(searchQuery.toLowerCase().trim());
        });
    });

    // Get headers (titles) for data
    const headers = data[0] || [];

    const openNoteModal = () => {
        $('.ui.small.modal.note-viewer.packout').modal('show'); // Use jQuery to show the modal 
    }

    const openModal = () => {
        $('.addRecord.small.modal.packout').modal('show'); // Use jQuery to show the modal
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
        const imageName = row[1];
        const extensions = ['jpg', 'jpeg', 'png', 'gif', 'avif', 'webp'];

        for (let ext of extensions) {
            const path = `img/packout/${imageName}.${ext}`;
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

  const  calculateRemaining   = (goal, progress) => {
    if (!goal || !progress) return 0;
    return (goal-progress); // Ensure it doesn't go over 100%
  };
    // This function would simulate the image existence check.
    // In practice, this would need to be an actual file existence check (e.g., API request or file system check).

    return React.createElement('div', { className: 'ui container grid ', style: { marginTop: '20px' } },
      
        // **Top Menu Bar**
        React.createElement('div', { className: 'ui top attached menu ', 
            style: {width:'89%', position: 'sticky', top: 0, zIndex: 1000, background: 'white' } },

            // **Left Dropdown Menu**
            React.createElement('div', { className: 'ui dropdown icon item' },
                React.createElement('i', { className: 'wrench icon ' }),
                React.createElement('div', { className: 'menu' },

                    // File upload button
                    React.createElement('div', { className: 'item ui button' }, 'Open...',
                        React.createElement('input', {
                            type: 'file',
                            accept: '.xlsx, .xls',
                            onChange: handleFileUpload,
                        })
                    ),
                    React.createElement('div', { className: 'item', onClick: saveFile }, 'Save...'),
                    React.createElement('div', { className: 'divider' }),
                    React.createElement('div', { className: 'header ' }, 'Export'),
                    React.createElement('div', { className: 'item disabled' }, 'Share...')
                )
            ),

            // **New Record Tab**
            React.createElement('div', { className: 'ui item  ', onClick: openModal, style: { cursor: 'pointer' } },
                React.createElement('i', { className: 'plus icon grey' }), 'Add Record'
            ),

            visible ? React.createElement(
                'div',
                { className: 'ui icon message yellow compact small' },
                React.createElement(
                  'i',
                  {
                    className: 'close icon',
                    onClick: handleClose
                  }
                ),
                React.createElement('i', { className: 'warning circle icon' }),
                React.createElement(
                  'div',
                  { className: 'content' },
                  React.createElement('div', { className: 'header' }, 'Remember to save your data!'),
                  React.createElement('p', null, 'Your changes will be lost if you refresh the page without saving.'),
                  React.createElement(
                    'button',
                    {
                      className: 'ui button yellow',
                      onClick: saveFile,handleClose
                    },
                    'Save'
                  )
                )
              ) : null,

            // **Right Search Menu**
            React.createElement('div', { className: 'right menu' },
                React.createElement('div', { className: 'ui right aligned category search item' },
                    React.createElement('div', { className: 'ui transparent icon input' },
                        React.createElement('input', {
                            type: 'text',
                            placeholder: 'Search...',
                            value: searchQuery,
                            onChange: handleSearchChange,
                            className: 'prompt'
                        }),
                        React.createElement('i', { className: 'search link icon' })
                    ),
                    React.createElement('div', { className: 'results' })
                )
            )
        ),

        // **Display each row in its own segment with name on top**
        React.createElement('div', { className: 'ui divided items fourteen wide column' },
            filteredData.slice().map((row, rowIndex) =>
                React.createElement('div', { key: rowIndex, className: 'ui segment basic' },
                    React.createElement('div', { className: 'ui divider' }),
                    React.createElement('h1', { className: 'ui header' },
                        React.createElement('div', { className: 'ui ribbon label' }, ` ${headers[1]} ${row[1] || 'Unnamed'}`),
                    ),
                    React.createElement('div', { className: 'ui grid' },
                        React.createElement('div', { className: 'four wide column', style: { textAlign: 'center' } },
                            imagePaths[row[1]] && imagePaths[row[1]] !== 'img/default_image.jpg'
                                ? React.createElement('img', {
                                    className: 'ui fluid image',
                                    src: imagePaths[row[1]],
                                    alt: 'Loaded Image',
                                })
                                : React.createElement('div', { className: 'ui placeholder' }, // Placeholder for missing images
                                    React.createElement('div', { className: 'image' })
                                ),
                                React.createElement('div', { className: 'ui divider hidden' }) ,
                                React.createElement('div', { className: 'ui buttons' },
                                    React.createElement('button', {
                                        className: 'ui blue small button',
                                        onClick: async () => {
                                            const pdf = getPdfPath(row)[0],
                                            pdf2 = getPdfPath(row)[1],
                                            pdf3 = getPdfPath(row)[2];
                                            setPdfPath(pdf);
                                            setPdfPath2(pdf2);
                                            setPdfPath3(pdf3);
                                            if (pdf !== '') {
                                                openPdfModal(pdf, pdf2, pdf3);
                                            } else {
                                                alert('PDF not found.');
                                            }
                                        }
                                    }, 'Drawing'),
        
                                    React.createElement('button', {
                                        className: 'ui blue small button',
                                        onClick: async () => {
                                            setNotePath(row[1]);
                                            openNoteModal();
                                        }
                                    }, 'Notes')
                                ),

                                React.createElement('div', { className: 'ui divider ' }) ,
                                // New section for Goal and Progress input
                                React.createElement('div', { className: 'ui segment container grid'  },
                                    React.createElement('h3', {}, 'Set Goal and Progress'),
        
                                    // Goal Input
                                    React.createElement('div', { className: 'ui input sixteen wide column' },
                                        React.createElement('input', {
                                            type: 'number',
                                            placeholder: 'Set Goal (Total Quantity)',
                                            value: workingThisRow === row[1] ? goal : JSON.parse(localStorage.getItem(`goalProgress-packout-${row[1]}`))?.goal,
                                            onChange: (e) => { setWorkingThisRow(row[1]), setGoal(e.target.value); },
                                            onclick:()=> setWorkingThisRow(row[1]),
                                            min: '0'
                                        })
                                    ),
        
                                    // Progress Input
                                    React.createElement('div', { className: 'ui input sixteen wide column' },
                                        React.createElement('input', {
                                            type: 'number',
                                            placeholder: 'Current Progress',
                                            value: workingThisRow === row[1] ? progress : JSON.parse(localStorage.getItem(`goalProgress-packout-${row[1]}`))?.progress,
                                            onChange: (e) => { setWorkingThisRow(row[1]), setProgress(e.target.value); },
                                            onclick:()=> setWorkingThisRow(row[1]),
                                            min: '0'
                                        })
                                    ),
        
                                    // Progress Completion Bar
                                    React.createElement('div', { className: 'ui progress sixteen wide column active', },
                                        React.createElement('div', {
                                            className: 'bar green',
                                            style: { width: `${calculateCompletion(
                                                workingThisRow === row[1] ? goal : JSON.parse(localStorage.getItem(`goalProgress-packout-${row[1]}`))?.goal,
                                                workingThisRow === row[1] ? progress : JSON.parse(localStorage.getItem(`goalProgress-packout-${row[1]}`))?.progress
                                            )}%` }
                                        }),
                                        React.createElement('div', { className: 'label sixteen wide column' }, `Completion: ${Math.round(calculateCompletion(
                                            workingThisRow === row[1] ? goal : JSON.parse(localStorage.getItem(`goalProgress-packout-${row[1]}`))?.goal,
                                            workingThisRow === row[1] ? progress : JSON.parse(localStorage.getItem(`goalProgress-packout-${row[1]}`))?.progress
                                        ))}%`),
                                     
                                    ),  
                                    React.createElement('div', { className: 'label sixteen wide column' }, `Remaining: ${Math.round(calculateRemaining(
                                        workingThisRow === row[1] ? goal : JSON.parse(localStorage.getItem(`goalProgress-packout-${row[1]}`))?.goal,
                                        workingThisRow === row[1] ? progress : JSON.parse(localStorage.getItem(`goalProgress-packout-${row[1]}`))?.progress
                                    ))}`),
                                    React.createElement('div', { className: 'ui buttons sixteen wide column' },
                                    // Save Button
                                    React.createElement('button', {
                                        className: 'ui primary blue button  ',
                                        onClick: () => {
                                            // Save goal and progress to localStorage
                                            const data = { goal, progress };
                                            localStorage.setItem(`goalProgress-packout-${row[1]}`, JSON.stringify(data));
                                           
                                            alert('Goal and progress saved!');
                                        }
                                    }, 'Save'),
        
                                    // Reset Button
                                    React.createElement('button', {
                                        className: 'ui red small button   ',
                                        onClick: () => {
                                            setGoal('');
                                            setProgress('');
                                        }
                                    }, 'Reset'))
                                ),

                            ),

                           
                            React.createElement('div', { className: 'twelve wide column' },
                                React.createElement('table', { className: 'ui celled striped table' },
                                    React.createElement('tbody', null,
                                        // First row - Active Indicator if progress > 0
                                        calculateCompletion(
                                            workingThisRow === row[1] ? goal : JSON.parse(localStorage.getItem(`goalProgress-packout-${row[1]}`))?.goal,
                                            workingThisRow === row[1] ? progress : JSON.parse(localStorage.getItem(`goalProgress-packout-${row[1]}`))?.progress
                                        ) > 0 &&
                                        React.createElement('tr', null,
                                            React.createElement('td', { colSpan: 2, style: { textAlign: 'center' } },
                                                React.createElement('div', { className: 'ui label green', style: {  display: 'flex', alignItems: 'center', fontWeight: 'bold' } },
                                                    React.createElement('div', { className: 'dot', style: { width: '10px', height: '10px', backgroundColor: 'green', borderRadius: '50%', marginRight: '5px' } }),
                                                    'Active'
                                                )
                                            )
                                        ),
                            
                                        // Other rows from the headers
                                        headers.slice().map((header, colIndex) =>
                                            React.createElement('tr', { key: colIndex },
                                                React.createElement('td', { style: { fontWeight: 'bold' } }, header.charAt(0).toUpperCase()+ header.slice(1).toLowerCase() || 'Field'),
                                                React.createElement('td', null, row[colIndex] || 'N/A'),
                                            )
                                        )
                                    )
                                )
                            )
                            
                        )
                    )
                )
            ),       
        // **Modal for adding new record**
        React.createElement('div', { className: 'ui small modal addRecord packout' },
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
                    className: 'ui primary button approve save-new-record',
                }, 'Add')
            )
        ),
        // **Modal for viewing pdf**
        React.createElement('div', { className: 'ui fullscreen modal pdf-viewer packout ' },
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
                        'SPL'
                    ),
                    React.createElement(
                        'a',
                        { className: 'item disabled', 'data-tab': headers[5] },
                        headers[5]
                    ),
                    React.createElement(
                        'a',
                        { className: 'item disabled', 'data-tab': headers[9] },
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
                    { className: 'ui bottom attached tab segment disabled', 'data-tab': 'headers[5]' },
                    React.createElement('embed', {
                        id: 'pdf-embed',
                        src: pdfPath2,
                        type: 'application/pdf',
                        width: '100%',
                        height: '600px',
                    })
                ), React.createElement(
                    'div',
                    { className: 'ui bottom attached tab segment disabled', 'data-tab': 'headers[9]' },
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
        React.createElement('div', { className: 'ui small modal note-viewer packout' },
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
                    data.map((row, rowIndex) =>
                        notePath === row[1] && React.createElement('div', { key: rowIndex, className: 'ui segment basic' },
                            React.createElement('h3', {}, `Model ${row[1]}`),
                            React.createElement('div', { className: 'ui comments' },
                                React.createElement('div', { className: 'comment' },
                                    React.createElement('div', { className: 'content' },
                                        React.createElement('a', { className: 'author' }, 'User'),
                                        React.createElement('div', { className: 'metadata' },
                                            React.createElement('div', { className: 'date' }, 'Just now')
                                        ),
                                        React.createElement('div', { className: 'text' },
                                            notes[row[1]] && notePath === notes[row[1]].noteId
                                                ? notes[row[1]][rowIndex] ?? 'No notes yet...'
                                                : 'No notes yet...'
                                        ),
                                        React.createElement('form', { className: 'ui reply form' },
                                            React.createElement('div', { className: 'field' },
                                                React.createElement('textarea', {
                                                    className: 'note-area',
                                                    placeholder: 'Enter your note...',
                                                    'data-rowIndex': rowIndex,
                                                    'data-noteId': row[1]
                                                })
                                            )
                                        ),
                                        React.createElement('div', { className: 'ui divider hidden' }),
                                        React.createElement('button', {
                                            className: 'ui primary labeled icon button save-note',
                                            'data-rowIndexSave': rowIndex,
                                            'data-noteIdSave': row[1],
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
                                style: {top: '0', backgroundColor: 'white', zIndex: 1, padding: '3% 0' } // Added sticky styles
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
export default PackOutEditor;

