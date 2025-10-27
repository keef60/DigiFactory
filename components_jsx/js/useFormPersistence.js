//Commit Update
function useFormPersistence(storageKey, initialState) {
  const [formState, setFormState] = useState(initialState);

  // Load saved form state
  useEffect(() => {
    getSetting(storageKey)
      .then((saved) => {
        if (saved != null) {
          if (
            typeof saved === 'object' &&
            typeof initialState === 'object' &&
            !Array.isArray(saved) &&
            !Array.isArray(initialState)
          ) {
            setFormState((prev) => ({ ...prev, ...saved }));
          } else {
            setFormState(saved);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load form state:', err);
      });
  }, [storageKey]);

  // Save form state on every change
  useEffect(() => {
    try {
      saveSetting(storageKey, formState);
    } catch (err) {
      console.error('Failed to save form state:', err);
    }
  }, [formState, storageKey]);

  // Reset function
  const resetForm = () => {
    setFormState(initialState);
    try {
      saveSetting(storageKey, null);
    } catch (err) {
      console.error('Failed to reset form state:', err);
    }
  };

  return [formState, setFormState, resetForm];
}
