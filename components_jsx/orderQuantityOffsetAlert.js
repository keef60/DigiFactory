//Commit Update
const QuantityMismatchNags = ({ quantityOffsets, activeTitle, departmentName, selectedNumber }) => {
    const [dismissed, setDismissed] = useState([]);

    useEffect(()=>{setDismissed([])},[quantityOffsets, activeTitle, departmentName, selectedNumber]);

    const dismissNag = (id) => {
        setDismissed(prev => [...prev, id]);
    };

    if (!activeTitle) return null;
    console.log("quantityOffsets: ", quantityOffsets)

    // 🔍 Collect mismatches for this item title across all lists
    const mismatches = Object.entries(quantityOffsets)
        .flatMap(([listName, itemMap]) => {
            const itemMismatches = itemMap[activeTitle];
            if (!itemMismatches) return [];

            return itemMismatches.map((mismatch, index) => ({
                id: `${listName}-${activeTitle}-${mismatch.partNumber}-${index}`,
                listName,
                title: activeTitle,
                ...mismatch
            }));
        })
        .filter((mismatch) => !dismissed.includes(mismatch.id));

    if (mismatches.length === 0) return null;

    return (
        <div className="ui nags" style={{ marginBottom: '1em' }}>
            {mismatches.map(({ id, listName, department, partNumber, expectedQty, actualQty }) => (
                <div key={id} className="ui nag red" style={{ display: 'block' }}>
                    <div className="title">
                        <strong>{listName}: {activeTitle} ({department})</strong> — <code>{partNumber}</code>: expected <strong>{expectedQty}</strong>, picked <strong>{actualQty}</strong>
                    </div>
                    <i className="close icon" onClick={() => dismissNag(id)} />
                </div>
            ))}
        </div>
    );
};
