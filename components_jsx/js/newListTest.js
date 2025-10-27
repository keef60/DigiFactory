//Commit Update
const createSharePointList = async (listName, columns, log) => {

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
      choices: [
        'NotStarted',
        'InProgress',
        'Completed',
        'Blocked'
      ]
    }
  }
  ,
 
  {
    name: 'Comments',
    text: {
      displayName: 'Comments',
      allowMultipleLines: true,
    }
  },
  {
    name: 'IsUrgent',
    boolean: {
      displayName: 'Is Urgent'
    }
  }
]; */



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
};


