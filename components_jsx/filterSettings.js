
//Commit Update
const FilterSettings = ({ toggle, toggleFilter, filterBtnName, toggleQuickVeiw, quickVeiw, quickVeiwTitle }) => {
  return (
    <div className="ui segment">
      <h4 className="header">Filter Settings</h4>

      {/* Toggle for Filter Button */}
      <div
        className="ui toggle checkbox"
        style={{ padding: '1%' }}
        onClick={toggle}
      >
        <input
          type="checkbox"
          tabIndex="0"
          className="hidden"
          checked={toggleFilter}
          readOnly
        />
        <label>{filterBtnName}</label>
      </div>

      {/* Toggle for Quick View */}
      <div
        className="ui toggle checkbox inline field"
        style={{ padding: '1%' }}
        onClick={toggleQuickVeiw}
      >
        <input
          type="checkbox"
          tabIndex="0"
          className="hidden"
          checked={quickVeiw}
          readOnly
        />
        <label>{quickVeiwTitle}</label>
      </div>
    </div>
  );
};

