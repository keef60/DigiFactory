const { useState, useEffect } = React;

import DisplayPane from './components/displayPane.js';
import FramesEditor from './js/frames_Editor.js';
import PaintEditor from './js/paint_Editor.js'; // Import PaintEditor component
import PackOutEditor from './js/packout_Editor.js';
import HandlesEditor from './js/handles_Editor.js';
import PickListApp from './components/pickList.js';
import { main } from './js/spMethod.js';
import LookupComponent from './components/lookupPane.js'; // Import the new LookupComponent
import PackoutLookup from './components/lookupPanePackout.js';
import TopMenuBar from './components/searchBar.js';
import AddRecordModal from './components/newRecordModal.js';
import DetailPane from './components/detailPane.js';
import LookUpTable from './components/lookupTable.js';
import SkillSelect from './components/issesPane.js';
import LinesEditor from './js/line.js';
import LineSelection from './components/chooseLine.js';
import ChartContainer from './components/chart.js';
function DepartmentMenu() {
  const [selectedDepartment, setSelectedDepartment] = useState('Paint');
  const [departmentIcon, setDepartmentIcon] = useState('certificate');
  // State for handling search query
  const [searchQueryLifted, setSearchQuery] = useState('');
  // State for controlling the visibility of the save warning message
  const [visibleLifted, setVisible] = useState(false);
  const [dataLifted, setData] = useState([]);
  const [sheetNameLifted, setSheetName] = useState('');
  const [tableData, setTableData] = useState(null);
  const [packoutTableData, setPackoutTableData] = useState(null);
  const [tableHeaders, setHeaders] = useState([
    ["Model",	"Description", 	"All of packout kits","Oil","Gun",	"Lance",	"Soap Hose / Filter",	"knob bolts","Hose",	"Hose Hanger",	"Gun Holder"],
    ['Model #', 'Frame Color', 'Raw Frame', 'Frame #', 'Frame Description', 'Raw Handle', 'Handle', 'Handle Description', 'Raw 2nd Handle', '2nd Handle', '2nd Handle Description']
  ])
  const [generalFrameData, setGeneralFrameData] = useState([]);
   // State to store the selected number
   const [selectedNumber, setSelectedNumber] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [headers] = useState(['Name', 'Age', 'Email']);  // Example headers
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (!tableData) {

        main.fetchSharePointData('FRAMETABLE', 'all', true, setTableData,'')
          .then(e => e)
          .catch(err => console.log(err.error.message))
        
        main.fetchSharePointData('PACKOUTTABLE', 'all', true, '',setPackoutTableData)
          .then(e =>e)
          .catch(err => console.log(err.error.message));


    } else if (Array.isArray(tableData) && selectedDepartment !=='Packout') {

      let table = [tableHeaders[1]];
      let arry = [];
      for (let t of tableData) {
        arry = [t.fields.Title]
        for (let i = 1; i <= 10; i++) {
          arry.push(t.fields[`field_${i}`]);
        }
        table.push(arry)
      }
      setData(table);
    } else if (Array.isArray(packoutTableData) && selectedDepartment ==='Packout') {

      let table = [tableHeaders[0]];
      let arry = [];
      for (let t of packoutTableData) {
        arry = [t.fields.Title]
        for (let i = 2; i <= 9; i++) {
          arry.push(t.fields[`field_${i}`]);
        }
        table.push(arry)
      }
      setData(table);

    }


  }, [tableData, packoutTableData,selectedDepartment])


 

  // Handle adding a new record
  const handleAddRecord = (newRecord) => {
    setRecords([...records, newRecord]);

  };

  // Toggle modal visibility
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };


  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department);
  };

  const saveFile = () => {

    try {
      let ws = XLSX.utils.aoa_to_sheet(dataLifted);
      let wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetNameLifted);
      XLSX.writeFile(wb, 'Paint_Open_This_Lastest_File.xlsx');
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save file.');
    }
    setVisible(false);

  };

  useEffect(() => {
    if (selectedDepartment === 'Paint') {
      setDepartmentIcon('certificate')
    } else if (selectedDepartment === 'Packout') {
      setDepartmentIcon('certificate')
    } else if (selectedDepartment === 'Handles') {
      setDepartmentIcon('certificate')
    } else if (selectedDepartment === 'Frames') {
      setDepartmentIcon('certificate');
    }else if (selectedDepartment === 'Lines') {
      setDepartmentIcon('cog');
    }

  }, [selectedDepartment])

  const renderContent = () => {
    if (selectedDepartment === 'Paint') {

      return React.createElement('div', { className: 'ui active' },

        React.createElement(PaintEditor, {
          spMethod: main,
          pickListApp: PickListApp,
          selectedDepartment: "PAINT KIT",
          displayPane: DisplayPane,
          lookupComponent: LookupComponent,
          goalProgressInput: DetailPane,
          departmentName: 'paint',
          searchQueryLifted,
          visibleLifted,
          dataLifted,
          sheetNameLifted,
          setData,
          lookuptable: LookUpTable,
          issue: SkillSelect,
          lineSelection:LineSelection,
          chart:ChartContainer

        })
      );
    } else if (selectedDepartment === 'Packout') {
      return React.createElement('div', { className: 'ui active' },

        React.createElement(PackOutEditor, {
          spMethod: main,
          pickListApp: PickListApp,
          selectedDepartment: "PACKOUT KIT",
          displayPane: DisplayPane,
          lookupComponent: PackoutLookup,
          goalProgressInput: DetailPane,
          departmentName: 'packout',
          searchQueryLifted,
          visibleLifted,
          dataLifted,
          sheetNameLifted,
          setData,
          lookuptable: LookUpTable,
          issue: SkillSelect,
          lineSelection:LineSelection,
          chart:ChartContainer

        })
      );
    } else if (selectedDepartment === 'Handles') {
      return React.createElement('div', { className: 'ui active' },

        React.createElement(HandlesEditor, {
          spMethod: main,
          pickListApp: PickListApp,
          selectedDepartment: "HANDLE KIT",
          displayPane: DisplayPane,
          lookupComponent: LookupComponent,
          goalProgressInput: DetailPane,
          departmentName: 'handles',
          searchQueryLifted,
          visibleLifted,
          dataLifted,
          sheetNameLifted,
          setData,
          lookuptable: LookUpTable,
          issue: SkillSelect,
          lineSelection:LineSelection,
          chart:ChartContainer


        })
      );
    } else if (selectedDepartment === 'Frames') {
      return React.createElement('div', { className: 'ui active' },

        React.createElement(FramesEditor, {
          spMethod: main,
          pickListApp: PickListApp,
          selectedDepartment: "FRAME KIT",
          displayPane: DisplayPane,
          lookupComponent: LookupComponent,
          goalProgressInput: DetailPane,
          departmentName: 'frames',
          searchQueryLifted,
          visibleLifted,
          dataLifted,
          sheetNameLifted,
          setData,
          lookuptable: LookUpTable,
          issue: SkillSelect,
          lineSelection:LineSelection,
          chart:ChartContainer

        })
      );
    } else if (selectedDepartment === 'Lines') {
      return React.createElement('div', { className: 'ui active' },

        React.createElement(LinesEditor, {
          spMethod: main,
          pickListApp: PickListApp,
          selectedDepartment: "LINES KIT",
          displayPane: DisplayPane,
          lookupComponent: LookupComponent,
          goalProgressInput: DetailPane,
          departmentName: 'line',
          searchQueryLifted,
          visibleLifted,
          dataLifted,
          sheetNameLifted,
          setData,
          lookuptable: LookUpTable,
          issue: SkillSelect,
          lineSelection:LineSelection,
          selectedNumber, 
          setSelectedNumber,
          chart:ChartContainer

        })
      );
    } else {
      return React.createElement('div', { className: 'ui container' },
        React.createElement('h2', null, 'No Access Yet'),
        React.createElement('p', null, 'Please contact admin for access to this department.')
      );
    }
  };

  // Render the tabs manually
  const renderTabs = () => {
    const departments = ['Paint', 'Packout', 'Handles', 'Pumps', 'Hose', 'Frames'];

    return React.createElement('div', { className: 'ui top attached tabular menu', style: { position: 'sticky', top: 0, zIndex: 1000, background: 'white' } },
      departments.map(department =>
        React.createElement('a', {
          key: department,
          className: `item ${selectedDepartment === department ? 'active' : ''}`,
          onClick: () => setSelectedDepartment(department)
        }, department)
      )
    );
  };

  const topBar = () => {
    return React.createElement(TopMenuBar, {
      searchQueryLifted,
      setSearchQuery,
      visibleLifted,
      setVisible,
      setData,
      setSheetName,
      selectedDepartment,
      dataLifted,

    })
  };

  /* const newRecordModal = ()=>{
    return React.createElement(AddRecordModal,{ 
      isOpen, 
      headers, 
      onClose, 
      onAddRecord, 
      selectedDepartment
     })
  } */



  const header = () => {
    return React.createElement('div', null,
      React.createElement('h2', { className: 'ui header', style: { marginTop: '20px' } },
        React.createElement('i', { className: 'large icons' },
          React.createElement('i', { className: `${departmentIcon} icon blue mini` })
        ),
        `${selectedDepartment} Department`,
        /*       React.createElement('div', { className: 'sub header ui' },"Centralized Automated Real-Time Reporting: Streamlining Efficiency and Data-Driven Decisions")
         */
      ))
  };

  const leftMenuBar = () => {
    return React.createElement('div', { className: 'ui left fixed vertical menu  ', style: { height: '100%' } },
      React.createElement('div', { className: 'item' },
        React.createElement('img', { className: 'ui avatar image', src: 'img/logo.jpg', alt: 'Logo' }),
        React.createElement('span', {}, 'FNA Dashboard')
      ),
      ['Paint', 'Handles', 'Pumps', 'Packout', 'Hose', 'Frames','Lines'].map(department =>
        React.createElement('a', {
          key: department,
          className: `item ${selectedDepartment === department ? 'active' : ''}`,
          onClick: () => handleDepartmentClick(department)
        }, department)
      )
    )
  };

  return React.createElement('div', { className: 'ui  ' },
    topBar(),
    React.createElement('div', { className: 'ui grid container ' },
      // Left Sidebar Menu
      leftMenuBar(),

      // Content Area with manually created tabs
      React.createElement('div', { className: 'ui sixteen wide column', style: { marginLeft: '15%', "padding-right": '15%', } },
        /* newRecordModal(), */

        header(),

        renderContent(),

      )
    ));
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(DepartmentMenu));
