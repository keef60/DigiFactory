const QuantityMismatchNags = ({ quantityOffsets, activeTitle }) => {
    const [dismissed, setDismissed] = useState([]);

    const dismissNag = (id) => {
        setDismissed(prev => [...prev, id]);
    };

    if (!activeTitle || !quantityOffsets[activeTitle]) return null;

    const mismatches = quantityOffsets[activeTitle]
        .map((mismatch, index) => ({
            id: `${activeTitle}-${mismatch.partNumber}-${index}`,
            title: activeTitle,
            ...mismatch
        }))
        .filter((mismatch) => !dismissed.includes(mismatch.id));

    if (mismatches.length === 0) return null;

    return (
        <div className="ui nags" style={{ marginBottom: '1em' }}>
            {mismatches.map(({ id, partNumber, expectedQty, actualQty }) => (
                <div key={id} className="ui nag red" style={{ display: 'block' }}>
                    <div className="title">
                        <strong>{activeTitle}</strong> — <code>{partNumber}</code>: expected <strong>{expectedQty}</strong>, picked <strong>{actualQty}</strong>
                    </div>
                    <i className="close icon" onClick={() => dismissNag(id)} />
                </div>
            ))}
        </div>
    );
};
