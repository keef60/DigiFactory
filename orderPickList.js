const { useEffect, useRef, useState } = React

const OrderPickList = ({
    selectedDepartment,
    departmentName,
    selectedNumber,
    clearLoading,
    setWOnDev
}) => {

    const [accessToken, setAccessToken] = useState(null);
    const [error, setError] = useState(null);
    const [sharePointData, setSharePointData] = useState([]);
    const [tokenInput, setTokenInput] = useState('');
    const [imagePaths, setImagePaths] = useState({});
    const [postName, setPostName] = useState('');
    const [siteID, setSiteID] = useState('');
    const [confirmPickList, setConfirmedPickList] = useState(false);
    const [rowData, setRowDataIn] = useState({});

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

    const handleSubmit = async (modelNumber) => {
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
                setConfirmedPickList(updateResponse.ok);
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
                setConfirmedPickList(createResponse.ok);
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
                    <td>{matchingQtyToPick ? matchingQtyToPick.pid : 'No quantity to pick available'}</td>
                    <td>
                        <div className='ui input fluid'>
                            <input
                                type='number'
                                className='qty-picked'
                                name={`qtyPicked_${pn.ref}`}
                                placeholder='Qty Picked'
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

                            return (
                                <div className='ui segments horizontal' key={fields.Title}>

                                    <div class="ui  segment inverted black">
                                    {label.status && <div class={`ui label  ${label.color}`}>{label.message}</div>}

                                        <h4 class="ui header ">WO: {fields['WO'].replace('WO - ', '')}</h4>
                                        <p class='column'><strong>Quantity:</strong> {fields['Quantity']} Unit(s) </p>
                                        <p class='column'><strong>Scheduled Date:</strong> {convertToDateFormat(fields['Created'])}</p>
                                        <p class='column'><strong>Responsible:</strong> Mitchell Admin</p>
                                        <p class='column'><strong>Deviations:</strong>
                                            <div
                                                className={`ui label  ${fields['DEV'].includes('NONE') ? 'grey basic' : 'red'
                                                    }`}
                                            >
                                                <p className="ui text">
                                                    {fields['DEV']} {/* Displays any work order deviations, if present */}
                                                </p>
                                            </div>
                                        </p>
                                    </div>



                                    <div class=" ui segment">
                                        <table className='ui celled table center aligned  small striped'>
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
                                            className={`ui button ${confirmPickList ? "disabled" : "green"}`}
                                            onClick={() => handleSubmit(fields.Title)}
                                        >
                                            {!confirmPickList ? "Confirm" : "Confirmed"}
                                        </tr>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        );
    };

    const createGoalsFromPickList = (data, departmentName) => {
        // Get the start and end of the current week
        const currentDate = new Date();
        const currentDay = currentDate.getDay();
        const daysToStartOfWeek = currentDay === 0 ? 6 : currentDay - 1; // Get days to Monday
        const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - daysToStartOfWeek));
        startOfWeek.setHours(0, 0, 0, 0); // Start of week at midnight

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (Sunday)
        endOfWeek.setHours(23, 59, 59, 999); // End of week just before midnight

        data.map(item => {
            const fields = item.fields;
            const runQuantity = fields.Quantity
            const title = fields.Title;  // Assuming the title field is here 
            const workOrder = fields['WO'];
            const deviations = fields['DEV'];
            const key = 'goalProgress-' + `${departmentName}-${title}`
            // Generating a timestamp for the record
            const timestamp = new Date().toISOString();

            // Check if the record already exists in localStorage
            const existingGoalProgress = localStorage.getItem(key);


            // If the record exists, check its timestamp and isActive
            if (existingGoalProgress) {
                const existingData = JSON.parse(existingGoalProgress);
                const existingTimestamp = new Date(existingData["creation date"]);

                // If it's active, check if the timestamp is within the current week
                if (existingData.isActive === true) {
                    // If the timestamp is outside the current week, set isActive to false
                    if (existingTimestamp < startOfWeek || existingTimestamp > endOfWeek) {
                        existingData.isActive = false;
                        // Update localStorage with isActive set to false
                        localStorage.setItem(key, JSON.stringify(existingData));
                    }
                    return; // Skip adding the new record if the existing record is active
                }
            }

            // Create the object to store in localStorage if not exists or if it's inactive
            const goalProgressData = {
                goal: runQuantity,
                progress: "0",
                "creation date": timestamp,
                isActive: true,
                wo: workOrder,
                dev: deviations
            };

            // Store the object in localStorage
            localStorage.setItem(key, JSON.stringify(goalProgressData));
        });
    };
    createGoalsFromPickList(sharePointData, departmentName)


    return (
        <div>
            {error && <div className="ui red message">{error}</div>}

            {sharePointData.length > 0 ? (
                <div id="sharePointData" className={`ui segment black ${clearLoading ? 'loading' : ''}`}>
                    {!error ? displaySharePointData(sharePointData) : 'No data'}
                </div>
            ) : (
                <p>No items found in the list.
                    {displaySharePointData([])}
                </p>
            )}
        </div>
    );

};


