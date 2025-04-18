const OrderPickList = ({
    selectedDepartment,
    departmentName,
    selectedNumber,
    clearLoading,
    setWOnDev,
    setReload
}) => {

    const [accessToken, setAccessToken] = useState(null);
    const [error, setError] = useState(null);
    const [assginedLineNumber, setAssginedLineNumber] = useState();
    const [sharePointData, setSharePointData] = useState([]);
    const [tokenInput, setTokenInput] = useState('');
    const [imagePaths, setImagePaths] = useState({});
    const [postName, setPostName] = useState('');
    const [siteID, setSiteID] = useState('');
    const [confirmPickList, setConfirmedPickList] = useState(true);
    const [rowData, setRowDataIn] = useState({});
    const [sharepointDbEntry, setSharepointDbEntry] = useState();
    const dpName = departmentName === 'line' ? departmentName + selectedNumber : departmentName;


    const checkImageExists = async (url) => {
        const img = new Image();
        img.src = url;

        return new Promise((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
        });
    };

    const getImagePath = async (imageName) => {
        const extensions = ['jpg', 'jpeg', 'png', 'gif', 'avif', 'webp'];
        for (let ext of extensions) {
            const path = departmentName === 'packout' ? `img/packout/${imageName}.${ext}` : `img/${imageName}.${ext}`;
            if (await checkImageExists(path)) {
                return path;
            }
        }
        return 'img/placeholder.jpg';
    };

    const fetchSharePointData = async (token) => {
        if (!token) {
            setError('No valid access token provided. Please input a valid token.');
            return;
        }

        const siteUrl = 'fnagroup.sharepoint.com';
        const sitePath = '/sites/LineSupport';

        try {
            const siteResponse = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteUrl}:${sitePath}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!siteResponse.ok) {
                const errorData = await siteResponse.json();
                throw new Error(`Failed to fetch site data: ${errorData.error.message}`);
            }

            const siteData = await siteResponse.json();
            const siteId = siteData.id;

            if (!siteId) {
                throw new Error('Unable to get site ID');
            }

            const listsResponse = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!listsResponse.ok) {
                const errorData = await listsResponse.json();
                throw new Error(`Failed to fetch lists: ${errorData.error.message}`);
            }

            const listsData = await listsResponse.json();
            const list = listsData.value.find(l => l.name === selectedDepartment);
            const pId = listsData.value.filter(e => e.displayName === 'PICKLIST')[0].id;
            setPostName(pId);
            setSiteID(siteId);

            if (!list) {
                throw new Error(`Unable to find the ${selectedDepartment} list`);
            }

            const listId = list.id;

            const itemsResponse = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items?$expand=fields`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!itemsResponse.ok) {
                const errorData = await itemsResponse.json();
                throw new Error(`Failed to fetch list items: ${errorData.error.message}`);
            }

            const itemsData = await itemsResponse.json();
            setSharePointData(itemsData.value);

            setWOnDev(itemsData.value);
            setError(null);

            const fetchImages = async () => {
                const imageMap = {};
                await Promise.all(
                    itemsData.value.map(async (item) => {
                        const imagePath = await getImagePath(item.fields.Title);
                        imageMap[item.fields.Title] = imagePath;
                    })
                );
                setImagePaths(imageMap);
            };

            fetchImages();
        } catch (err) {
            setError('Error fetching SharePoint data: ' + err.message);
            console.error(err);
        }
    };

    useEffect(() => {

        const storedToken = sessionStorage.getItem('access_token');
        if (storedToken) {
            setAccessToken(storedToken);
            fetchSharePointData(storedToken);
        }
    }, [selectedDepartment]);

    const getLocalJSON = (modelIn) => {
        let data;
        Object.keys(localStorage).forEach(key => {
            const departmentBool = key.split('-')[1] === departmentName;
            const modelBool = String(key.split('-')[2]) === String(modelIn);
            if (departmentBool && modelBool) {
                data = localStorage.getItem(key);
            }
        });

        return data;
    }

    const handleSubmit = async (modelNumber) => {

        const sendData = getLocalJSON(modelNumber);
        main.handleSubmit(modelNumber, sharepointDbEntry, dpName, 'REPORTS')
            .then(e => console.log('New Json Created'))
            .catch(err => console.warn("Function Error handleSubmit in orderPickList.js", err))

        setConfirmedPickList(false);
        const delFieldData = JSON.stringify(rowData);

        const itemsUrl = `https://graph.microsoft.com/v1.0/sites/${siteID}/lists/${postName}/items?$filter=fields/Title eq '${modelNumber}'&$expand=fields`;
        const sharePointColumnName = selectedNumber ? departmentName + selectedNumber : departmentName;
        const headers = {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Prefer": "HonorNonIndexedQueriesWarningMayFailRandomly",
        };

        try {
            const itemsResponse = await fetch(itemsUrl, {
                method: 'GET',
                headers: headers,
            });

            if (!itemsResponse.ok) {
                const errorData = await itemsResponse.json();
                throw new Error(`Failed to fetch list items: ${errorData.error.message}`);
            }

            const itemsData = await itemsResponse.json();

            if (itemsData.value.length > 0) {
                const itemId = itemsData.value[0].id;
                const updateUrl = `https://graph.microsoft.com/v1.0/sites/${siteID}/lists/${postName}/items/${itemId}`;

                const updateBody = {
                    fields: {
                        Title: modelNumber,
                        [sharePointColumnName]: delFieldData,
                    },
                };

                const updateResponse = await fetch(updateUrl, {
                    method: 'PATCH',
                    headers: headers,
                    body: JSON.stringify(updateBody),
                });

                if (!updateResponse.ok) {
                    const errorData = await updateResponse.json();
                    throw new Error(`Failed to update item: ${errorData.error.message}`);
                }

                const result = await updateResponse.json();
                console.log("Updated item:", result);
                alert("Pick list submission complete. All entries have been saved.")
                setConfirmedPickList(updateResponse.ok);
                setRowDataIn('');
                setReload(prev => ({ ...prev, status: true, tab: '' }));
            } else {
                const url = `https://graph.microsoft.com/v1.0/sites/${siteID}/lists/${postName}/items`;

                const body = {
                    fields: {
                        Title: modelNumber,
                        [sharePointColumnName]: delFieldData,
                    },
                };

                const createResponse = await fetch(url, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(body),
                });

                if (!createResponse.ok) {
                    const errorData = await createResponse.json();
                    throw new Error(`Failed to create list item: ${errorData.error.message}`);
                }

                const result = await createResponse.json();
                console.log("Created new item:", result);
                alert("Pick list submission complete. All entries have been saved.")

                setConfirmedPickList(createResponse.ok);
                setRowDataIn('');
                setReload(prev => ({ ...prev, status: true, tab: '' }));

            }

        } catch (err) {
            console.error("Error:", err);
        }
    };

    const createTable = (matchingDescription, matchingUom, matchingQtyToPick, pn) => {
        return (
            <tbody key={pn.ref}>
                <tr>
                    <td>{pn.pid}</td>
                    <td>{matchingDescription ? matchingDescription.pid : 'No description available'}</td>
                    <td>{matchingUom ? matchingUom.pid : 'No UOM available'}</td>
                    <td>{matchingQtyToPick ? <><button class='ui button ' onClick={() => {
                        setRowDataIn(prevData => ({
                            ...prevData,
                            [pn.ref]: {
                                ...prevData[pn.ref],
                                partNumber: pn.pid,
                                qtyPicked: matchingQtyToPick.pid,
                                qtyToPick: matchingQtyToPick.pid,
                            }
                        }))
                    }}>{matchingQtyToPick.pid}</button></> : 'No quantity to pick available'}</td>
                    <td>
                        <div className='ui input fluid'>
                            <input
                                type='number'
                                className='qty-picked'
                                name={`qtyPicked_${pn.ref}`}
                                placeholder='Qty Picked'
                                value={rowData[pn.ref]?.qtyPicked || ''}
                                onChange={(e) => setRowDataIn(prevData => ({
                                    ...prevData,
                                    [pn.ref]: {
                                        ...prevData[pn.ref],
                                        partNumber: pn.pid,
                                        qtyPicked: e.target.value,
                                        qtyToPick: matchingQtyToPick.pid,
                                    }
                                }))}
                            />
                        </div>
                    </td>
                    <td>
                        <div className='ui input fluid'>
                            <input
                                type='text'
                                className='lot-serial'
                                name={`lotSerial_${pn.ref}`}
                                placeholder='Lot/Serial'
                                onChange={(e) => setRowDataIn(prevData => ({
                                    ...prevData,
                                    [pn.ref]: {
                                        ...prevData[pn.ref],
                                        lotSerial: e.target.value,
                                        partNumber: pn.pid,
                                    }
                                }))}
                            />
                        </div>
                    </td>
                </tr>
            </tbody>
        );
    };

    const displaySharePointData = (data) => {
        const [activeTab, setActiveTab] = useState(0);

        const handleTabClick = (index) => {
            setActiveTab(index);
        };

        return (
            <div className=''>
                <h1 className="ui header medium" >
                    Material Picks
                </h1>
                <div class='ui divider'></div>
                <div className='ui top attached tabular menu'>
                    {data.map((item, index) => (
                        <a
                            key={item.fields.Title}
                            className={`item ${activeTab === index ? 'active' : ''}`}
                            onClick={() => handleTabClick(index)}
                        >
                            {item.fields.Title}
                        </a>
                    ))}
                </div>
                <div className='ui '>
                    {
                        data.map((item, index) => {
                            if (activeTab !== index) return null;

                            const key = (item) => {
                                const logKey = 'goalProgress-' + `${departmentName + selectedNumber}-${item.fields.Title}`
                                const markLine = localStorage.getItem(logKey);
                                if (markLine) {
                                    return 'to ' + departmentName.toUpperCase() + selectedNumber;
                                }
                            }
                            const fields = item.fields;
                            const partNumber = JSON.parse(fields.PartNumber);
                            const partDescription = JSON.parse(fields.PartDescription);
                            const partUom = JSON.parse(fields.UOM);
                            const partQtyToPick = JSON.parse(fields['QtyToPick']);
                            const workOrder = fields['WO'];
                            const label = is24HoursOld(item.fields['Created']);
                            const imageSrc = imagePaths[fields.Title] && imagePaths[fields.Title] !== 'img/placeholder.jpg'
                                ? imagePaths[fields.Title]
                                : 'img/placeholder.jpg';

                            return (/* segments horizontal */
                                <div className='ui segments ' key={fields.Title}>

                                    <div class="ui  very padded segment red" >
                                        {label.status && <div class={`ui label basic  ${label.color}`}>{label.message}</div>}
                                        <p class="ui header  ">Work Order Summary</p>
                                        <p class="column ui grey ">Work Order: {fields['WO'].replace('WO - ', '')}</p>
                                        <p class='column ui grey'>Deviations:
                                            <div
                                                className={`ui label  ${fields['DEV'].includes('NONE') ? 'grey basic' : 'red'
                                                    }`}
                                            >
                                                <p className="ui text">
                                                    {fields['DEV']} {/* Displays any work order deviations, if present */}
                                                </p>
                                            </div>
                                        </p>

                                        {
                                            departmentName === 'line' && <>

                                                <p class='column ui grey'>{`${selectedNumber === null ? 'Please Assign to a Line:' : 'Assign to Line:' + selectedNumber}`}
                                                </p>
                                                <button
                                                    className={`ui button basic black`}
                                                    onClick={() => {
                                                        if (selectedNumber === null) {
                                                            alert(` Please select line number`);
                                                        } else {
                                                            setAssginedLineNumber({ assginedLine: selectedNumber, model: fields.Title });
                                                        }
                                                    }}
                                                > {assginedLineNumber?.assginedLine || key(item) ? `Assigned ${key(item)}` : 'Assign'}
                                                </button>

                                                {assginedLineNumber?.assginedLine && <button
                                                    className={`ui button black`}
                                                    onClick={() => {

                                                        const t = confirm(`Are you sure you want to unassign this item? This action cannot be undone. `);
                                                        const removeThisItemKey = 'goalProgress-' + `${departmentName}-${fields.Title}`
                                                        if (t) {
                                                            localStorage.removeItem(removeThisItemKey);
                                                            if (!localStorage.getItem(removeThisItemKey)) {
                                                                alert("Unassigned Completed!")
                                                            }
                                                        }

                                                    }}
                                                > Unassign
                                                </button>}

                                            </>
                                        }

                                    </div>
                                    <div class='ui divider'></div>

                                    <div class=" ui segment basic">
                                        <table className='ui  center aligned very basic table small striped'>
                                            <thead>
                                                <tr>
                                                    <th>Part Number</th>
                                                    <th>Description</th>
                                                    <th>UOM</th>
                                                    <th>QTY To Pick</th>
                                                    <th>Qty Picked</th>
                                                    <th>Lot/Serial</th>
                                                </tr>
                                            </thead>
                                            {partNumber.map(pn => {
                                                const matchingDescription = partDescription.find(pd => pd.ref === pn.ref);
                                                const matchingQtyToPick = partQtyToPick.find(qtp => qtp.ref === pn.ref);
                                                const matchingUom = partUom.find(uom => uom.ref === pn.ref);

                                                return createTable(matchingDescription, matchingUom, matchingQtyToPick, pn);
                                            })}
                                        </table>
                                        <tr
                                            className={`ui button ${confirmPickList ? "red" : "disabled loading"}`}
                                            onClick={() => handleSubmit(fields.Title)}
                                        >
                                            {confirmPickList ? "Confirm" : "Confirmed"}
                                        </tr>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        );
    };

    const createGoalsFromPickList = (data, departmentName, selectedNumber) => {

        data.map(item => {
            if (departmentName !== 'line') {
                setSharepointDbEntry(goalProgressJSONCreation(item, dpName));
            } else if (departmentName === 'line' &&
                item.fields.Title === assginedLineNumber.model) {
                setSharepointDbEntry(goalProgressJSONCreation(item, dpName));
            }
        });
    };

    useEffect(() => {
        if (departmentName !== 'line') {
            createGoalsFromPickList(sharePointData, departmentName);
        };
    });

    useEffect(() => {

        if (selectedNumber === null && departmentName === 'line') {
            alert(` Please select line number`);
        } else if (selectedNumber !== null && departmentName === 'line') {
            createGoalsFromPickList(sharePointData, departmentName, selectedNumber);
        };
    }, [assginedLineNumber]);

    return (
        <div>
            {error && <div className="ui red message">{error}</div>}
            {sharePointData.length > 0 ? (
                <div id="sharePointData" className={`ui segment black ${!confirmPickList ? 'loading' : ''}`}>
                    {!error ? displaySharePointData(sharePointData) : ''}
                </div>
            ) : (
                <p>No items found in the list.
                    {displaySharePointData([])}
                </p>
            )}
        </div>
    );

};


