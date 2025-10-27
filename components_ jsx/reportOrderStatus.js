const ReportOrderStatus = ({
    user,
    gpDataInput,
    reload,

}) => {

    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        title: '',
        name: '',
        date: '',
        showCompletedOnly: false,
        workOrderId: '', // 👈 Add this

    });
    const filterComponent = () => {
        return (
            <div className="ui form" style={{ marginBottom: '2em' }}>
                <div className="fields">
                    <div className="field">
                        <label>Model Number</label>
                        <input
                            type="text"
                            placeholder="Enter Model Number"
                            value={filters.title}
                            onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                        />
                    </div>
                    <div className="field">
                        <label>Name</label>
                        <input
                            type="text"
                            placeholder="Search Name"
                            value={filters.name}
                            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                        />
                    </div>
                    <div className="field">
                        <label>Date</label>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                        />
                    </div>
                    <div className="field">
                        <label>Work Order ID</label>
                        <input
                            type="text"
                            placeholder="e.g. WO - 00364617-03"
                            value={filters.workOrderId}
                            onChange={(e) => setFilters({ ...filters, workOrderId: e.target.value })}
                        />
                    </div>

                    <div className="field">
                        <label>&nbsp;</label>
                        <div className="ui checkbox">
                            <input
                                type="checkbox"
                                checked={filters.showCompletedOnly}
                                onChange={(e) => setFilters({ ...filters, showCompletedOnly: e.target.checked })}
                            />
                            <label>Only Completed</label>
                        </div>
                    </div>
                </div>
            </div>

        )
    }

    useEffect(() => {
        $('.menu .item').tab();
    });

    const OMIT_KEYS = new Set([
        "@odata.etag",
        "id",
        "ContentType",
        "EditorLookupId",
        "_UIVersionString",
        "Attachments",
        "Edit",
        "LinkTitleNoMenu",
        "LinkTitle",
        "ItemChildCount",
        "FolderChildCount",
        "_ComplianceFlags",
        "_ComplianceTag",
        "_ComplianceTagWrittenTime",
        "_ComplianceTagUserId",
        "AppAuthorLookupId",
        "AppEditorLookupId",
        "AuthorLookupId",
        "Modified",
        "Created"
    ]);



    useEffect(() => {
        console.log(gpDataInput)
    }, [gpDataInput, reload]);


    const flattenObject = (obj, prefix = '') => {
        const result = {};

        for (const key in obj) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                Object.assign(result, flattenObject(value, newKey));
            } else {
                result[newKey] = Array.isArray(value) ? value.join(', ') : value;
            }
        }

        return result;
    };

    const DataTable = ({ title, data }) => {
        return (
            <div>
                <h3 className="ui header">{title}</h3>
                {data.map((item, index) => {
                    const flatFields = flattenObject(item.fields);
                    return (
                        <table className="ui celled table" key={index} style={{ marginBottom: '2em' }}>
                            <thead>
                                <tr>
                                    <th colSpan="2">Item {index + 1}</th>
                                </tr>
                                <tr>
                                    <th>Key</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(flatFields)
                                    .filter(([key]) => !OMIT_KEYS.has(key))
                                    .map(([key, value], idx) => (
                                        <tr key={idx}>
                                            <td>{key}</td>
                                            <td>{value}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    );
                })}
            </div>
        );
    };

    const displayUpperMenuData = ({ matchKey = 'Title' } = {}) => {
        const arrayKeys = Object.keys(gpDataInput).filter(k => Array.isArray(gpDataInput[k]));
        const groupedByTitle = {};
        const allFieldKeys = new Set();
        // Group data by Title and gather all field keys
        arrayKeys.forEach(source => {
            gpDataInput[source].forEach(entry => {
                const flat = flattenObject(entry.fields);
                const title = flat[matchKey];
                if (!title) return;

                if (!groupedByTitle[title]) groupedByTitle[title] = [];
                groupedByTitle[title].push(flat);

                Object.keys(flat).forEach(key => {
                    if (!OMIT_KEYS.has(key) && key !== matchKey) {
                        allFieldKeys.add(key);
                    }
                });
            });
        });

        const sortedTitles = Object.keys(groupedByTitle)
            .filter((title) => {
                const rowDataList = groupedByTitle[title];

                // Filter by title
                if (filters.title && !title.includes(filters.title)) {
                    return false;
                }

                // Filter by name (look inside team.lead.name or team.supervisor.name)
                if (filters.name) {
                    const nameLower = filters.name.toLowerCase();
                    const nameMatch = rowDataList.some(data => {
                        return Object.keys(data).some(key => {
                            try {
                                const parsed = JSON.parse(data[key]);
                                const leadName = parsed?.team?.lead?.name?.toLowerCase() || '';
                                const supName = parsed?.team?.supervisor?.name?.toLowerCase() || '';
                                return leadName.includes(nameLower) || supName.includes(nameLower);
                            } catch { return false; }
                        });
                    });

                    if (!nameMatch) return false;
                }

                // Filter by Work Order ID
                if (filters.workOrderId) {
                    const woMatch = rowDataList.some(data => {
                        return Object.keys(data).some(key => {
                            if (OMIT_KEYS.has(key) || key === 'Title') return false;
                            try {
                                const parsed = JSON.parse(data[key]);
                                const woId = parsed?.workOrder?.id || '';
                                return woId.toLowerCase().includes(filters.workOrderId.toLowerCase());
                            } catch { return false; }
                        });
                    });

                    if (!woMatch) return false;
                }

                // Filter by date
                if (filters.date) {
                    const dateMatch = rowDataList.some(data => {
                        return Object.keys(data).some(key => {
                            try {
                                const parsed = JSON.parse(data[key]);
                                const created = parsed?.['creation date'];
                                if (created) {
                                    const parsedDate = new Date(created).toISOString().split('T')[0];
                                    return parsedDate === filters.date;
                                }
                            } catch { return false; }
                        });
                    });

                    if (!dateMatch) return false;
                }

                // Filter by completion status
                if (filters.showCompletedOnly) {
                    const allCompleted = rowDataList.every(data => {
                        return Object.keys(data).every(key => {
                            if (OMIT_KEYS.has(key) || key === 'Title') return true;
                            try {
                                const parsed = JSON.parse(data[key]);
                                if (parsed?.goal !== undefined && parsed?.progress !== undefined) {
                                    return parseInt(parsed.goal) === parseInt(parsed.progress);
                                }
                            } catch { }
                            return false;
                        });
                    });

                    if (!allCompleted) return false;
                }

                return true;
            })
            .sort();

        // Render step component per field key
        const renderSteps = (rowDataList) => {
            const presentDepartments = new Set();

            // Flatten all fields from the row’s entries
            rowDataList.forEach(data => {
                Object.keys(data).forEach(key => {
                    if (!OMIT_KEYS.has(key) && key !== 'Title') {
                        presentDepartments.add(key);
                    }
                });
            });

            const sortedDepartments = Array.from(presentDepartments).sort();

            return (
                <div className="ui ordered stackable circular steps">
                    {sortedDepartments.map((deptKey, idx) => {
                        let status = 'Waiting for order to start';
                        let className = 'step';

                        // Try to extract goal and progress from the JSON string
                        let goal = null;
                        let progress = null;

                        for (const data of rowDataList) {
                            if (data[deptKey]) {
                                try {
                                    const parsed = JSON.parse(data[deptKey]);

                                    if (typeof parsed === 'object') {
                                        // If it has goal/progress keys, it’s order data
                                        if ('goal' in parsed && 'progress' in parsed) {
                                            goal = parseInt(parsed.goal);
                                            progress = parseInt(parsed.progress);
                                        }
                                    }
                                } catch (err) {
                                    console.warn(`Failed to parse ${deptKey}:`, err);
                                }
                            }
                        }

                        // Decide status
                        if (goal !== null && progress !== null) {
                            if (progress === 0 && goal > 0) {
                                status = 'Order confirmed';
                                className = 'active step';
                            } else if (progress > 0 && progress < goal) {
                                status = 'WIP';
                                className = 'active step';
                            } else if (progress === goal && goal > 0) {
                                status = 'Order complete';
                                className = 'completed step';
                            }
                        } else {
                            // No goal/progress — just picks? Still active step
                            className = 'active step';
                        }

                        return (
                            <div className={className} key={idx}>
                                <div className="content">
                                    <div className="title">{deptKey}</div>
                                    <div className="description">{status}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        };


        return (
            <div>
                {filterComponent()}
                <h3 className="ui header"> Order Status Verification</h3>
                <table className="ui celled table selectable striped ">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTitles.map((title, idx) => {
                            const rowDataList = groupedByTitle[title];

                            return (
                                <tr key={idx}>
                                    <td>{title}</td>
                                    <td>{renderSteps(rowDataList)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };


    const displayUpperMenuData1 = ({ matchKey = 'Title' }) => {
        const arrayKeys = Object.keys(gpDataInput).filter(k => Array.isArray(gpDataInput[k]));
        const mergedMap = new Map();
        const allFields = new Set();

        // Map of [Title -> { [source]: flatFields }]
        const groupedByTitle = {};

        arrayKeys.forEach(source => {
            gpDataInput[source].forEach(item => {
                const flat = flattenObject(item.fields);
                const title = flat[matchKey];
                if (!title) return;

                if (!groupedByTitle[title]) groupedByTitle[title] = {};
                groupedByTitle[title][source] = flat;

                Object.keys(flat).forEach(k => {
                    if (!OMIT_KEYS.has(k) && k !== matchKey) {
                        allFields.add(k);
                    }
                });
            });
        });

        const sortedTitles = Object.keys(groupedByTitle).sort();
        const columns = [matchKey, ...Array.from(allFields).sort()];

        // UI rendering
        return (
            <div>
                <h3 className="ui header">Field Presence Summary Table</h3>
                <table className="ui celled table">
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTitles.map((title, rowIndex) => {
                            const dataBySource = groupedByTitle[title];

                            return (
                                <tr key={rowIndex}>
                                    {columns.map((col, colIndex) => {
                                        if (col === matchKey) {
                                            return <td key={colIndex}>{title}</td>;
                                        }

                                        const presentIn = arrayKeys.filter(
                                            source => dataBySource[source] && dataBySource[source][col] !== undefined
                                        );

                                        if (presentIn.length === arrayKeys.length) {
                                            return <td key={colIndex}>✅</td>;
                                        }

                                        const missingIn = arrayKeys.filter(source => !presentIn.includes(source));

                                        if (presentIn.length === 0) {
                                            return <td key={colIndex}>❌ {missingIn.join(', ')}</td>;
                                        }

                                        return <td key={colIndex}>{missingIn.join(', ')}</td>;
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div>
            {error && <div className="ui red message">{error}</div>}


            {gpDataInput ? (
                <div id="sharePointData" className={`ui segment`}>
                    {!error ?
                        displayUpperMenuData()
                        : 'No data'}
                </div>
            ) : (
                <h1>No items found in the list.
                </h1>
            )}

        </div>
    );

};
