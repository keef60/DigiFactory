const main = {

  startOAuthLogin: () => {
    const tenant = "a8585420-4088-4906-a78d-06b2693cc3aa"; // Replace with your tenant ID
    const clientId = "8db3d71f-62b7-457d-b653-9f874424f89e"; // Replace with your client ID
    const redirectUri = 'http://localhost'; // Replace with your redirect URI

    const scopes = 'Sites.Manage.All';
    const responseType = 'token';
    const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectUri}&scope=${scopes}`;

    window.open(authUrl, '_blank', 'width=600,height=400,scrollbars=yes');

  },

  fetchSharePointData: async (selectedDepartment, departmentName, log, setTableData, setPackoutTableData) => {
    // Retrieve the token from sessionStorage
    const token = sessionStorage.getItem('access_token');

    if (!token) {
      throw new Error('No valid access token found. Please ensure you login.');
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

      // Store the site ID in sessionStorage
      sessionStorage.setItem(`siteId-${departmentName}-${selectedDepartment}`, siteId);

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

      const list = listsData.value.find(l => l.displayName === selectedDepartment);

      if (!list) {
        throw new Error(`Unable to find the ${selectedDepartment} list`);
      }

      const listId = list.id;
      sessionStorage.setItem(`postName-${departmentName}-${selectedDepartment}`, listId); // Store postName (listId) in sessionStorage

      const itemsResponse = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items?$expand=fields`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const itemsData = await itemsResponse.json();
      const regex = /^(load|inventory|sage|runRates|frames|paint|handles|packout|maintenance|issues|.*line.*)$/;

      if (regex.test(departmentName)) {
        return itemsData;
      }

      if (log) {
        selectedDepartment !== 'PACKOUTTABLE' ?
          setTableData(itemsData.value) : setPackoutTableData(itemsData.value);

        console.log('Data fetched and stored in sessionStorage successfully.');
      };

      console.log('Data fetched and stored in sessionStorage successfully.');


    } catch (err) {
      console.error('Error fetching SharePoint data: ' + err.message);
    }
  },

  handleSubmit: async (modelNumber, rowData, departmentName, list) => {

    console.log(`siteId-${departmentName}-${list}`)

    const siteID = sessionStorage.getItem(`siteId-${departmentName}-${list}`);
    const postName = sessionStorage.getItem(`postName-${departmentName}-${list}`);
    const accessToken = sessionStorage.getItem('access_token');
    const delFieldData = JSON.stringify(rowData); // Assuming rowData is passed correctly
    const titleString = typeof modelNumber !== 'string' ? modelNumber.toString() : modelNumber;

    let itemsData = null;
    let result = null;
    let updateResponse = null;
    let createResponse = null;
    let itemsResponse = null;



    // Construct the URL to get the list items with a filter by Title (modelNumber)
    const itemsUrl = `https://graph.microsoft.com/v1.0/sites/${siteID}/lists/${postName}/items?$filter=fields/Title eq '${titleString}'&$expand=fields`;

    const headers = {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Prefer": "HonorNonIndexedQueriesWarningMayFailRandomly" // Add this header to allow non-indexed queries
    };

    try {
      // Step 1: Fetch the item based on the modelNumber (Title)
      itemsResponse = await fetch(itemsUrl, {
        method: 'GET',
        headers: headers,
      });

      if (!itemsResponse.ok) {
        const errorData = await itemsResponse.json();
        // throw new Error(`Failed to fetch list items: ${errorData.error.message}`);
      } else {

        itemsData = await itemsResponse.json();
        console.log(itemsData);

      }
      // Step 2: Check if the item exists
      if (itemsData.value.length > 0) {
        // If item exists, update it using PATCH
        const itemId = itemsData.value[0].id;
        const updateUrl = `https://graph.microsoft.com/v1.0/sites/${siteID}/lists/${postName}/items/${itemId}`;

        const updateBody = {
          fields: {
            Title: titleString,  // Adjust this field as per the requirement
            [departmentName]: delFieldData // Include any other fields you want to update
          },
        };

        // Step 3: Send the update request
        updateResponse = await fetch(updateUrl, {
          method: 'PATCH',  // Use PATCH to update an existing item
          headers: headers,
          body: JSON.stringify(updateBody),
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          // throw new Error(`Failed to update item: ${errorData.error.message}`);
        } else {

          result = await updateResponse.json();
          console.log("Updated item:", result);

        }
      } else if (!itemsResponse || !updateResponse) {
        // If the item doesn't exist, create a new one using POST
        const url = `https://graph.microsoft.com/v1.0/sites/${siteID}/lists/${postName}/items`;


        const body = {
          fields: {
            Title: titleString,  // Adjust this field as per your SharePoint list
            [departmentName]: delFieldData // Add other fields as needed
          },
        };

        // Step 4: Create the new item
        createResponse = await fetch(url, {
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
      }

    } catch (err) {
      console.error("Error:", err);
    }
  },
  handleAssign: async (email, modelNumber, departmentName, list) => {

    const siteID = sessionStorage.getItem(`siteId-${departmentName}-${list}`);
    const postName = sessionStorage.getItem(`postName-${departmentName}-${list}`);
    const accessToken = sessionStorage.getItem('access_token');
    // const delFieldData = JSON.stringify(rowData); // Assuming rowData is passed correctly
    const titleString = typeof modelNumber !== 'string' ? modelNumber.toString() : modelNumber;

    let itemsData = null;
    let result = null;
    let updateResponse = null;
    let createResponse = null;
    let itemsResponse = null;



    // Construct the URL to get the list items with a filter by Title (modelNumber)
    const itemsUrl = `https://graph.microsoft.com/v1.0/sites/${siteID}/lists/${postName}/items?$filter=fields/Title eq '${titleString}'&$expand=fields`;

    const headers = {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Prefer": "HonorNonIndexedQueriesWarningMayFailRandomly" // Add this header to allow non-indexed queries
    };

    try {
      await fetch(`https://graph.microsoft.com/v1.0/sites/${siteID}/lists/${postName}/items`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          fields: {
            Title: titleString,
            names: {
              email: email  // 👈 Make sure it's the correct internal column name
            }
          }
        })
      })
        .then(response => response.json())
        .then(data => console.log("Item created:", data))
        .catch(error => console.error("Create Error:", error));

    } catch (err) {
      console.error("Error:", err);
    }
  },
  createSharePointList: async (listName, columns, log) => {

    /* const testColumns = [
{
  name: 'EmployeeName',
  text: {
    displayName: 'Employee Name'
  }
},
{
  name: 'TaskStatus',
  choice: {
    displayName: 'Task Status',
    allowMultipleSelections: false,
    choices: ['NotStarted', 'InProgress', 'Completed', 'Blocked'],
    displayAs: 'dropDownMenu'
  }
},
{
  name: 'Comments',
  multilineText: {
    displayName: 'Comments',
    allowMultipleLines: true
  }
},
{
  name: 'IsUrgent',
  boolean: {
    displayName: 'Is Urgent'
  }
},
{
  name: 'DueDate',
  dateTime: {
    displayName: 'Due Date',
    displayAs: 'dateOnly'
  }
},
{
  name: 'EstimatedHours',
  number: {
    displayName: 'Estimated Hours',
    decimalPlaces: 2,
    minimum: 0
  }
},
{
  name: 'ProjectLink',
  hyperlinkOrPicture: {
    displayName: 'Project Link'
  }
},
{
  name: 'AssignedTo',
  personOrGroup: {
    displayName: 'Assigned To',
    allowMultipleSelection: false,
    chooseFromType: 'peopleAndGroups'
  }
}
];
; */



    const token = sessionStorage.getItem('access_token');

    if (!token) {
      throw new Error('No valid access token found. Please ensure you login.');
    }

    const siteUrl = 'fnagroup.sharepoint.com';
    const sitePath = '/sites/LineSupport';

    try {
      // Step 1: Get Site ID
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

      if (!siteId) throw new Error('Site ID not found.');

      // Step 2: Create List
      const listResponse = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: listName,
          list: { template: 'genericList' },
          columns: columns
        }),
      });

      if (!listResponse.ok) {
        const errorData = await listResponse.json();
        throw new Error(`Failed to create list: ${errorData.error.message}`);
      }

      const listData = await listResponse.json();
      if (log) console.log('List created successfully:', listData);
      return listData;

    } catch (err) {
      console.error('Error creating SharePoint list:', err.message);
    }
  }
};
