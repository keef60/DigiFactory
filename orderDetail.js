const OrderDeatil = ({ data, imageSrc, user }) => {
    const item = data.fields;
    const label = is24HoursOld(item['Created']);

    return (<>
        <div class="ui grid" style={{ padding: '2%' }}>
            <div className="row">
                <div class="ui  four wide column ">
                    {
                        imageSrc !== 'img/placeholder.jpg' ?
                            <img class="ui medium centered middle aligned rounded image" src={imageSrc} /> :
                            <div class="ui placeholder">
                                <div class="image"></div>
                            </div>
                    }
                </div>
                <div className="ui   column ten wide">
                    {label.status && (
                        <div className={`ui basic label ${label.color}`}>
                            {label.message}
                        </div>
                    )}

                    <h2 className="ui header">
                        Work Order Reference: {item['WO'].replace('WO - ', '')}
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
                                <div className={`ui label ${item['DEV'].includes('NONE') ? 'grey basic' : 'red'}`}>
                                    {item['DEV']}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}