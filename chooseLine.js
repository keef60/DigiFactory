const { useState, useEffect } = React;

const LineSelection = (props) => {
    const {selectedNumber, setSelectedNumber}=props;
   
    // Options for the dropdown
    const options = [];
    const lineName = selectedNumber === null ?"Choose Line #" :`Line ${selectedNumber}`
    // Create number of lines options
    for (let i = 1; i <= 7; i++) {
        options.push({ key: i, text: `${i}`, value: i });
    }



    // Handler for dropdown change
    const handleDropdownChange = (value) => {
        setSelectedNumber(value); // Set selected value
    };


    return React.createElement(
        'div',
        { className: 'ui compact menu ',  }, // Main container for the menu
        React.createElement(
            'div',
            { className: 'ui simple dropdown  item right' }, // Dropdown container
            lineName , // Dropdown label
            React.createElement('i', { className: 'dropdown icon' }), // Dropdown icon
            React.createElement(
                'div',
                { className: 'menu' }, // Menu container for items
                options.map(option =>
                    React.createElement(
                        'div',
                        {
                            className: 'item',
                            key: option.key,
                            onClick: () => handleDropdownChange(option.value), // Handle item selection
                        },
                        option.text
                    )
                )
            )
        )
    );
};

export default LineSelection;
