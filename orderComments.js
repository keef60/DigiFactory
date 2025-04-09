const OrderComments = ({ noteId, department,user,workOrderRef }) => {
  const updatedNotes= useRef(department);
  const [newNote, setNewNote] = useState('');
  const [savedNotes, setSavedNotes] = useState(() => {
    const savedData = JSON.parse(localStorage.getItem(`saved-notes-${department}`));
    return savedData ? savedData : {};
  });

  useEffect(() => {
    if(updatedNotes.current !== department){
      setSavedNotes(() => {
        const savedData = JSON.parse(localStorage.getItem(`saved-notes-${department}`));
        return savedData ? savedData : {};
      })
    }
  }, [newNote,department]);

  const handleChange = (e) => {
    setNewNote(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newNote.trim()) {
      alert('Please enter a comment.');
      return;
    }

    const noteToSave = {
      noteId: `${noteId}-${Date.now()}`,
      date: Date.now(),
      department,
      uuid: generateUID(),
      text: newNote,
      author:user,
      workOrderRef
    };

    saveNoteToLocalStorage(noteId, noteToSave);
    setNewNote('');
  };

  const saveNoteToLocalStorage = (noteId, newNote) => {
    let saveNotes = JSON.parse(localStorage.getItem(`saved-notes-${department}`)) || {};

    if (!saveNotes[noteId]) saveNotes[noteId] = { noteId, date: Date.now() };
    if (!saveNotes[noteId]['comments']) saveNotes[noteId]['comments'] = [];

    if (Array.isArray(saveNotes[noteId]['comments'])) {
      if (newNote && newNote.noteId) {
        const noteExists = saveNotes[noteId]['comments'].find(
          (note) => note.noteId === newNote.noteId && note.date === newNote.date
        );
        if (!noteExists) {
          saveNotes[noteId]['comments'].push(newNote);
          localStorage.setItem(`saved-notes-${department}`, JSON.stringify(saveNotes));

          main.handleSubmit(noteId, JSON.stringify(saveNotes), `${department}`, 'NOTES')
            .then(() => {
              // Show success message when submission completes successfully
              alert('Comment saved successfully!');
            })
            .catch((err) => {
              console.error('Error saving comment:', err);
              alert('There was an error saving the comment.');
            });

          setSavedNotes(saveNotes);
        }
      } else {
        console.error('Invalid newNote object', newNote);
      }
    } else {
      console.error(`Expected an array for savedNotes[${noteId}]['comments'], but found:`, saveNotes[noteId]['comments']);
    }
  };

  return (
    <div className="ui minimal comments " >
      <div className="ui segments horizontal ">
      {/* Add a comment form */}
      <div className='ui segment '
    
      >
        <form onSubmit={handleSubmit} className="ui reply form">
          <div className="field">
            <textarea
              placeholder="Type your comment here..."
              value={newNote}
              onChange={handleChange}
              rows="3"
            />
          </div>
          <button type="submit" className="ui blue labeled submit icon button">
            <i className="icon edit"></i> Save Comment
          </button>
        </form>
      </div>

      {/* List of comments */}
      <div className="comments-list ui segment "
      style={{ maxHeight: '300px', overflowY: 'auto' }}
      >
        {savedNotes[noteId] && savedNotes[noteId]['comments'] && savedNotes[noteId]['comments'].map((comment) => (
          <div key={comment.noteId} className="comment">
            <div className="content">
              <a className="author">{comment.author || 'Anonymous'}</a>
              <div className="metadata">
                <span className="date">{new Date(comment.date).toLocaleString()}</span>
              </div>
              <div className="text">{comment.text}</div>
              <div className="actions">
                <a className="reply">Reply</a>
              </div>
            </div>

            {/* Replies (nested comments) */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="comments">
                {comment.replies.map((reply) => (
                  <div key={reply.replyId} className="comment">
                    <a className="avatar">
                      <img src="/images/avatar/small/jenny.jpg" alt="avatar" />
                    </a>
                    <div className="content">
                      <a className="author">{reply.author || 'Anonymous'}</a>
                      <div className="metadata">
                        <span className="date">{new Date(reply.date).toLocaleString()}</span>
                      </div>
                      <div className="text">{reply.text}</div>
                      <div className="actions">
                        <a className="reply">Reply</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};
