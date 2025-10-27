//Commit Update
const { useEffect, useRef, useState } = React

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  visible,
  setVisible,
  setData,
  setSheetName,
  selectedDepartment,
  saveFile,
  notMenuSearch,
  liftedData
}) => {
  const [searchThisData, setSearchThisData] = useState([]);


  const getSearchData = () => {
  
    const keys = Object.keys(localStorage);
    let holdThisAnd = [];
    keys.forEach(key => {
      if (key.includes('goalProgress')) {
        const i = JSON.parse(localStorage.getItem(key));
        i.model = key.split('-')[2];
        i.department = key.split('-')[1];
        holdThisAnd.push({
          title: i.model,
          category: i.department.toUpperCase(),
          data:i
        });
      }
    });
    setSearchThisData(holdThisAnd);

  }
  useEffect(() => {

    if (searchThisData.length === 0) { 
      getSearchData(); 
    }
    $('.ui.search')
      .search({
        type: 'category',
        source: searchThisData,
        onSelect:(r =>{
          setSearchQuery(r.title);
        })
      });

    

  }, [searchThisData]);



  // Handlers for file upload and saving
  const handleFileUpload = (event) => {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = (e) => {
      try {
        let workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        let firstSheet = workbook.SheetNames[0];
        setSheetName(firstSheet);
        let worksheet = workbook.Sheets[firstSheet];
        let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        console.log(jsonData);
        setData(jsonData);
      } catch (error) {
        console.error('Error reading file:', error);
        alert('Failed to load Excel file. Please check the file format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleClose = () => {
    setVisible(false);
  };

  const openModal = () => {
    $(`.addRecord.small.modal.${selectedDepartment.toLowerCase()}`).modal('show');
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };


  return (
    <div className="ui top attached" style={{ background: 'white' }}>

      {/* Save Warning Message */}
      {visible && (
        <div className="ui icon message yellow compact small">
          <i className="close icon" onClick={handleClose} />
          <i className="warning circle icon" />
          <div className="content">
            <div className="header">Remember to save your data!</div>
            <p>Your changes will be lost if you refresh the page without saving.</p>
            <button
              className="ui button yellow"
              onClick={() => {
                saveFile();
                handleClose();
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Right Search Menu */}
      

        <div className={`ui category  search ${notMenuSearch ? '  ' : 'item'} `} style={notMenuSearch ? { marginLeft: '50%',padding:".5%",width:'400px'} : {}}>
          <div className="ui icon input">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="prompt"
            />
            <i className="search link icon" />
          </div>
          <div className="results" />
        </div>
      </div>
 
  );
};


