//Commit Update
const ItemDisplaySideBar = ({
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
    filterTask,
    setFilterTask
})=>{

useEffect(()=>{
  console.log('============================================> ItemDisplaySideBar');
  
},[filterTask]);

useEffect(() => {
  if(filterTask){
    $('.ui.sidebar').sidebar({onHide:(()=>{
      setFilterTask(false)
    })}).sidebar('hide');
   
  }
}, [filterTask])
    return(
        <div
        key={rowIndex}
        className={`ui segment black ${clearLoading ? 'loading' : ''}`}
      >
        <h1 className="ui header">{workDetails[rowIndex]?.wo}</h1>
        <div
          className={`ui message compact ${workDetails[rowIndex]?.dev !== 'DEV - NONE' ? 'red' : 'grey'
            }`}
        >
          <div className="ui sub header">{workDetails[rowIndex]?.dev}</div>
        </div>
        <div className="ui divider" />
        <div className="ui divider hidden" />
        {departmentName === 'line' && (
          <LineSelectionNew 
          selectedNumber={selectedNumber} 
          setSelectedNumber={setSelectedNumber} />
        )}
        <div className="ui grid internally celled">
          <div className="four wide column" style={{ textAlign: 'center' }}>
            {imagePaths[row[0]] && imagePaths[row[0]] !== 'img/default_image.jpg' ? (
              <img
                className="ui fluid image"
                src={imagePaths[row[0]]}
                alt="Loaded Image"
              />
            ) : (
              <div className="ui placeholder">
                <div className="image"></div>
              </div>
            )}

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
          <div
            className="ui sixteen wide column row"
            style={{ padding: '2.5%' }}
          >
            <div className="ui header huge">
              Performance and Goal Monitoring Dashboard
              <div className="ui sub header">{departmentRefName}</div>
            </div>
          </div>
          <div
            className="ui grid sixteen wide column row"
            style={{ padding: '2%' }}
          >
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
          <div
            className="ui sixteen wide column row"
            style={{ padding: '2.5%' }}
          >
            <div className="ui header huge">
              Manufacturing Issues and Action Dashboard
              <div className="ui sub header">{departmentRefName}</div>
            </div>
          </div>
          <div
            className="ui grid sixteen wide column row"
            style={{ padding: '2.5%' }}
          >
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

          </div>

        </div>
      </div>
    )
}