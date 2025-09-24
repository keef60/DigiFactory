const ItemWorkOrderDash = ({
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
    selectedDaysFilter
}) => {

    const [accessToken, setAccessToken] = useState(null);
    const [error, setError] = useState(null);
    const [sharePointData, setSharePointData] = useState([]);
    const [imagePaths, setImagePaths] = useState({});
    const [postName, setPostName] = useState('');
    const [siteID, setSiteID] = useState('');
    const [quantityOffset, setQuantityOffset] = useState({});


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
                setError(`Failed to fetch site data: ${errorData.error.message}`);
                throw new Error(`Failed to fetch site data: ${errorData.error.message}`);
            }

            const siteData = await siteResponse.json();
            const siteId = siteData.id;

            if (!siteId) {

                setError('Unable to get site ID');
               // throw new Error('Unable to get site ID');
            }

            const listsResponse = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!listsResponse.ok) {

                const errorData = await listsResponse.json();
                setError(`Failed to fetch lists: ${errorData.error.message}`);

               // throw new Error(`Failed to fetch lists: ${errorData.error.message}`);
            }

            const listsData = await listsResponse.json();
            const list = listsData.value.find(l => l.name === selectedDepartment);
            const pId = listsData.value.filter(e => e.displayName === 'PICKLIST')[0].id;
            setPostName(pId);
            setSiteID(siteId);

            if (!list) {
                setError(`Unable to find the ${selectedDepartment} list`);
               // throw new Error(`Unable to find the ${selectedDepartment} list`);
            }

            const listId = list.id;

            const itemsResponse = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items?$expand=fields`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const pickListResponse = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${pId}/items?$expand=fields`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!itemsResponse.ok) {

                const errorData = await itemsResponse.json();
                setError(`Failed to fetch list items: ${errorData.error.message}`);
               // throw new Error(`Failed to fetch list items: ${errorData.error.message}`);
            }
            if (!pickListResponse.ok) {
                const errorData = await pickListResponse.json();
                setError(`Failed to fetch list items: ${errorData.error.message}`);
               // throw new Error(`Failed to fetch list items: ${errorData.error.message}`);
            }

            const pickListData = await pickListResponse.json();

            const itemsData = await itemsResponse.json();

            processQuantityOffsets(itemsData, pickListData);

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
            console.warn(err);
        }
    };

    function processQuantityOffsets(itemsData, pickListData) {
        itemsData.value.forEach(item => {
            const title = item.fields.Title;

            // Parse partNumber, QtyToPick from the item
            const itemPartNumbers = JSON.parse(item.fields.PartNumber || '[]'); // array of { pid, ref }
            const itemQtyToPick = JSON.parse(item.fields.QtyToPick || '[]');   // array of { pid, ref }

            // Map refs to partNumbers and their expected quantities
            const partRefMap = {};
            itemPartNumbers.forEach(part => {
                const ref = part.ref;
                partRefMap[ref] = part.pid; // ref -> partNumber
            });

            const qtyMap = {};
            itemQtyToPick.forEach(qty => {
                const ref = qty.ref;
                const quantity = parseInt(qty.pid, 10);
                const partNumber = partRefMap[ref];
                if (partNumber) {
                    qtyMap[partNumber] = quantity;
                }
            });

            // Match corresponding pick list entry
            const pickEntry = pickListData.value.find(pick => pick.fields.Title === title);
            if (!pickEntry) return;

            const handles = JSON.parse(pickEntry.fields?.handles || '{}');

            // Accumulate mismatches
            const mismatches = [];

            Object.values(handles).forEach(handle => {
                const partNumber = handle.partNumber;
                const picked = parseInt(handle.qtyPicked, 10);
                const expected = qtyMap[partNumber];

                if (expected !== undefined && expected !== picked) {
                    mismatches.push({
                        partNumber,
                        expectedQty: expected,
                        actualQty: picked
                    });
                }
            });

            if (mismatches.length > 0) {
                setQuantityOffset(prev => ({
                    ...prev,
                    [title]: mismatches
                }));
            }
        });
    }

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

                {/*                 <div className='ui top attached tabular menu stackable'>

                    {data.map((item, index) => (
                        <a
                            key={item.fields.Title}
                            className={`item  ${activeTab === index ? `active` : ''}`}
                            onClick={() => handleTabClick(index)}
                        >
                            {key(item) ? <i class="lock open icon"></i> : departmentName === 'line' ? <i class="lock closed icon"></i> : ''}
                            {item.fields.Title}
                        </a>
                    ))}
                </div> */}
                <div className='ui'>
                    <OrdersList data={data}
                        imagePaths={imagePaths}
                        user={user}
                        departmentName={departmentName}
                        selectedNumber={selectedNumber}
                        handleTabClick={handleTabClick}
                        closed={false}
                        selectedDaysFilter={selectedDaysFilter} />
                    {/*  {data.map((item, index) => {

                        if (activeTab !== index) return null;

                        const fields = item.fields;
                        const imageSrc = imagePaths[fields.Title] && imagePaths[fields.Title] !== 'img/placeholder.jpg'
                            ? imagePaths[fields.Title]
                            : 'img/placeholder.jpg';

                        return (<>
                            <OrderDeatil data={item} imageSrc={imageSrc} user={user} />
                        </>
                        );
                    })} */}
                </div>
            </div>
        );
    };
    const displayLowerMenuData = (data) => {
        return (
            <div className='ui'>
                {data.filter((item) => {
                    const isClosedBool = isDateAWeekOld(item.fields['Created'], selectedDaysFilter);
                    return isClosedBool === closed;
                }).map((item, index) => {
                    if (activeTab !== index) return null;
                    return (
                        <>
                            <OrderLowerMenu
                                itemData={item}
                                selectedNumber={selectedNumber}
                                departmentName={departmentName}
                                user={user}
                                issesListData={issesListData}
                                gpDataInput={gpDataInput}
                                inventoryRef={inventoryRef}
                                reload={reload}
                                setReload={setReload}
                            />
                        </>
                    );
                })}
            </div>
        );
    };

    return (
        <div>
            {error && <div className="ui red message">{error}</div>}
            <QuantityMismatchNags
                quantityOffsets={quantityOffset}
                activeTitle={sharePointData[activeTab]?.fields?.Title}
            />

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
