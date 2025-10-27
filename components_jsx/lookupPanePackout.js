//Commit Update
const { useEffect, useRef, useState } = React

const PackoutLookup = ({
  filteredData,
  headers,
  imagePaths,
  getPdfPath,
  openPdfModal,
  openNoteModal,
  setPdfPath,
  setPdfPath2,
  setPdfPath3,
  setNotePath,
  setWorkingThisRow,
  setGoal,
  setProgress,
  goal,
  progress,
  workingThisRow,
  calculateCompletion,
  calculateRemaining,

  departmentName,
  spMethod,
  issue,

  selectedNumber,
  setSelectedNumber,
  issesListData
}) => {
  console.log('look packout Pane');
  const [toggleFilter, setToggleFilter] = useState(true);
  const [filterBtnName, setFilterBtnName] = useState('Hide Weekly Orders');
  const [quickVeiw, setQuickVeiw] = useState(true);
  const [quickVeiwTitle, setQuickVeiwTitle] = useState('Expand Details');
  const departmentRefName = departmentName.charAt(0).toUpperCase() + departmentName.slice(1);

  useEffect(() => {
    $('.ui.checkbox').checkbox();
  }, []);

  const toggle = () => {
    setToggleFilter(!toggleFilter);
    setFilterBtnName(toggleFilter ? 'Show Weekly Orders' : 'Hide Weekly Orders');
  };

  const toggleQuickVeiw = () => {
    setQuickVeiw(!quickVeiw);
    setQuickVeiwTitle(!quickVeiw ? 'Expand Details' : 'View Summary');
  };

  let workDetails = [];
  // Filtered data based on localStorage if toggleFilter is on
  const filteredDataWithStorageCheck =
    toggleFilter && departmentName !== 'paint'
      ? filteredData.filter((row) => {
        const localStorageKey = `goalProgress-${departmentName}-${row[0]}`;
        const storedValue = localStorage.getItem(localStorageKey);
        storedValue !== null && toggleFilter ? workDetails.push(JSON.parse(storedValue)) : '';
        !toggleFilter ? workDetails.push(JSON.parse(storedValue)) : '';
        return storedValue;
      })
      : filteredData;

  return (
    <div className="ui divided items sixteen wide column">
      {/* Filter toggles */}
      <div className="ui segment">
        <h4 className="header">Filter Settings</h4>
        <div className="ui toggle checkbox" style={{ padding: '1%' }} onClick={toggle}>
          <input
            type="checkbox"
            tabIndex="0"
            className="hidden"
            checked={toggleFilter}
            readOnly
          />
          <label>{filterBtnName}</label>
        </div>

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

      {filteredDataWithStorageCheck.map((row, rowIndex) =>
        !quickVeiw ? (
          <div key={rowIndex} className="ui segment black">
            <h1 className="ui header">{workDetails[rowIndex]?.wo}</h1>
            <div className={`ui message compact ${workDetails[rowIndex]?.dev !== 'DEV - NONE' ? 'red' : 'grey'}`}>
              <div className="ui sub header">{workDetails[rowIndex]?.dev}</div>
            </div>
            <div className="ui divider" />
            <div className="ui grid internally celled">
              <div className="four wide column" style={{ textAlign: 'center' }}>
                {imagePaths[row[0]] && imagePaths[row[0]] !== 'img/default_image.jpg' ? (
                  <img className="ui fluid image" src={imagePaths[row[0]]} alt="Loaded Image" />
                ) : (
                  <div className="ui placeholder">
                    <div className="image" />
                  </div>
                )}
                <div className="ui divider hidden" />
                <div className="ui buttons">
                  <button
                    className="ui black small button"
                    onClick={async () => {
                      const [pdf, pdf2, pdf3] = getPdfPath(row);
                      setPdfPath(pdf);
                      setPdfPath2(pdf2);
                      setPdfPath3(pdf3);
                      if (pdf) {
                        openPdfModal(pdf, pdf2, pdf3);
                      } else {
                        alert('PDF not found.');
                      }
                    }}
                  >
                    Drawing
                  </button>
                  <button
                    className="ui small button"
                    onClick={() => {
                      setNotePath(row[0]);
                      openNoteModal();
                    }}
                  >
                    Notes
                  </button>
                </div>
              </div>

              <ChartContainer
                columnSize="six"
                headers={headers}
                row={row}
                departmentName={departmentName}
                selectedNumber={selectedNumber}
                modelId={row[0]}
                progress={progress}
              />

              <div className="ui sixteen wide column row" style={{ padding: '2.5%' }}>
                <div className="ui header huge">
                  Performance and Goal Monitoring Dashboard
                  <div className="ui sub header">{departmentRefName}</div>
                </div>
              </div>

              <div className="ui grid sixteen wide column row" style={{ padding: '2%' }}>
                <DetailPaneNew
                  row={row}
                  workingThisRow={workingThisRow}
                  goal={goal}
                  progress={progress}
                  setWorkingThisRow={setWorkingThisRow}
                  setGoal={setGoal}
                  setProgress={setProgress}
                  calculateCompletion={calculateCompletion}
                  calculateRemaining={calculateRemaining}
                  departmentName={departmentName}
                  spMethod={spMethod}
                  selectedNumber={selectedNumber}

                />
              </div>

              <div className="ui sixteen wide column row" style={{ padding: '2.5%' }}>
                <div className="ui header huge">
                  Manufacturing Issues and Action Dashboard
                  <div className="ui sub header">{departmentRefName}</div>
                </div>
              </div>

              <div className="ui grid sixteen wide column row" style={{ padding: '2.5%' }}>
                <IssueSelectNew
                  spMethod={spMethod}
                  departmentName={departmentName}
                  modelId={row[0]}
                  responseBoxTitle="Issue with Order"
                  selectedNumber={selectedNumber}
                  listName="ISSUES"
                  issueArrayName="issues"
                  issesListData={issesListData}
                />
                <IssueSelectNew
                  spMethod={spMethod}
                  departmentName={departmentName}
                  modelId={row[0]}
                  responseBoxTitle="Maintenance Issue"
                  selectedNumber={selectedNumber}
                  listName="Maintenance"
                  issueArrayName="maintenance"
                  issesListData={issesListData}

                />
              </div>

              {departmentName === 'paint' && <lookuptable headers={headers} row={row} />}
            </div>
          </div>
        ) : (
          <div
            className="ui items segment black"
            style={{ padding: '3%' }}
            key={rowIndex}
          >
            {/* First Item: Image and Details */}
            {departmentName === 'line' && (
              <LineSelectionNew selectedNumber={selectedNumber} setSelectedNumber={setSelectedNumber} />
            )}
            <div className="item" style={{ marginRight: '60px' }}>
              <div className="image" style={{ padding: '.5%' }}>
                {imagePaths[row[0]] && imagePaths[row[0]] !== 'img/default_image.jpg' ? (
                  <img className="ui fluid image" src={imagePaths[row[0]]} alt="Loaded Image" />
                ) : (
                  <div className="ui placeholder">
                    <div className="image" />
                  </div>
                )}
              </div>

              <div className="item">
                <h2 className="header">
                  {row[0]}
                  <div className="ui divider" />
                  <h3 className="ui">{workDetails[rowIndex]?.wo}</h3>
                </h2>

                <div className={`ui message compact small ${workDetails[rowIndex]?.dev !== 'DEV - NONE' ? 'red' : 'grey'}`}>
                  <p className="ui">{workDetails[rowIndex]?.dev}</p>
                </div>
                <div className="ui divider" />
                <div className="content">
                  <h4 className="header">Performance and Goal Monitoring</h4>
                  <div className="meta">
                    <span>{departmentRefName}</span>
                  </div>
                  <div className="extra">
                    <DetailPaneMiniNew
                      row={row}
                      workingThisRow={workingThisRow}
                      goal={goal}
                      progress={progress}
                      setWorkingThisRow={setWorkingThisRow}
                      setGoal={setGoal}
                      setProgress={setProgress}
                      calculateCompletion={calculateCompletion}
                      calculateRemaining={calculateRemaining}
                      departmentName={departmentName}
                      spMethod={spMethod}
                      selectedNumber={selectedNumber}
                      issue={issue}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};


