const OrdersList = ({ data, imagePaths, user, departmentName, selectedNumber, handleTabClick }) => {

  const [currentIndex, setCurrentIndex] = useState(0);


  const key = (item) => {
    const logKey = 'goalProgress-' + `${departmentName + selectedNumber}-${item.fields.Title}`
    const markLine = localStorage.getItem(logKey);
    if (markLine) {
      return true;
    } else {
      return false;
    };
  }

  useEffect(() => {
    handleTabClick(currentIndex);
  }, [currentIndex])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : data.length - 1));

  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < data.length - 1 ? prev + 1 : 0));

  };

  if (!data.length) return <div>No orders to show.</div>;

  const item = data[currentIndex];
  const fields = item.fields;
  const imageSrc =
    imagePaths[fields.Title] && imagePaths[fields.Title] !== 'img/placeholder.jpg'
      ? imagePaths[fields.Title]
      : 'img/placeholder.jpg';

  return (
    <div className="">
      <OrderDeatil data={item} imageSrc={imageSrc} user={user} />
      <div className="ui centered aligned basic segment" style={{ padding: '-40%' }}>
        <button className="ui left labeled icon red button" onClick={handlePrev}>
          <i className="left arrow icon"></i>

        </button>
        <button className="ui right labeled icon black button" onClick={handleNext}>

          <i className="right arrow icon"></i>

        </button>
        {key(item) ? <i class="lock open icon"></i> : departmentName === 'line' ? <i class="lock closed icon"></i> : ''}

      </div>

    </div>
  );
};

