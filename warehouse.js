const { useState, useEffect } = React


const LocationForm = ({ inventoryRef, searchQueryLifted }) => {
    const [location, setLocation] = useState('');
    const [itemName, setItemName] = useState('');
    const [itemCount, setItemCount] = useState('');
    const [geoLocation, setGeoLocation] = useState(null);
    const [formData, setFormData] = useState(null);
    const [error, setError] = useState('');
    const [content, setContent] = useState([]);
    const refData = useRef([]);
    const itemLocationRef = useRef([]);
    const [itemLocation, setItemLocation] = useState([]);

    // Function to fetch geolocation with high accuracy
    const getGeoLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGeoLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy, // Adding accuracy information
                    });
                },
                (error) => {
                    setError('Error getting geolocation');
                },
                {
                    enableHighAccuracy: true, // Request high accuracy
                    timeout: 5000, // Set a timeout for the geolocation request
                    maximumAge: 0, // Prevent caching of geolocation
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    };

    // Run geolocation on component mount
    useEffect(() => {
        $('.ui.search.inventory')
            .search({
                maxResults: 100,
                source: content,
                onSelect: (r => {
                    setItemName(r.title);
                }),
                onSearchQuery: (itemName => {
                    const queryLower = itemName.toLowerCase();
                    const filteredRows = refData.current.filter(row => {
                        return Object.values(row).some(value => value.toString().toLowerCase().includes(queryLower));
                    });

                    setContent(filteredRows.map(i => { return { title: i['Description'] } }));


                })
            });
        getGeoLocation();

        if (content.length === 0) {
            filterInventory();
            console.log("==================)")
        }

    }, [inventoryRef, content]);

    useEffect(() => {


        $('.ui.search.itemLocation')
            .search({
                maxResults: 100,
                source: itemLocation,
                onSelect: (r => {
                    setLocation(r.title);
                }),
                onSearchQuery: (itemName => {
                    const queryLower = itemName.toLowerCase();
                    const filteredRows = itemLocationRef.current.filter(row => {
                        return Object.values(row).some(value => value.toString().toLowerCase().includes(queryLower));
                    });
                    setItemLocation(filteredRows.map(i => { return { title: i } }));
                    console.log(itemLocation)
                })
            });

        if (itemLocation.length === 0) {
            filterInventory();
            console.log("==================)")
        }

    }, [inventoryRef, itemLocation]);

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (location && itemName && itemCount && geoLocation) {
            setFormData({
                location,
                itemName,
                itemCount,
                geoLocation,
            });
            setError('');
        } else {
            setError('Please fill in all fields and allow geolocation.');
        }
    };

    const filterInventory = () => {
        try {
            let data = inventoryRef !== undefined ? JSON.parse(inventoryRef?.value[0]?.fields?.inventory) : []
            const rows = [];
            const maxLength = Math.max(...Object.values(data).map(arr => arr.length));

            for (let i = 0; i < maxLength; i++) {
                const row = {};
                delete data['Pugatory'];
                delete data['SAGE'];
                delete data['Rplnshmnt Pos'];
                Object.keys(data).forEach(key => {
                    row[key] = data[key][i] || '';  // Handle if the array length is different for keys
                });
                rows.push(row);
            }

            refData.current = rows;

            const uniqueFilteredRows = [...new Set(
                rows
                    .filter(i => i["Where it Goes "] !== '')  // Filter out rows where "Where it Goes" is an empty string
                    .map(i => i["Where it Goes "])  // Map to just the values of "Where it Goes"
            )];

            itemLocationRef.current = uniqueFilteredRows;

        } catch (error) {
            setError(error.message)
        }

    }

    return (
        <div className="ui"
            style={{
                position: 'center',
                marginLeft: '5%',
                width: '90%', // Optional, you can set a specific width if desired
            }}>
            
            <div className="ui segment very padded">
                <h2 className="ui header">Item Location Form</h2>
                {error && <div className="ui negative message">{error}</div>}
                
                <form className="ui form" onSubmit={handleSubmit}>
                    <div class="fields">
                        <div className="field">
                            <label>Location</label>

                            <MiniSearch
                                inventoryRef={inventoryRef}
                                placeholder={'Search Location...'}
                                searchThisClass={'itemLocation'}
                                showMiniSearchOnlyBool={false}

                                />
                            <div class='ui divider '></div>
                            <input
                                type="text"
                                placeholder=" Enter Custom Location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />


                        </div>

                        <div className="field">
                            <label> Name</label>

                            <MiniSearch
                                inventoryRef={inventoryRef}
                                placeholder={'Search Names...'}
                                searchThisClass={'inventory'}
                                showMiniSearchOnlyBool={false}

                                />
                            <div class='ui divider '></div>

                            <input
                                type="text"
                                placeholder="Enter Custom Name"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                            />

                        </div>

                        <div className="field">
                            <label>Count</label>
                            <input
                                type="number"
                                placeholder="Item Count"
                                value={itemCount}
                                onChange={(e) => setItemCount(e.target.value)}
                            />
                        </div>
                    </div>
                    <button className="ui primary button" type="submit">
                        Submit
                    </button>
                </form>


            </div>
            {formData && (
                <div className="ui segment">
                    <h3 className="ui header">Submitted Data:</h3>
                    <p><strong>Location:</strong> {formData.location}</p>
                    <p><strong>Item Name:</strong> {formData.itemName}</p>
                    <p><strong>Item Count:</strong> {formData.itemCount}</p>
                </div>
            )}
        </div>
    );
};




