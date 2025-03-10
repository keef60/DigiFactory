import React, { useState, useEffect } from 'react';

const NotesEditor = () => {
    const [data, setData] = useState([]);
    const [notes, setNotes] = useState({});
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        const savedNotes = JSON.parse(localStorage.getItem('notes')) || {};
        const savedQuantities = JSON.parse(localStorage.getItem('quantities')) || {};
        setNotes(savedNotes);
        setQuantities(savedQuantities);
    }, []);

    useEffect(() => {
        localStorage.setItem('notes', JSON.stringify(notes));
        localStorage.setItem('quantities', JSON.stringify(quantities));
    }, [notes, quantities]);

    const handleNoteChange = (rowIndex, value) => {
        setNotes({ ...notes, [rowIndex]: value });
    };

    const handleQuantityChange = (rowIndex, value) => {
        setQuantities({ ...quantities, [rowIndex]: value });
    };

    return (
        React.createElement('div', { className: 'ui container', style: { marginTop: '20px' } },
            React.createElement('div', { className: 'ui divided items' },
                data.map((row, rowIndex) =>
                    React.createElement('div', { key: rowIndex, className: 'ui segment' },
                        React.createElement('h3', {}, `Segment ${rowIndex + 1}`),
                        React.createElement('textarea', {
                            placeholder: 'Enter notes...',
                            value: notes[rowIndex] || '',
                            onChange: (e) => handleNoteChange(rowIndex, e.target.value)
                        }),
                        React.createElement('input', {
                            type: 'number',
                            placeholder: 'Quantity',
                            value: quantities[rowIndex] || '',
                            onChange: (e) => handleQuantityChange(rowIndex, e.target.value)
                        })
                    )
                )
            )
        )
    );
};

export default NotesEditor;
