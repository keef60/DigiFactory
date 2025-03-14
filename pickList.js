const { useState, useEffect } = React;

const PickListApp = (props) => {
    const { selectedDepartment, departmentName } = props
    const [accessToken, setAccessToken] = useState(null);
    const [error, setError] = useState(null);
    const [sharePointData, setSharePointData] = useState([]);
    const [tokenInput, setTokenInput] = useState('');
    const [imagePaths, setImagePaths] = useState({}); // To store image paths for each item
    const [postName, setPostName] = useState('');
    const [siteID, setSiteID] = useState('');
    const [confirmPickList, setConfirmedPickList] = useState(false);
    const [rowData, setRowDataIn] = useState({});

    // Function to check if the image exists
    const checkImageExists = async (url) => {
        const img = new Image();
        img.src = url;

        return new Promise((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
        });
    };

    // Function to get the correct image path for each SharePoint item
    const getImagePath = async (imageName) => {
        const extensions = ['jpg', 'jpeg', 'png', 'gif', 'avif', 'webp'];
        for (let ext of extensions) {
            const path = departmentName === 'packout' ? `img/packout/${imageName}.${ext}` : `img/${imageName}.${ext}`;
            if (await checkImageExists(path)) {
                return path;
            }
        }
        return 'img/placeholder.jpg'; // Return the placeholder image if no valid image is found
    };

    // Function to fetch SharePoint data
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
            const pId = listsData.value.filter(e => e.displayName == 'PICKLIST')[0].id
            setPostName(pId)
            setSiteID(siteId)

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
            setError(null);  // Clear any previous errors

            // Fetch images after fetching data
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

    const extractAccessToken = (url) => {
        const urlParams = new URLSearchParams(url.split('#')[1] || '');
        return urlParams.get('access_token');
    };

    const handleTokenSubmit = () => {
        const tokenFromUrl = extractAccessToken(tokenInput);
        if (tokenFromUrl) {
            setAccessToken(tokenFromUrl);
            sessionStorage.setItem('access_token', tokenFromUrl);
            fetchSharePointData(tokenFromUrl);
        } else {
            setError('Please enter a valid URL containing the access token');
        }
    };

    const startOAuthLogin = () => {
        const tenant = "a8585420-4088-4906-a78d-06b2693cc3aa"; // Replace with your tenant ID
        const clientId = "8db3d71f-62b7-457d-b653-9f874424f89e"; // Replace with your client ID
        const redirectUri = 'http://localhost'; // Replace with your redirect URI

        const scopes = 'Sites.Read.All';
        const responseType = 'token';
        const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectUri}&scope=${scopes}`;

        window.open(authUrl, '_blank', 'width=600,height=400,scrollbars=yes');
    };

    useEffect(() => {
        const storedToken = sessionStorage.getItem('access_token');
        if (storedToken) {
            setAccessToken(storedToken);
            fetchSharePointData(storedToken);
        }
    }, []);

    const handleSubmit = async (modelNumber) => {

        const delFieldData = JSON.stringify(rowData);
    
        // Construct the URL to get the list items with a filter by Title (modelNumber)
        const itemsUrl = `https://graph.microsoft.com/v1.0/sites/${siteID}/lists/${postName}/items?$filter=fields/Title eq '${modelNumber}'&$expand=fields`;
//        const itemsUrl2 = `https://graph.microsoft.com/v1.0/sites/${siteID}/lists/${postName}/items?$expand=fields`;
   
        const headers = {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Prefer": "HonorNonIndexedQueriesWarningMayFailRandomly" // Add this header to allow non-indexed queries
        };
    
        try {
            // Step 1: Fetch the item based on the modelNumber (Title)
            const itemsResponse = await fetch(itemsUrl, {
                method: 'GET',
                headers: headers,
            });
    
            if (!itemsResponse.ok) {
                const errorData = await itemsResponse.json();
                throw new Error(`Failed to fetch list items: ${errorData.error.message}`);
            }
    
            const itemsData = await itemsResponse.json();
            console.log(itemsData)
    
            // Step 2: Check if the item exists
            if (itemsData.value.length > 0) {
                // If item exists, update it using PATCH
                const itemId = itemsData.value[0].id;
                const updateUrl = `https://graph.microsoft.com/v1.0/sites/${siteID}/lists/${postName}/items/${itemId}`;
    
                const updateBody = {
                    fields: {
                        Title: modelNumber,  // Adjust this field as per the requirement
                        [departmentName.charAt(0).toUpperCase()+departmentName.slice(1)]: delFieldData // Include any other fields you want to update
                    },
                };
    
                // Step 3: Send the update request
                const updateResponse = await fetch(updateUrl, {
                    method: 'PATCH',  // Use PATCH to update an existing item
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
                // If the item doesn't exist, create a new one using POST
                const url = `https://graph.microsoft.com/v1.0/sites/${siteID}/lists/${postName}/items`;
    
                const body = {
                    fields: {
                        Title: modelNumber,  // Adjust this field as per your SharePoint list
                        [departmentName.charAt(0).toUpperCase()+departmentName.slice(1)]: delFieldData // Add other fields as needed
                    },
                };
    
                // Step 4: Create the new item
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
        return React.createElement(
            'tbody',
            null,
            React.createElement(
                'tr',
                null,
                React.createElement('td', null, pn.pid),
                React.createElement(
                    'td',
                    null,
                    matchingDescription ? matchingDescription.pid : 'No description available'
                ),
                React.createElement(
                    'td',
                    null,
                    matchingUom ? matchingUom.pid : 'No UOM available'
                ),
                React.createElement(
                    'td',
                    null,
                    matchingQtyToPick ? matchingQtyToPick.pid : 'No quantity to pick available',

                ),
                React.createElement(
                    'td',
                    null,
                    React.createElement(
                        'div',
                        { className: 'ui input' },
                        React.createElement(
                            'input',
                            {
                                type: 'number',
                                className: 'qty-picked',
                                name: `qtyPicked_${pn.ref}`,
                                placeholder: 'Qty Picked',
                                onChange: (e) => setRowDataIn(prevData => ({
                                    ...prevData,
                                    [pn.ref]: {
                                        ...prevData[pn.ref],
                                        partNumber: pn.pid,
                                        qtyPicked: e.target.value,
                                        qtyToPick: matchingQtyToPick.pid,

                                    }
                                }))
                            }
                        )
                    )
                ),
                React.createElement(
                    'td',
                    null,
                    React.createElement(
                        'div',
                        { className: 'ui input' },
                        React.createElement(
                            'input',
                            {
                                type: 'text',
                                className: 'lot-serial',
                                name: `lotSerial_${pn.ref}`,
                                placeholder: 'Lot/Serial',
                                onChange: (e) => setRowDataIn(prevData => ({
                                    ...prevData,
                                    [pn.ref]: {
                                        ...prevData[pn.ref],
                                        lotSerial: e.target.value,
                                        partNumber: pn.pid
                                    }
                                }))
                            }
                        )
                    )
                )
            )
        );
    };

    const displaySharePointData = (data) => {
  
        return React.createElement('div', { className: 'ui items divided' },
            data.map(item => {
                const fields = item.fields;
                const partNumber = JSON.parse(fields.PartNumber);
                const partDescription = JSON.parse(fields.PartDescription);
                const partUom = JSON.parse(fields.UOM);
                const partQtyToPick = JSON.parse(fields['QtyToPick']);

                // Check if image exists for the current part title
                const imageSrc = imagePaths[fields.Title] && imagePaths[fields.Title] !== 'img/placeholder.jpg'
                    ? imagePaths[fields.Title]
                    : 'img/placeholder.jpg';

                // Generate the content for each part number
                return React.createElement('div', { className: 'item' },
                    // Render Image if available
                    imageSrc !== 'img/placeholder.jpg' ?
                        React.createElement('a', { className: 'ui small image' },
                            React.createElement('img', { src: imageSrc, alt: fields.Title })
                        ) :
                        React.createElement('a', { className: 'ui small image' },
                            React.createElement('div', { className: 'ui placeholder' },
                                React.createElement('div', { className: 'image' })
                            )
                        ),
                    // Render Part Information and Table
                    React.createElement('div', { className: 'content aligned left' },
                        React.createElement('a', { className: 'header huge ui' }, fields.Title),
                        React.createElement('table', { className: 'ui celled table striped' },
                            React.createElement('thead', null,
                                React.createElement('tr', null,
                                    React.createElement('th', null, 'Part Number'),
                                    React.createElement('th', null, 'Description'),
                                    React.createElement('th', null, 'UOM'),
                                    React.createElement('th', null, 'QTY To Pick'),
                                    React.createElement('th', null, 'Qty Picked'),
                                    React.createElement('th', null, 'Lot/Serial')
                                )
                            ),
                            partNumber.map(pn => {
                                // Find matching description, UOM, and quantity to pick for the current part number
                                const matchingDescription = partDescription.find(pd => pd.ref === pn.ref);
                                const matchingQtyToPick = partQtyToPick.find(qtp => qtp.ref === pn.ref);
                                const matchingUom = partUom.find(uom => uom.ref === pn.ref);

                                // Return tbody element
                                return createTable(matchingDescription, matchingUom, matchingQtyToPick, pn);
                            }),
                        ),

                        React.createElement(
                            'tr',
                            {
                                className: `ui button fluid ${confirmPickList ? "disabled" : "green"}`,
                                onClick: async () => handleSubmit(fields.Title)
                            },
                            !confirmPickList ? "Confirm" : "Comfirmed"

                        )

                    )
                )
            })
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
            // Generating a timestamp for the record
            const timestamp = new Date().toISOString();

            // Check if the record already exists in localStorage
            const existingGoalProgress = localStorage.getItem(`goalProgress-${departmentName}-${title}`);

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
                        localStorage.setItem(`goalProgress-${departmentName}-${title}`, JSON.stringify(existingData));
                    }
                    return; // Skip adding the new record if the existing record is active
                }
            }

            // Create the object to store in localStorage if not exists or if it's inactive
            const goalProgressData = {
                goal: runQuantity,
                progress: "0",
                "creation date": timestamp,
                isActive: true
            };

            // Store the object in localStorage
            localStorage.setItem(`goalProgress-${departmentName}-${title}`, JSON.stringify(goalProgressData));
        });
    };

    createGoalsFromPickList(sharePointData, departmentName)
    return React.createElement('div', null,
        accessToken ? (
            React.createElement('div', { className: 'ui message' },
                React.createElement('h2', null, 'You are logged in.'),
                React.createElement('button', { className: 'ui red button', onClick: () => setAccessToken(null) }, 'Logout')
            )
        ) : (
            React.createElement('div', { id: 'loginSection', className: 'ui raised very padded text container segment' },
                React.createElement('h2', { className: 'ui header' }, 'You are not logged in.'),
                React.createElement('button', { className: 'ui blue button', onClick: startOAuthLogin }, 'Login with OAuth'),
                React.createElement('h3', null, 'Or manually paste your access token URL below:'),
                React.createElement('div', { className: 'ui action input' },
                    React.createElement('input', {
                        type: 'text',
                        value: tokenInput,
                        onChange: (e) => setTokenInput(e.target.value),
                        placeholder: 'Paste the URL containing your access token here'
                    }),
                    React.createElement('button', { className: 'ui button', onClick: handleTokenSubmit }, 'Submit Token')
                )
            )
        ),
        error && React.createElement('div', { className: 'ui red message' }, error),
        sharePointData.length > 0 ? (
            React.createElement('div', { id: 'sharePointData', className: 'ui segment' },
                displaySharePointData(sharePointData)
            )
        ) : (
            React.createElement('p', null, 'No items found in the list.')
        )
    );
};

export default PickListApp;
