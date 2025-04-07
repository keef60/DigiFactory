const ItemTest = ({
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
    useEffect(() => {
        const storedToken = sessionStorage.getItem('access_token');
        if (storedToken) {
            setAccessToken(storedToken);
            fetchSharePointData(storedToken);
        }
    }, [selectedDepartment]);

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


     const statusTab = (item)=>{
        console.log(item)
       const dC =  is24HoursOld(item.createdDateTime);
       return  (     
        dC.status && <div class={`ui  label  ${dC.status ? dC.color : 'black'}`}>{dC.message}
        </div>
      );
     };

     const createdBy = (item)=>{
        return <>{item.createdBy.user.displayName}</>
     }

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
                <div className='ui bottom attached segment'>
                    {data.map((item, index) => {
                  
                        if (activeTab !== index) return null;

                        const fields = item.fields;
                        const partNumber = JSON.parse(fields.PartNumber);
                        const partDescription = JSON.parse(fields.PartDescription);
                        const partUom = JSON.parse(fields.UOM);
                        const partQtyToPick = JSON.parse(fields['QtyToPick']);
                        const workOrder = fields['WO'];

                        const imageSrc = imagePaths[fields.Title] && imagePaths[fields.Title] !== 'img/placeholder.jpg'
                            ? imagePaths[fields.Title]
                            : 'img/placeholder.jpg';

                        return (<>
                            <table class="ui very basic  celled table">
                                <thead  class="full-width">
                                    <tr>
                                        <th  >Model</th>
                                        <th >Work Order #</th>
                                        <th >Created </th>
                                        <th >Created by </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td >
                                            {/* Image Section */}
                                            {imageSrc !== 'img/placeholder.jpg' ? (
                                                <h1 class="ui  header ">
                                                    <img src={imageSrc} alt={fields.Title} class="ui fluid rounded image" />
                                                </h1>
                                            ) : (
                                                <a className='ui mini image' >
                                                    <div className='ui placeholder'>
                                                        <div className='image' class="ui  rounded image" />
                                                    </div>
                                                </a>
                                            )}
                                        </td>
                                        <td >
                                            <div className='header ui'>{workOrder}</div>
                                        </td>
                                        <td >{statusTab(item)}</td>
                                        <td>{createdBy(item)}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <Statistic departmentName={departmentName} selectedNumber={selectedNumber} title={fields.Title} />
                            </>
                        );
                    })}
                </div>
            </div>
        );
    };

    console.log()
    return (
<div class="ui ">
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
  <h2 class="ui header">Manufacturing Orders</h2>

  <div class="ui secondary menu">
    <a class="item" href="#">New</a>
    <a class="item" href="#">Overview</a>
    <div class="right menu">
      <a class="item" href="#">
        <i class="search icon"></i>
      </a>
      <a class="item" href="#">
        <i class="bell icon"></i>
      </a>
      <a class="item" href="#">
        <i class="user icon"></i>
      </a>
    </div>
  </div>

  <div class="ui segment">
    <button class="ui button">Produce All</button>
    <button class="ui button">Unblock</button>
    <button class="ui button">Maintenance Request</button>
    <button class="ui button">Print Labels</button>
  </div>

  <div class="ui segment">
    <h3 class="ui header">MO Reference: WH/MO/00011</h3>
    <p>Product: [PURN_7800] Desk Combination</p>
    <p>Quantity: 1.00 Unit(s)</p>
    <p>Bill of Material: BOM for Manufacturing [PURN_7800] Desk Combination</p>
    <p>Scheduled Date: 12/28/2023 08:00 AM</p>
    <p>Source Document: WH/OUT/00014</p>
    <p>Component Availability: Available</p>
    <p>Responsible: Mitchell Admin</p>
  </div>

  <div class="ui tabular menu">
    <a class="item active" data-tab="first">Components</a>
    <a class="item" data-tab="second">Work Orders</a>
    <a class="item" data-tab="third">Miscellaneous</a>
  </div>

  <div class="ui tab segment active" data-tab="first">
    <p>Components Content</p>
  </div>

  <div class="ui tab segment" data-tab="second">
    <table class="ui celled table">
      <thead>
        <tr>
          <th>Operation</th>
          <th>Assigned</th>
          <th>Work Center</th>
          <th>Expected Duration</th>
          <th>Real Duration</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Main Assembly</td>
          <td>Mitchell Admin</td>
          <td>Assembly Line 1</td>
          <td>60 minutes</td>
          <td></td>
          <td>
            <button class="ui button">Start</button>
            <button class="ui button">Block</button>
          </td>
        </tr>
        <tr>
          <td>Drill Station 1</td>
          <td></td>
          <td>Drill Station 1</td>
          <td></td>
          <td></td>
          <td>
            <button class="ui button">Unblock</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="ui tab segment" data-tab="third">
    <p>Miscellaneous Content</p>
  </div>
</div>
    );

};
