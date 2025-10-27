
const OrderComments = ({ noteId, department, user, workOrderRef, selectedNumber }) => {
  const dpName = department === 'line' ? department + selectedNumber : department;

  const [savedNotes, setSavedNotes] = useState({ comments: [] });
  const [newNote, setNewNote] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyTexts, setReplyTexts] = useState({}); // local state for reply inputs
  useEffect(() => {
    const loadDraft = async () => {
      const savedDraft = await getSetting(`draft-${dpName}-${noteId}`);
      if (savedDraft) setNewNote(savedDraft);
    };
    loadDraft();
  }, [dpName, noteId]);

  useEffect(() => {
    const getNotes = async () => {
      try {
        const response = await main.fetchSharePointData('NOTES', dpName, false, '', '', true);
        if (response?.value?.length) {
          const rawNotes = response.value[0].fields?.[dpName];
          if (rawNotes) {
            const notesObj = JSON.parse(rawNotes);
            setSavedNotes(notesObj[noteId] || { comments: [] });
          } else {
            setSavedNotes({ comments: [] });
          }
        } else {
          setSavedNotes({ comments: [] });
        }
      } catch (err) {
        console.error('Error fetching notes:', err);
        setSavedNotes({ comments: [] });
      }
    };

    getNotes();
  }, [dpName, noteId]);

  const handleChange = async (e) => {
    const value = e.target.value;
    setNewNote(value);
    await saveSetting(`draft-${dpName}-${noteId}`, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) {
      alert('Please enter a comment.');
      return;
    }

    const commentToAdd = {
      noteId: `${noteId}-${Date.now()}`,
      date: Date.now(),
      dpName,
      uuid: generateUID(),
      text: newNote.trim(),
      author: user || 'Anonymous',
      workOrderRef,
      replies: [],
    };

    const updatedNotes = { ...savedNotes };
    updatedNotes.comments = [commentToAdd, ...(updatedNotes.comments || [])];

    const objectToSave = {
      [noteId]: {
        noteId,
        date: Date.now(),
        comments: updatedNotes.comments,
      },
    };

    try {
      await main.handleSubmit(noteId, objectToSave, dpName, 'NOTES');
      setSavedNotes(updatedNotes);
      setNewNote('');
      await saveSetting(`draft-${dpName}-${noteId}`, '');
      alert('Comment saved successfully!');
    } catch (error) {
      console.error('Error saving comment:', error);
      alert('There was an error saving the comment.');
    }
  };


  // Load reply draft for the currently replying comment
  useEffect(() => {
    if (replyingTo) {
      (async () => {
        const savedDraft = await getSetting(`draft-${dpName}-${noteId}-reply-${replyingTo}`);
        if (savedDraft) {
          setReplyTexts((prev) => ({ ...prev, [replyingTo]: savedDraft }));
        }
      })();
    }
  }, [replyingTo, dpName, noteId]);

  const handleReplyTextChange = async (commentId, value) => {
    setReplyTexts((prev) => ({ ...prev, [commentId]: value }));
    await saveSetting(`draft-${dpName}-${noteId}-reply-${commentId}`, value);
  };

  const clearReplyText = async (commentId) => {
    setReplyTexts((prev) => {
      const copy = { ...prev };
      delete copy[commentId];
      return copy;
    });
    await saveSetting(`draft-${dpName}-${noteId}-reply-${commentId}`, '');
  };

  const handleReplySubmit = async (e, parentNoteId) => {
    e.preventDefault();
    const currentReplyText = replyTexts[parentNoteId] || '';
    if (!currentReplyText.trim()) {
      alert('Reply cannot be empty.');
      return;
    }

    const newReply = {
      replyId: `reply-${Date.now()}`,
      date: Date.now(),
      author: user || 'Anonymous',
      text: currentReplyText.trim(),
    };

    const updatedNotes = { ...savedNotes };
    updatedNotes.comments = updatedNotes.comments.map((comment) => {
      if (comment.noteId === parentNoteId) {
        const updatedReplies = comment.replies ? [...comment.replies, newReply] : [newReply];
        return { ...comment, replies: updatedReplies };
      }
      return comment;
    });

    const objectToSave = {
      [noteId]: {
        noteId,
        date: Date.now(),
        comments: updatedNotes.comments,
      },
    };

    try {
      await main.handleSubmit(noteId, objectToSave, dpName, 'NOTES');
      setSavedNotes(updatedNotes);
      await clearReplyText(parentNoteId);
      setReplyingTo(null);
    } catch (error) {
      console.error('Error saving reply:', error);
      alert('There was an error saving the reply.');
    }
  };


  return (
    <div className="ui segments">
      {/* 🔹 New Comment Input */}
      <div className="ui segment">
        <form onSubmit={handleSubmit} className="ui reply form">
          <div className="field">
            <textarea
              placeholder="Type your comment here..."
              value={newNote}
              onChange={handleChange}
              rows="3"
            />
          </div>
          <button type="submit" className="ui black labeled submit icon button">
            <i className="icon edit" /> Save Comment
          </button>
        </form>
      </div>

      {/* 🔹 Comments Feed */}
      <div className="ui segment red" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <div className="ui connected feed">
          {savedNotes.comments.length > 0 ? (
            savedNotes.comments.map((comment) => (
              <div key={comment.noteId} className="event">
               
                <div className="content">
                  <div className="summary">
                    <a className="user">{comment.author || 'Anonymous'}</a>
                    <div className="date">{new Date(comment.date).toLocaleString()}</div>
                  </div>
                  <div className="extra text">{comment.text}</div>
                  <div className="meta">
                    <a className="like" onClick={() => setReplyingTo(comment.noteId)}>
                      <i className="reply icon"></i> Reply
                    </a>
                  </div>

                  {/* 🔹 Reply Form */}
                  {replyingTo === comment.noteId && (
                    <form
                      className="ui reply form"
                      onSubmit={(e) => handleReplySubmit(e, comment.noteId)}
                      style={{ marginTop: '1em' }}
                    >
                      <div className="field">
                        <textarea
                          placeholder="Write a reply..."
                          value={replyTexts[comment.noteId] || ''}
                          onChange={(e) => handleReplyTextChange(comment.noteId, e.target.value)}
                          rows="2"
                        />

                      </div>
                      <button type="submit" className="ui primary button">Submit Reply</button>
                      <button
                        type="button"
                        className="ui button"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                      >
                        Cancel
                      </button>
                    </form>
                  )}

                  {/* 🔹 Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ui feed" style={{ marginLeft: '2em', marginTop: '1em' }}>
                      {comment.replies.map((reply) => (
                        <div key={reply.replyId} className="event">
                          
                          <div className="content">
                            <div className="summary">
                              <a className="user">{reply.author || 'Anonymous'}</a>
                              <div className="date">{new Date(reply.date).toLocaleString()}</div>
                            </div>
                            <div className="extra text">{reply.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

