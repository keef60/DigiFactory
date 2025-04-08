const OrderDeatil = ({ data, imageSrc }) => {
    const item = data.fields;
    const label = is24HoursOld(item['Created']);

    return (<>
        <div class="ui horizontal segments">

            <div class="ui  padded segment">
                {
                    imageSrc !== 'img/placeholder.jpg' ?
                        <img class="ui medium rounded image" src={imageSrc} /> :
                        <div class="ui placeholder">
                            <div class="image"></div>
                        </div>
                }
            </div>
            <div class="ui very padded segment">
                {label.status && <div class={`ui label basic ${label.color}`}>{label.message}</div>}
                <h1 class="ui header ">WO Reference: {item['WO'].replace('WO - ', '')}</h1>

                <div class="ui four column grid">
                    <div class="row">

                        <p class='column'><strong>Product:</strong> [{item['Title']}] Power Washer</p>
                        <p class='column'><strong>Quantity: {item['Quantity']} Unit(s) </strong></p>
                        <p class='column'><strong>Bill of Material:</strong> BOM for <a href=''>[{item['Title']}]</a></p>
                        <p class='column'><strong>Scheduled Date:</strong> {convertToDateFormat(item['Created'])}</p>
                    </div>
                </div>
                <div class="ui four column grid">
                    <div class="row">
                        <p class='column'><strong>Source Document:</strong> WH/OUT/00014</p>
                        <p class='column'><strong>Component Availability:</strong> <p class='ui mini label green'>Available</p></p>
                        <p class='column'><strong>Responsible:</strong> Mitchell Admin</p>
                        <p class='column'><strong>Deviations:</strong>
                            <div
                                className={`ui label  ${item['DEV'].includes('NONE') ? 'grey basic' : 'red'
                                    }`}
                            >
                                <p className="ui text">
                                    {item['DEV']} {/* Displays any work order deviations, if present */}
                                </p>
                            </div>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}