const { useState } = React;

// AddRecordModal component
const AddRecordModal = ({ isOpen, headers, onClose, onAddRecord, selectedDepartment }) =>{
    // Create state for each input value
    const [inputs, setInputs] = useState(
        headers.reduce((acc, header) => ({ ...acc, [header]: '' }), {})
    );

    // Handle input changes
    const handleInputChange = (e, header) => {
        setInputs({
            ...inputs,
            [header]: e.target.value,
        });
    };

    // Handle the 'Add' button click
    const handleAddRecord = () => {
        onAddRecord(inputs);  // Lift the state to the parent component
        onClose();  // Close the modal after adding the record
    };

    // Return the modal using React.createElement
    return isOpen ? React.createElement(
              'div',
              { className:` ui small modal addRecord ${selectedDepartment.toLowerCase()}` },
              React.createElement('div', { className: 'header' }, 'Add New Record Test'),
              React.createElement(
                  'div',
                  { className: 'content' },
                  headers.map((header, index) =>
                      React.createElement(
                          'div',
                          { key: index, className: 'ui input' },
                          React.createElement('input', {
                              className: 'new-record',
                              type: 'text',
                              placeholder: header,
                              value: inputs[header],  // bind input value to state
                              onChange: (e) => handleInputChange(e, header),
                          })
                      )
                  )
              ),
              React.createElement(
                  'div',
                  { className: 'actions' },
                  React.createElement(
                      'button',
                      {
                          className: 'ui button deny',
                          onClick: onClose,  // Close modal on cancel
                      },
                      'Cancel'
                  ),
                  React.createElement(
                      'button',
                      {
                          className: 'ui primary button approve save-new-record-paint',
                          onClick: handleAddRecord,  // Trigger adding record
                      },
                      'Add'
                  )
              )
          )
        : null;
}


export default AddRecordModal;
