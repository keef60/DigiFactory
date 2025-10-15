const useCachedImages = (items) => {
  const [imagePaths, setImagePaths] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!items || items.length === 0) return;

    let isMounted = true;

    const loadImages = async () => {
      setLoading(true);

      // Load cached paths from IndexedDB
      const cached = (await getSetting('imagePaths')) || {};
      const updatedPaths = { ...cached };

      await Promise.all(
        items.map(async (item) => {
          const title = item?.fields?.Title;
          if (!title) return;

          // Skip if already cached
          if (updatedPaths[title]) return;

          try {
            const imagePath = await getImagePath(title);
            updatedPaths[title] = imagePath;
          } catch (err) {
            console.warn(`Failed to get image for "${title}"`, err);
            updatedPaths[title] = 'img/placeholder.jpg';
          }
        })
      );

      // Save updated paths to IndexedDB and state
      if (isMounted) {
        setImagePaths(updatedPaths);
        saveSetting('imagePaths', updatedPaths).catch((err) =>
          console.warn('Failed to cache image paths:', err)
        );
        setLoading(false);
      }
    };

    loadImages();

    return () => {
      isMounted = false;
    };
  }, [items]);

  return { imagePaths, loading };
};
