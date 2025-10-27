//Commit Update
// hooks/useOfflineFallback.js
const OFFLINE_KEY = 'offline-gpDataInput';

 function useOfflineFallback(gpDataInput) {
  const [effectiveData, setEffectiveData] = useState(gpDataInput);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Watch online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist fresh data if valid
  useEffect(() => {
    const isValid = gpDataInput?.reports?.length > 0 && gpDataInput?.materialsPicks?.length > 0;

    if (isValid) {
      saveSetting(OFFLINE_KEY, gpDataInput);
      setEffectiveData(gpDataInput);
    }
  }, [gpDataInput]);

  // Load fallback if needed
  useEffect(() => {
    const loadFallback = async () => {
      const isInvalid = !gpDataInput?.reports?.length || !gpDataInput?.materialsPicks?.length;

      if (isInvalid) {
        const fallback = await getSetting(OFFLINE_KEY);
        if (fallback) {
          setEffectiveData(fallback);
        }
      }
    };

    loadFallback();
  }, [gpDataInput]);

  return { data: effectiveData, isOffline };
}
