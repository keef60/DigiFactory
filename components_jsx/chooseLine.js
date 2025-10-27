//Commit Update
const LineSelectionNew = ({ selectedNumber, setSelectedNumber }) => {


    useEffect(()=>{
        $('.ui.simple.dropdown.item').dropdown()
    })
    // Options for the dropdown
    const options = [];
    const lineName = selectedNumber === null ? "Assign a Line #" : `Line ${selectedNumber}`;
    
    // Create number of lines options
    for (let i = 1; i <= 7; i++) {
        options.push({ key: i, text: `${i}`, value: i });
    }

    // Handler for dropdown change
    const handleDropdownChange = (value) => {
        setSelectedNumber(value); // Set selected value
    };

    return (
        <div className="ui  item">
            <div className="ui simple dropdown item ">
                {lineName} {/* Dropdown label */}
                <i className="dropdown icon" /> {/* Dropdown icon */}
                <div className="menu">
                    {options.map(option => (
                        <div
                            className="item"
                            key={option.key}
                            onClick={() => handleDropdownChange(option.value)} // Handle item selection
                        >
                            {option.text}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


