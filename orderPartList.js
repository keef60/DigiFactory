const OrderPartsList = ({
    itemData, inventoryRef }) => {

    // Inventory data
    const [data, setData] = useState({});

    // Convert the data to an array of rows, where each row is a position from all keys
    const rows = [];
    const maxLength = Math.max(...Object.values(data).map(arr => arr.length));

    for (let i = 0; i < maxLength; i++) {
        const row = {};
        delete data['Pugatory'];
        delete data['SAGE'];
        delete data['Rplnshmnt Pos'];
        Object.keys(data).forEach(key => {
            row[key] = data[key][i] || '';  // Handle if the array length is different for keys
        });
        rows.push(row);
    }


    useEffect(() => {
        const fetchData = async () => {
            try {
                const d = JSON.parse(inventoryRef.value[1].fields['inventory']);
                setData(d);
            } catch (err) {
                console.log(err);
            }
        };

        fetchData();
    }, [inventoryRef]); // Dependencies added for re-fetching when they change

    const createTable = (matchingDescription, matchingUom, matchingQtyToPick, pn) => {
        return (
            <tbody key={pn.ref}>
                <tr>
                    <td>{pn.pid}</td>
                    <td>{matchingDescription ? matchingDescription.pid : 'No description available'}</td>
                    <td>
                        {rows.length === 0 ? (
                            <div className="ui active inline loader"></div>
                        ) : (
                            (() => {
                                const item = rows.find(entry => entry.Item === pn.pid);
                                return item ? item["Qty Avail"] : <span className="ui red text">No data found</span>;
                            })()
                        )}
                    </td>

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
                        <th>Part Number</th>
                        <th>Description</th>
                        <th>On Hand</th>
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
                <p>No items found in the list.
                    {displaySharePointData([])}
                </p>
            )}
        </div>
    );

};


