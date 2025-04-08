const OrderPartsList = ({
    itemData }) => {
    const createTable = (matchingDescription, matchingUom, matchingQtyToPick, pn) => {
        return (
            <tbody key={pn.ref}>
                <tr>
                    <td>{pn.pid}</td>
                    <td>{matchingDescription ? matchingDescription.pid : 'No description available'}</td>
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
            <table className='ui celled table fixed striped'>
                <thead>
                    <tr>
                        <th>Part Number</th>
                        <th>Description</th>
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


