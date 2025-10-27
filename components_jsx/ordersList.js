//Commit Update
const { useState, useEffect, useMemo } = React;

const OrdersList = ({
  data,
  imagePaths,
  user,
  departmentName,
  selectedNumber,
  handleTabClick,
  closed,
  selectedDaysFilter,
  orderState,
  activeTab
}) => {
  const [currentIndex, setCurrentIndex] = useState(activeTab || 0);
  const [orderClosed, setCloseOrder] = useState();

  // Filter data based on closed/open status
  /*  const filteredData = useMemo(() => {
     return data.filter((item) => {
       const isClosedBool = isDateAWeekOld(item.fields['Created'], selectedDaysFilter);
       return isClosedBool === closed;
     });
   }, [data, closed, selectedDaysFilter]); */

  const filteredData = useMemo(() => {
    let currentTitle = null;
    let currentIsActive = null;

    try {
      if (orderState) {
        const parsed = JSON.parse(orderState);
        currentTitle = parsed?.product?.id ?? null;
        currentIsActive = typeof parsed?.isActive === 'boolean' ? parsed.isActive : null;
      }
    } catch (e) {
      console.error('Failed to parse orderState:', e);
      currentTitle = null;
      currentIsActive = null;
    }

    return data.filter(item => {
      if (!item || !item.fields) return false;

      const isClosedBool = isDateAWeekOld(item.fields['Created'], selectedDaysFilter);
      const matchesClosedStatus = isClosedBool === closed;

      // Only filter by title and isActive if both are valid (not null)
      if (currentTitle !== null && currentIsActive !== null) {
        // Make sure item.fields.isActive exists and is boolean
        if (item.fields?.Title === currentTitle && typeof item.fields?.isActive === 'boolean') {
          return matchesClosedStatus && item.fields.isActive === currentIsActive;
        } else {
          // If no match, exclude from filtered results
          return true;
        }
      }

      // If currentTitle or currentIsActive not valid, just filter by closed status
      return matchesClosedStatus;
    });
  }, [data, closed, selectedDaysFilter, orderState]);


  useEffect(() => {
    if (currentIndex !== activeTab) {
      handleTabClick(currentIndex);
    }
  }, [currentIndex]);


  useEffect(() => {

    if (orderState) {
      try {
        setCloseOrder(JSON.parse(orderState).isActive);
      } catch (e) {
        console.error("Failed to parse orderState:", orderState, e);
        setCloseOrder(undefined);
      }
    } else {
      setCloseOrder(undefined);
    }
  }, [currentIndex, orderState]);


  useEffect(() => { }, [orderClosed])
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

  const closeThiOrder = () => {
    setCloseOrder(confirm("Do you want to close this order?"));
    if (orderClosed) {
      const listName = 'REPORTS'
      const orderStateUpdate = JSON.parse(orderState);
      const modelId = filteredData[currentIndex].fields.Title;
      const currentDepartmentName = orderStateUpdate.assignedTo.department
      orderStateUpdate.isActive = false;
      const logUpdatedData = handleLogs(orderStateUpdate).addLog("Order Completed");
      main.handleSubmit(
        modelId,
        logUpdatedData,
        currentDepartmentName,
        listName
      ).then(e => {
        $.toast({
          title: 'Order Updated',
          message: 'The work order has been successfully updated and closed.',
          type: 'success', // or 'info', 'warning', 'error'
          delay: 3000      // time in milliseconds
        });

      }).catch(err => console.log(err));
    } else {

      $.toast({
        title: 'Update Failed',
        message: 'There was an error updating or closing the work order. Please try again.',
        type: 'error',
        delay: 5000
      });

    }
  }

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

        {orderClosed && <button className="ui left circular labeled icon black basic button" onClick={closeThiOrder}>
          Close
          <i className="right times icon"></i>
        </button>}

        {isItemMarked(item) ? (
          <i className="lock open icon" />
        ) : departmentName === 'line' ? (
          <i className="lock closed icon" />
        ) : null}
      </div>
    </div>
  );
};