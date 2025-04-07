const { useEffect, useRef, useState } = React

const InventoryLookup = ({
  selectedDepartment,
  departmentName,
  searchQueryLifted,
  inventoryRef,
  settings,
  setSearchQuery
}) => {

  // Inventory data
  const [data, setData] = useState({});
  const [valuePostionInArray, setValuePostionInArray] = useState(0);
  const [selectedTableName, setSelectedTableName] = useState(departmentName[valuePostionInArray]);

  // Convert the data to an array of rows, where each row is a position from all keys
  const rows = [];
  const maxLength = Math.max(...Object.values(data).map(arr => arr.length));

  for (let i = 0; i < maxLength; i++) {
    const row = {};
    delete data['Pugatory'];
    delete data['SAGE'];
    delete data['Rplnshmnt Pos'];
    Object.keys(data).forEach(key => {
      row[key] = data[key][i] || '';  // Handle if the array length is different for keys
    });
    rows.push(row);
  }

  // State for filtered rows, current page, and total pages
  const [filteredData, setFilteredData] = useState(rows);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const d = JSON.parse(inventoryRef.value[valuePostionInArray].fields[selectedTableName])
        setData(d);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [selectedDepartment, valuePostionInArray, inventoryRef]); // Dependencies added for re-fetching when they change

  // useEffect to filter the data when searchQueryLifted changes
  useEffect(() => {
    if (searchQueryLifted) {
      const queryLower = searchQueryLifted.toLowerCase();
      const filteredRows = rows.filter(row => {
        return Object.values(row).some(value => value.toString().toLowerCase().includes(queryLower));
      });
      setFilteredData(filteredRows);
    } else {
      setFilteredData(rows); // Reset to original rows if no search query
    }
  }, [searchQueryLifted, rows]);

  useEffect(() => {
    $('.menu.item').tab();
    $('.ui.item').tab();
    $('.ui.dropdown.inventory').dropdown({ allowAdditions: true });

  });

  // Get current page's data
  const currentPageData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Total number of pages
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Handle next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle previous page
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Get the page numbers to display (up to 10)
  const pageNumbers = [];
  const range = 5; // Show 5 pages before and after the current page
  let startPage = Math.max(currentPage - range, 1);
  let endPage = Math.min(currentPage + range, totalPages);

  // Ensure we only show 10 page numbers at most
  if (endPage - startPage + 1 < 10) {
    if (startPage === 1) {
      endPage = Math.min(10, totalPages);
    } else if (endPage === totalPages) {
      startPage = Math.max(totalPages - 9, 1);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  // Filter page size 
  const filterPageSize = () => {
    const filterSizes = [5, 10, 20, 50, 100];
    return (
      <div class="ui compact menu">
        <div class="ui simple dropdown item">
          Filter
          <i class="dropdown icon"></i>
          <div class="menu">
            {
              filterSizes.map(i => {
                return <div class="item" onClick={() => { setPageSize(i) }}>{i}</div>
              })
            }
          </div>
        </div>
      </div>
    )
  }
  return (
    <div
      className="ui"
      style={{
        position: 'center',
        marginLeft: '5%',
        width: '90%', // Optional, you can set a specific width if desired
      }}
    >
      <div className={`ui segment basic ${!inventoryRef ? 'loading' : ''} sixteen wide column`}>

        <div className="ui top attached menu">
          <div className="item">
            <button className="ui button black" onClick={() => {
              setValuePostionInArray(0);
              setSelectedTableName(departmentName[0]);
            }}>
              Location
            </button>

          </div>
          <div className="item">
            <button
              className="ui button green"
              onClick={() => {
                setValuePostionInArray(1);
                setSelectedTableName(departmentName[1]);
              }}
            >
              On-Hand
            </button>
          </div>
          <div className="item">
            {filterPageSize()}
          </div>
          <MiniSearch
            inventoryRef={inventoryRef}
            searchThisData={selectedTableName}
            setSearchQuery={setSearchQuery}
            searchThisClass={'inventoryLookUp'}
            showMiniSearchOnlyBool={true} />
        </div>

        <div className="ui bottom attached segment">
          <table className="ui celled table">
            <thead>
              <tr>
                {Object.keys(data).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.keys(row).map((key, colIndex) => (
                    <td key={colIndex}>{row[key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={Object.keys(data).length}>
                  <div className="ui right floated pagination menu">
                    <a
                      className="icon item"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      <i className="left chevron icon" />
                    </a>
                    {pageNumbers.map((pageNumber) => (
                      <a
                        key={pageNumber}
                        className={`item ${currentPage === pageNumber ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </a>
                    ))}
                    <a
                      className="icon item"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      <i className="right chevron icon" />
                    </a>
                  </div>
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};


