//Commit Update
const OrderDeatil = ({ data, imageSrc, user }) => {
    const item = data.fields;
    const label = is24HoursOld(item['Created']);

    // Safely parse DevNotes
    let devNotes = [];
    try {
        devNotes = JSON.parse(item['DevNotes'] || '[]');
    } catch (e) {
        devNotes = [];
    }

    // Filter DevNotes by ref === 'NOTES'
    const notesOnly = devNotes.filter(note => note.ref === 'NOTES');

    return (
        <>
            <div className="ui grid" style={{ padding: '2%' }}>
                <div className="row">
                    <div className="ui four wide column">
                        {imageSrc !== 'img/placeholder.jpg' ? (
                            <img
                                className="ui medium centered middle aligned rounded image"
                                src={imageSrc}
                            />
                        ) : (
                            <div className="ui placeholder">
                                <div className="image"></div>
                            </div>
                        )}
                    </div>

                    <div className="ui column ten wide">
                        {label.status && (
                            <div className={`ui basic label ${label.color}`}>
                                {label.message}
                            </div>
                        )}

                        <h2 className="ui header">
                            Work Order Reference: {item['WO']?.replace('WO - ', '')}
                        </h2>

                        <div className="ui two column grid">
                            <div className="row">
                                <div className="column">
                                    <strong>Product:</strong> [{item['Title']}] Power Washer
                                </div>
                                <div className="column">
                                    <strong>Quantity:</strong> {item['Quantity']} Unit(s)
                                </div>
                            </div>

                            <div className="row">
                                <div className="column">
                                    <strong>Bill of Materials:</strong> BOM for <a href="#">{item['Title']}</a>
                                </div>
                                <div className="column">
                                    <strong>Scheduled Start Date:</strong> {convertToDateFormat(item['Created'])}
                                </div>
                            </div>

                            <div className="row">
                                <div className="column">
                                    <strong>Source Document:</strong> WH/OUT/00014
                                </div>
                                <div className="column">
                                    <strong>Component Availability:</strong>
                                    <span className="ui mini label green basic">Available</span>
                                </div>
                            </div>

                            <div className="row">
                                <div className="column">
                                    <strong>Responsible Person:</strong> {user}
                                </div>
                                <div className="column">
                                    <strong>Deviations:</strong>
                                    <div className={`ui label ${item['DEV']?.includes('NONE') ? 'grey basic' : 'red'}`}>
                                        {item['DEV']}
                                    </div>

                                    {/* DEV Notes (ref === "NOTES") */}
                                    {notesOnly.length > 0 && (
                                        <div style={{ marginTop: '0.5em' }}>
                                            <strong>DEV Notes:</strong>
                                            <ul className="ui list">
                                                {notesOnly.map((note, index) => (
                                                    <li key={index}>{note.pid}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
