const { useState, useEffect } = React;

const InventoryLookup = (props) => {
  const { spMethod, selectedDepartment, departmentName, searchQueryLifted,
    clearLoading } = props;

  
  // Inventory data
  const [data, setData] = useState({});
  const [valuePostionInArray,setValuePostionInArray] = useState(0);
  const [slectedTableName,setSlectedTableName] = useState(departmentName[valuePostionInArray])

  // Convert the data to an array of rows, where each row is a position from all keys
  const rows = [];
  const maxLength = Math.max(...Object.values(data).map(arr => arr.length));

  for (let i = 0; i < maxLength; i++) {
    const row = {};
    delete data['Pugatory'];
    delete data['SAGE'];
    delete data ['Rplnshmnt Pos']
    Object.keys(data).forEach(key => {
      row[key] = data[key][i] || '';  // Handle if the array length is different for keys
    });
    rows.push(row);
  }

  // State for filtered rows, current page, and total pages
  const [filteredData, setFilteredData] = useState(rows);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const d = await spMethod.fetchSharePointData(selectedDepartment, slectedTableName, false)
          .then(e => JSON.parse(e.value[valuePostionInArray].fields[slectedTableName]));
        setData(d);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [selectedDepartment, valuePostionInArray]); // Dependencies added for re-fetching when they change

  // useEffect to filter the data when searchQueryLifted changes
  useEffect(() => {
    if (searchQueryLifted) {
      const queryLower = searchQueryLifted.toLowerCase();
      const filteredRows = rows.filter(row => {
        return Object.values(row).some(value => value.toString().toLowerCase().includes(queryLower));
      });
   //console.log(filteredRows)
      setFilteredData(filteredRows);
    } else {
      setFilteredData(rows); // Reset to original rows if no search query
    }
  }, [searchQueryLifted, rows]);

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

  return React.createElement(
    'div',
    { className: `ui segment ${clearLoading? 'loading':''}` },
    React.createElement('div',{className:"ui buttons"},
      React.createElement('button',{className:'ui button black',onClick:()=>{setValuePostionInArray(0);setSlectedTableName(departmentName[0]);}},'Find Item'),
      React.createElement('button',{className:'ui button green',onClick:()=>{setValuePostionInArray(1);setSlectedTableName(departmentName[1]);}},'Sage')
    ),
    React.createElement(
      'table',
      { className: 'ui celled table' },
      React.createElement(
        'thead',
        null,
        React.createElement(
          'tr',
          null,
          Object.keys(data).map((key) =>
            React.createElement('th', { key: key }, key)
          )
        )
      ),
      React.createElement(
        'tbody',
        null,
        currentPageData.map((row, rowIndex) =>
          React.createElement(
            'tr',
            { key: rowIndex },
            Object.keys(row).map((key, colIndex) =>
              React.createElement('td', { key: colIndex }, row[key])
            )
          )
        )
      ),
      React.createElement(
        'tfoot',
        null,
        React.createElement(
          'tr',
          null,
          React.createElement(
            'th',
            { colSpan: '5' },
            React.createElement('div', { className: 'ui right floated pagination menu' },
              React.createElement(
                'a',
                { className: 'icon item', onClick: handlePreviousPage, disabled: currentPage === 1 },
                React.createElement('i', { className: 'left chevron icon' })
              ),
              pageNumbers.map((pageNumber) =>
                React.createElement(
                  'a',
                  {
                    key: pageNumber,
                    className: `item ${currentPage === pageNumber ? 'active' : ''}`,
                    onClick: () => setCurrentPage(pageNumber)
                  },
                  pageNumber
                )
              ),
              React.createElement(
                'a',
                { className: 'icon item', onClick: handleNextPage, disabled: currentPage === totalPages },
                React.createElement('i', { className: 'right chevron icon' })
              )
            )
          )
        )
      )
    )
  );
};

export default InventoryLookup;
