//Commit Update
const departmentNames = [
    'handles',
    'frames',
    'packout',
    'paint',
    'eletric',
    'line1', 'line2', 'line3', 'line4', 'line5', 'line6', 'line7', 
    'all'];
const listNames = ['REPORTS', 'PICKLIST', 'FRAME KIT', 'PACKOUT KIT', 'HANDLE KIT']; // Add more as needed

const flattenObject = (obj, prefix = '', res = {}) => {
    if (typeof obj !== 'object' || obj === null) {
        res[prefix] = obj;
        return res;
    }

    if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
            const path = `${prefix}[${index}]`;
            flattenObject(item, path, res);
        });
    } else {
        for (const key in obj) {
            const path = prefix ? `${prefix}.${key}` : key;
            flattenObject(obj[key], path, res);
        }
    }

    return res;
};


const unflattenObject = (flat) => {
    const result = {};

    for (const path in flat) {
        const keys = path
            .replace(/\[(\d+)\]/g, '.$1') // Convert [0] to .0 for easier parsing
            .split('.');

        keys.reduce((acc, key, i) => {
            const isLast = i === keys.length - 1;
            const nextKey = keys[i + 1];

            const isArrayIndex = /^\d+$/.test(nextKey);

            if (isLast) {
                acc[key] = flat[path];
            } else {
                if (!(key in acc)) {
                    acc[key] = isArrayIndex ? [] : {};
                }
            }

            return acc[key];
        }, result);
    }

    return result;
};


const EditSharePointDB = () => {
    const [selectedReportName, setSelectedReportName] = useState('REPORTS');
    const [selectedDepartment, setSelectedDepartment] = useState('handles');
    const [sharePointData, setSharePointData] = useState([]);
    const [editedData, setEditedData] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            const token = sessionStorage.getItem('access_token');
            if (!token) return;

            try {
                const data = await main.fetchSharePointData(
                    selectedReportName,
                    selectedDepartment,
                    true,
                    setSharePointData,
                    () => { }
                );
                if (data?.value) {
                    setSharePointData(data.value);
                }
            } catch (err) {
                setError(err.message);
            }
        };

        fetch();
    }, [selectedReportName, selectedDepartment]);

    const handleFieldChange = (title, dept, key, value) => {
        setEditedData((prev) => ({
            ...prev,
            [title]: {
                ...prev[title],
                [dept]: {
                    ...((prev[title] && prev[title][dept]) || {}),
                    [key]: value,
                },
            },
        }));
    };

    const handleSubmit = async (title, dept, originalData) => {
        // Get the edited flat changes for this title and dept
        const departmentData = editedData[title]?.[dept] || {};

        // Merge original data and edited data
        // 1. Flatten originalData
        const flatOriginal = flattenObject(originalData);
        // 2. Merge edited fields over original fields
        const mergedFlat = { ...flatOriginal, ...departmentData };
        // 3. Unflatten merged data to get nested structure again
        const nestedData = unflattenObject(mergedFlat);

        try {
            await main.handleSubmit(title, nestedData, dept, selectedReportName);
            alert(`✅ Submitted for ${title} - ${dept}`);
            // Optionally clear the editedData for this item/department after submit
            setEditedData(prev => {
                const copy = { ...prev };
                if (copy[title]) {
                    delete copy[title][dept];
                    if (Object.keys(copy[title]).length === 0) {
                        delete copy[title];
                    }
                }
                return copy;
            });
        } catch (err) {
            console.error(err);
            alert(`❌ Failed to submit for ${title} - ${dept}`);
        }
    };

    const departmentsToShow =
        selectedDepartment === 'all' ? departmentNames.filter(d => d !== 'all') : [selectedDepartment];

    return (
        <div className="ui container">
            <h3>Edit SharePoint List Items</h3>

            {error && <div className="ui red message">{error}</div>}

            <div className="ui form">
                <div className="field">
                    <label>Select List</label>
                    <select
                        className="ui dropdown"
                        value={selectedReportName}
                        onChange={(e) => setSelectedReportName(e.target.value)}
                    >
                        {listNames.map((list) => (
                            <option key={list} value={list}>
                                {list}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="field">
                    <label>Select Department</label>
                    <select
                        className="ui dropdown"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                        {departmentNames.map((dept) => (
                            <option key={dept} value={dept}>
                                {dept}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="ui divider" />

            {sharePointData.map((item) => {
                const title = item.fields?.Title;
                if (!title) return null;

                return (
                    <div key={title} className="ui segment">
                        <h4>{title}</h4>

                        {departmentsToShow.map((dept) => {
                            const raw = item.fields?.[dept];
                            if (!raw) return null;

                            let data;
                            try {
                                data = JSON.parse(raw);
                            } catch {
                                return <div key={dept}>Invalid JSON in {dept}</div>;
                            }

                            return (
                                <div key={dept} className="ui segment">
                                    <h5>{dept.toUpperCase()}</h5>
                                    <div className="ui form">
                                        {Object.entries(flattenObject(data)).map(([key, val]) => (
                                            <div className="field" key={key}>
                                                <label>{key}</label>
                                                <input
                                                    type="text"
                                                    value={
                                                        editedData?.[title]?.[dept]?.[key] ?? val ?? ''
                                                    }
                                                    onChange={(e) =>
                                                        handleFieldChange(title, dept, key, e.target.value)
                                                    }
                                                />
                                            </div>
                                        ))}
                                        <button
                                            className="ui primary button"
                                            onClick={() =>
                                                handleSubmit(title, dept, data)
                                            }
                                        >
                                            Submit {dept}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

