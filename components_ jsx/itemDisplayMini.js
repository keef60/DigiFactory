const ItemDisplayMini = ({
  selectedNumber,
  setSelectedNumber,
  imagePaths,
  row,
  workDetails,
  rowIndex,
  departmentRefName,
  workingThisRow,
  goal,
  progress,
  setWorkingThisRow,
  setGoal,
  setProgress,
  calculateCompletion,
  calculateRemaining,
  departmentName,
  spMethod,
  headers,
  issesListData,
  clearLoading,
  getPdfPath,
  openPdfModal,
  openNoteModal,
  setPdfPath,
  setPdfPath2,
  setPdfPath3,
  setNotePath,
  setFilterTask, filterTask
}) => {

  const [thisIsNew, setThisIsNew] = useState({});

  function is24HoursOld(dateString) {
    // Parse the input date string into a Date object
    const inputDate = new Date(dateString);

    // Get the current time
    const currentTime = new Date();

    // Calculate the time difference in milliseconds
    const timeDifference = currentTime - inputDate;

    // Calculate the difference in milliseconds
    const hours = timeDifference / (1000 * 60 *60 ); // convert to hours

    switch (true) {
        case (hours >= 96):
            return { status: true, message: `Older`,color:'red' };
        case (hours <= 48 && 25 <= hours):
            return { status: true, message: `Yesterday`,color:'green' };
        case (hours <= 24 && 0 <= hours):
            return { status: true, message: `Today`,color:'yellow' };
        default:
            return { status: false, message: '',color:'' };
    }

}

  const labelNew = () => {
    const keys = Object.keys(localStorage);
    keys.forEach((key, index) => {
      const data = key.includes('goalProgress-');
      if (data) {
        const bool = key.split('-')[2] === row[0] && key.split('-')[1] === departmentName;
        const info = bool && JSON.parse(localStorage.getItem(key));

        info['creation date'] && console.log(is24HoursOld(info['creation date']), index);
        info['creation date'] && setThisIsNew(is24HoursOld(info['creation date']));
      }
    });

  }

  useEffect(() => {
    labelNew();
  }, [])

  return (
    <div
      className={`ui items segments horizontal  ${thisIsNew.status ? thisIsNew.color : 'black'}`}

      key={rowIndex}
    >
      {
        thisIsNew.status && <div class={`ui top left attached label  ${thisIsNew.status ? thisIsNew.color : 'black'}`}>
          <i class='certificate icon'></i>{thisIsNew.message}
        </div>
      }
      {/* Image */}
      <div class='ui segment'>
        {departmentName === 'line' && (
          <LineSelectionNew
            selectedNumber={selectedNumber}
            setSelectedNumber={setSelectedNumber} />
        )}
        <div className="image" style={{ padding: '.5%', }}>
          {imagePaths[row[0]] && imagePaths[row[0]] !== 'img/default_image.jpg' ? (
            <img
              className="ui small image"
              src={imagePaths[row[0]]}
              alt="Loaded Image"
            />
          ) : (
            <div className="ui placeholder">
              <div className="image"></div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Section - Displays essential information related to the work order */}
      <div className='ui segment'>

        {/* Section Title: Model Number */}
        <h4 className="header">Model Number:<p className="ui text">{row[0]} </p></h4>

        {/* Section Title: Work Order Routing Number */}
        <h4 className="ui header">Work Order Number:  <p className="ui text">{workDetails[rowIndex]?.wo.replace('WO -', '')}</p></h4>


        {/* Section Title: Work Order Deviations */}
        <h4 className="ui header">Deviations:</h4>
        <div
          className={`ui message compact mini ${!workDetails[rowIndex]?.dev.includes('NONE') ? 'red' : 'grey'
            }`}
        >
          <p className="ui text">
            {workDetails[rowIndex]?.dev} {/* Displays any work order deviations, if present */}
          </p>
        </div>
      </div>

      {/* Order Status Widgets */}
      <div class='ui segment'>
        <h4 className="header">Performance and Goal Monitoring</h4>
        <span>{departmentRefName}</span>
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
        />
        <ShopFloorTimer
          selectedNumber={selectedNumber}
          setSelectedNumber={setSelectedNumber}
          imagePaths={imagePaths}
          row={row}
          workDetails={workDetails}
          rowIndex={rowIndex}
          departmentRefName={departmentRefName}
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
          headers={headers}
          issesListData={issesListData}
          clearLoading={clearLoading}
          getPdfPath={getPdfPath}
          openPdfModal={openPdfModal}
          openNoteModal={openNoteModal}
          setPdfPath={setPdfPath}
          setPdfPath2={setPdfPath2}
          setPdfPath3={setPdfPath3}
          setNotePath={setNotePath}
          setFilterTask={setFilterTask}
          filterTask={filterTask} />
      </div>

    </div>
  )
}
