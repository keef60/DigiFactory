const { useState, useEffect, useMemo } = React;

const OrdersList = ({
  data,
  imagePaths,
  user,
  departmentName,
  selectedNumber,
  handleTabClick,
  closed,
  selectedDaysFilter
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter data based on closed/open status
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const isClosedBool = isDateAWeekOld(item.fields['Created'], selectedDaysFilter);
      return isClosedBool === closed;
    });
  }, [data, closed, selectedDaysFilter]);

  useEffect(() => {
    handleTabClick(currentIndex);
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : filteredData.length - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev < filteredData.length - 1 ? prev + 1 : 0
    );
  };

  const isItemMarked = (item) => {
    const logKey = `goalProgress-${departmentName + selectedNumber}-${item.fields.Title}`;
    return Boolean(localStorage.getItem(logKey));
  };

  if (!filteredData.length) return <div>No orders to show.</div>;

  const item = filteredData[currentIndex];
  const fields = item.fields;
  const imageSrc =
    imagePaths[fields.Title] && imagePaths[fields.Title] !== 'img/placeholder.jpg'
      ? imagePaths[fields.Title]
      : 'img/placeholder.jpg';

  return (
    <div className="">
      <OrderDeatil
        data={item}
        imageSrc={imageSrc}
        user={user}
      />

      <div className="ui centered aligned basic segment" style={{ padding: '1em' }}>
        <button className="ui left labeled icon red button" onClick={handlePrev}>
          <i className="left arrow icon"></i>
          Previous
        </button>

        <button className="ui right labeled icon black button" onClick={handleNext}>
          Next
          <i className="right arrow icon"></i>
        </button>

        {isItemMarked(item) ? (
          <i className="lock open icon" />
        ) : departmentName === 'line' ? (
          <i className="lock closed icon" />
        ) : null}
      </div>
    </div>
  );
};