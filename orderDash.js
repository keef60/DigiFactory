const ItemWorkOrderDash = ({
    selectedDepartment,
    departmentName,
    selectedNumber,
    clearLoading,
    user,
    issesListData
}) => {

    const [accessToken, setAccessToken] = useState(null);
    const [error, setError] = useState(null);
    const [sharePointData, setSharePointData] = useState([]);
    const [tokenInput, setTokenInput] = useState('');
    const [imagePaths, setImagePaths] = useState({});
    const [postName, setPostName] = useState('');
    const [siteID, setSiteID] = useState('');

    useEffect(() => {
        $('.menu .item').tab();
    });
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
        console.log('================)01',selectedDepartment)
        if (!token) {
            console.log('================)02',selectedDepartment)
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
            console.log('================)03',selectedDepartment)
            if (!siteResponse.ok) {
                console.log('================)04',selectedDepartment)
                const errorData = await siteResponse.json();
                throw new Error(`Failed to fetch site data: ${errorData.error.message}`);
            }

            const siteData = await siteResponse.json();
            const siteId = siteData.id;
            console.log('================)05',selectedDepartment)
            if (!siteId) {
                console.log('================)06',selectedDepartment)
                throw new Error('Unable to get site ID');
            }

            const listsResponse = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('================)07',selectedDepartment)
            if (!listsResponse.ok) {
                console.log('================)08',selectedDepartment)
                const errorData = await listsResponse.json();
                throw new Error(`Failed to fetch lists: ${errorData.error.message}`);
            }

            const listsData = await listsResponse.json();
            const list = listsData.value.find(l => l.name === selectedDepartment);
            const pId = listsData.value.filter(e => e.displayName === 'PICKLIST')[0].id;
            setPostName(pId);
            setSiteID(siteId);
            console.log('================)09',selectedDepartment)
            if (!list) {
                console.log('================)010',selectedDepartment)
                throw new Error(`Unable to find the ${selectedDepartment} list`);
            }

            const listId = list.id;

            const itemsResponse = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items?$expand=fields`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('================)011',selectedDepartment)
            if (!itemsResponse.ok) {
                console.log('================)012',selectedDepartment)
                const errorData = await itemsResponse.json();
                throw new Error(`Failed to fetch list items: ${errorData.error.message}`);
            }

            const itemsData = await itemsResponse.json();
            console.log('================)013',selectedDepartment)
            if(itemsData){
                console.log('================)014',selectedDepartment)
                console.log('================)))))))',itemsData)
            setSharePointData(itemsData.value);
            setError(null);
        }

            const fetchImages = async () => {
                const imageMap = {};
                await Promise.all(
                   await itemsData.value.map(async (item) => {
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

    const [activeTab, setActiveTab] = useState(0);
    const displayUpperMenuData = (data) => {
        const handleTabClick = (index) => {
            setActiveTab(index);
        };
        return (
            <div className=''>
                <div className='ui top attached tabular menu stackable'>
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
                <div className='ui'>
                    {data.map((item, index) => {

                        if (activeTab !== index) return null;

                        const fields = item.fields;
                        const imageSrc = imagePaths[fields.Title] && imagePaths[fields.Title] !== 'img/placeholder.jpg'
                            ? imagePaths[fields.Title]
                            : 'img/placeholder.jpg';

                        return (<>
                            <OrderDeatil data={item} imageSrc={imageSrc} />
                        </>
                        );
                    })}
                </div>
            </div>
        );
    };
    const displayLowerMenuData = (data) => {
        return (
            <div className='ui   segment'>
                {data.map((item, index) => {
                    if (activeTab !== index) return null;
                    return (
                        <>
                            <OrderLowerMenu
                                itemData={item}
                                selectedNumber={selectedNumber}
                                departmentName={departmentName}
                                user={user}
                                issesListData={issesListData} />
                        </>
                    );
                })}
            </div>
        );
    };
    
    return (

        <div>
            {error && <div className="ui red message">{error}</div>}

            {sharePointData.length > 0 ? (
                <div id="sharePointData" className={`ui segment black ${clearLoading ? 'loading' : ''}`}>
                    {!error ? <>
                        {displayUpperMenuData(sharePointData)}
                        {displayLowerMenuData(sharePointData)}
                    </> : 'No data'}
                </div>
            ) : (
                <p>No items found in the list.
                    {displayUpperMenuData([])}
                </p>
            )}

        </div>


    );

};
