const OrderPartsList = ({ itemData, inventoryRef }) => {
    const [data, setData] = useState({});

    const rows = [];
    const maxLength = Math.max(...Object.values(data).map(arr => arr.length || 0));

    for (let i = 0; i < maxLength; i++) {
        const row = {};
        delete data['Pugatory'];
        delete data['SAGE'];
        delete data['Rplnshmnt Pos'];
        Object.keys(data).forEach(key => {
            row[key] = data[key][i] || '';
        });
        rows.push(row);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const d = JSON.parse(inventoryRef.value[1].fields['inventory']);
                setData(d);
            } catch (err) {
                console.error('Error parsing inventory:', err);
            }
        };
        fetchData();
    }, [inventoryRef]);

    // Parse DevNotes
    let devNotes = [];
    try {
        devNotes = JSON.parse(itemData.fields.DevNotes || '[]');
    } catch (err) {
        console.error('Error parsing DevNotes:', err);
    }

    // Only keep DevNotes with ref !== "NOTES"
    const actionableDevNotes = devNotes.filter(note => note.ref !== 'NOTES');

    const createTable = (matchingDescription, matchingUom, matchingQtyToPick, pn) => {
        // Check if this part ref matches any DevNote ref
        const devNoteMatch = actionableDevNotes.find(note => note.ref === pn.ref);
        const highlightClass = devNoteMatch ? 'warning' : ''; // Semantic UI class for yellow

        return (
            <tbody key={pn.ref}>
                <tr className={highlightClass}>
                    <td>
                        {devNoteMatch ? devNoteMatch.pid : ''}
                    </td>
                    <td>{pn.pid}</td>
                    <td>{matchingDescription ? matchingDescription.pid : 'No description available'}</td>
                    {/* <td>
                        {rows.length === 0 ? (
                            <div className="ui active inline loader"></div>
                        ) : (
                            (() => {
                                const item = rows.find(entry => entry.Item === pn.pid);
                                return item ? item["Qty Avail"] : <span className="ui red text">No data found</span>;
                            })()
                        )}
                    </td>
                    New DevNote column */}

                </tr>
            </tbody>
        );
    };

    const displaySharePointData = (item) => {
        const fields = item.fields;
        const partNumber = JSON.parse(fields.PartNumber);
        const partDescription = JSON.parse(fields.PartDescription);
        const partUom = JSON.parse(fields.UOM);
        const partQtyToPick = JSON.parse(fields['QtyToPick']);

        return (
            <table className='ui celled table fixed stripped selectable'>
                <thead>
                    <tr>
                        <th>Deviation</th>
                        <th>Part Number</th>
                        <th>Description</th>
                        {/*  <th>On Hand</th>  */}

                    </tr>
                </thead>
                {partNumber.map(pn => {
                    const matchingDescription = partDescription.find(pd => pd.ref === pn.ref);
                    const matchingQtyToPick = partQtyToPick.find(qtp => qtp.ref === pn.ref);
                    const matchingUom = partUom.find(uom => uom.ref === pn.ref);

                    return createTable(matchingDescription, matchingUom, matchingQtyToPick, pn);
                })}
            </table>
        );
    };

    return (
        <div>
            {itemData ? (
                displaySharePointData(itemData)
            ) : (
                <p>No items found in the list.</p>
            )}
        </div>
    );
};
