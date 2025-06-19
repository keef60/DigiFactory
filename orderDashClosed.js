const ItemWorkOrderDashClosed = ({
    selectedDepartment,
    departmentName,
    selectedNumber,
    clearLoading,
    user,
    issesListData,
    inventoryRef,
    gpDataInput,
    reload,
    setReload,
    selectedDaysFilter, 
    setSelectedDaysFilter
}) => {

    const [accessToken, setAccessToken] = useState(null);
    const [error, setError] = useState(null);
    const [sharePointData, setSharePointData] = useState([]);
    const [imagePaths, setImagePaths] = useState({});
    const [postName, setPostName] = useState('');
    const [siteID, setSiteID] = useState('');
//    const [selectedDaysFilter, setSelectedDaysFilter] = useState(7);


    useEffect(() => {
        $('.menu .item').tab();
        $('.ui.dropdown.dayFilter').dropdown({
            action: (_, value) => {
                setSelectedDaysFilter(value);
            }
        });
    });
    useEffect(() => {
        const storedToken = sessionStorage.getItem('access_token');
        if (storedToken) {
            setAccessToken(storedToken);
            fetchSharePointData(storedToken);
        }
    }, [selectedDepartment]);

    useEffect(() => {}, [selectedDaysFilter])

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

            if (itemsData) {
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
        const key = (item) => {
            const logKey = 'goalProgress-' + `${departmentName + selectedNumber}-${item.fields.Title}`
            const markLine = localStorage.getItem(logKey);
            if (markLine) {
                return true;
            } else {
                return false;
            };
        }
        const handleTabClick = (index) => {
            setActiveTab(index);
        };
        return (
            <div className=''>

                <div className='ui'>
                    <OrdersList data={data}
                        imagePaths={imagePaths}
                        user={user}
                        departmentName={departmentName}
                        selectedNumber={selectedNumber}
                        handleTabClick={handleTabClick}
                        closed={true}
                        selectedDaysFilter={selectedDaysFilter}
                    />

                </div>
            </div>
        );
    };

    const createDays = () => {
        return Array.from({ length: 15 }, (_, index) => (
            <div className="item" data-value={index + 1} key={index}>
                {index + 1}
            </div>
        ));
    };


    const displayLowerMenuData = (data) => {
        return (
            <div className='ui'>
                {data.map((item, index) => {
                    if (activeTab !== index) return null;
                    return (

                        <div className="ui raised very padded text container segment">
                            <h4 className="ui header">Select a Day Range</h4>
                            <div className="ui fluid  dropdown dayFilter">
                                <input type="hidden" name="day" />
                                <i className="dropdown icon"></i>
                                <div className="default text">Choose Day</div>
                                <div className="menu">{createDays()}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div>
            {error && <div className="ui red message">{error}</div>}

            {sharePointData.length > 0 ? (
                <div id="sharePointData" className={`ui segment   ${clearLoading ? 'loading' : ''}`}>
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
