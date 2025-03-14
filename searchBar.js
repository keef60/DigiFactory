const { useState, useEffect } = React;

const TopMenuBar = ({ 
  searchQuery, 
  setSearchQuery,
   visible, 
   setVisible,
   setData,
   setSheetName,
   selectedDepartment,
   saveFile,
   
  }) => {



  // Handlers for file upload and saving
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

            console.log(jsonData)
            setData(jsonData);
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Failed to load Excel file. Please check the file format.');
        }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleClose = () => {
    setVisible(false);
  };

  const openModal = () => {
    $(`.addRecord.small.modal.${selectedDepartment.toLowerCase()}`).modal('show');
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return React.createElement(
    'div',
    {
      className: 'ui top attached menu   ',
      style: { position: 'sticky', top: 0, zIndex: 1000, background: 'white' },
    },
    React.createElement('div', { className: 'item' },
      React.createElement('img', { className: '', src: 'img/logo.jpg', alt: 'Logo' }),
      React.createElement('span', {style:{width:'143px'}} )
    ),
    // **Left Dropdown Menu**
    React.createElement(
      'div',
      { className: 'ui dropdown icon item' },
      React.createElement('i', { className: 'bars icon' }),
      React.createElement(
        'div',
        { className: 'menu' },

        // File upload button
        React.createElement(
          'div',
          { className: 'item ui button' },
          'Open...',
          React.createElement('input', {
            type: 'file',
            accept: '.xlsx, .xls',
            onChange: handleFileUpload,
          })
        ),
        React.createElement('div', { className: 'item', onClick: saveFile }, 'Save...'),
        React.createElement('div', { className: 'divider' }),
        React.createElement('div', { className: 'header' }, 'Export'),
        React.createElement('div', { className: 'item disabled' }, 'Share...')
      )
    ),

    // **New Record Tab**
   selectedDepartment =='Paint' && React.createElement(
      'div',
      { className: 'ui item', onClick: openModal, style: { cursor: 'pointer' } },
      React.createElement('i', { className: 'plus icon grey' }),
      'Add Record'
    ),

    // **Save Warning Message**
    visible
      ? React.createElement(
          'div',
          { className: 'ui icon message yellow compact small' },
          React.createElement('i', { className: 'close icon', onClick: handleClose }),
          React.createElement('i', { className: 'warning circle icon' }),
          React.createElement(
            'div',
            { className: 'content' },
            React.createElement('div', { className: 'header' }, 'Remember to save your data!'),
            React.createElement(
              'p',
              null,
              'Your changes will be lost if you refresh the page without saving.'
            ),
            React.createElement(
              'button',
              {
                className: 'ui button yellow',
                onClick: () => {
                  saveFile();
                  handleClose();
                },
              },
              'Save'
            )
          )
        )
      : null,

    // **Right Search Menu**
    React.createElement(
      'div',
      { className: '  menu right ' ,},
      React.createElement(
        'div',
        { className: 'ui   category search item',style:{width:"300px"} },
        React.createElement(
          'div',
          { className: 'ui  icon input ' },
          React.createElement('input', {
            type: 'text',
            placeholder: 'Search...',
            value: searchQuery,
            onChange: handleSearchChange,
            className: 'prompt',
          }),
          React.createElement('i', { className: 'search link icon' })
        ),
        React.createElement('div', { className: 'results' })
      )
    )
  );
};

export default TopMenuBar;
