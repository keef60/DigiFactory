function useIndexedFetch(key, fetchFunction, { skip = false } = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (skip) return;

        let cancelled = false;

        const loadData = async () => {
            setLoading(true);

            // First try to load cached data
            const cached = await getSetting(key);
            if (cached && !cancelled) {
                setData(cached);
            }

            try {
                const fresh = await fetchFunction();
                if (!cancelled && fresh) {
                    setData(fresh);
                    saveSetting(key, fresh); // Cache the latest
                }
            } catch (err) {
                console.warn(`Fetch failed for key "${key}".`, err);
                if (!cached && !cancelled) {
                    setError(err);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            cancelled = true;
        };
    }, [key, fetchFunction, skip]);

    return { data, loading, error };
}
