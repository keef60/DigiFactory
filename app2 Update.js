const { useState, useEffect } = React;

import DisplayPane from './components/displayPane.js';
import FramesEditor from './js/frames_Editor.js';
import PaintEditor from './js/paint_Editor.js'; // Import PaintEditor component
import PackOutEditor from './js/packout_Editor.js';
import HandlesEditor from './js/handles_Editor.js';
import PickListApp from './components/pickList.js';
import { githubAPI } from './js/gitDb.js';
import LookupComponent from './components/lookupPane.js'; // Import the new LookupComponent
import PackoutLookup from './components/lookupPanePackout.js';
import GoalProgressInput from './components/goalAndProgress.js';
import TopMenuBar from './components/searchBar.js';
import AddRecordModal from './components/newRecordModal.js';
import DetailPane from './components/detailPane.js';

function DepartmentMenu() {
  const [selectedDepartment, setSelectedDepartment] = useState('Paint');
  const [departmentIcon, setDepartmentIcon] = useState('bitbucket');

  // State for handling search query
  const [searchQueryLifted, setSearchQuery] = useState('');
  // State for controlling the visibility of the save warning message
  const [visibleLifted, setVisible] = useState(false);
  const [dataLifted, setData] = useState([]);
  const [sheetNameLifted, setSheetName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [headers] = useState(['Name', 'Age', 'Email']);  // Example headers
  const [records, setRecords] = useState([]);

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
      setDepartmentIcon('bitbucket')
    } else if (selectedDepartment === 'Packout') {
      setDepartmentIcon('bitbucket')
    } else if (selectedDepartment === 'Handles') {
      setDepartmentIcon('bitbucket')
    } else if (selectedDepartment === 'Frames') {
      setDepartmentIcon('bitbucket');
    }

  }, [selectedDepartment])

  const renderContent = () => {
    if (selectedDepartment === 'Paint') {

      return React.createElement('div', { className: 'ui active' },

        React.createElement(PaintEditor, {
          gAFucntion: githubAPI,
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
          setData
        })
      );
    } else if (selectedDepartment === 'Packout') {
      return React.createElement('div', { className: 'ui active' },

        React.createElement(PackOutEditor, {
          gAFucntion: githubAPI,
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
          setData

        })
      );
    } else if (selectedDepartment === 'Handles') {
      return React.createElement('div', { className: 'ui active' },

        React.createElement(HandlesEditor, {
          gAFucntion: githubAPI,
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
          setData


        })
      );
    } else if (selectedDepartment === 'Frames') {
      return React.createElement('div', { className: 'ui active' },

        React.createElement(FramesEditor, {
          gAFucntion: githubAPI,
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
          setData

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
      dataLifted
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
    return React.createElement('h2', { className: 'ui header', style: { marginTop: '20px' } },
      React.createElement('i', { className: 'large icons' },
        React.createElement('i', { className: `${departmentIcon} icon` })
      ),
      `${selectedDepartment} Department`
    )
  };

  const leftMenuBar = () => {
    return React.createElement('div', { className: 'ui left fixed vertical menu  ', style: { height: '100%' } },
      React.createElement('div', { className: 'item' },
        React.createElement('img', { className: 'ui avatar image', src: 'img/logo.jpg', alt: 'Logo' }),
        React.createElement('span', {}, 'FNA Dashboard')
      ),
      ['Paint', 'Handles', 'Pumps', 'Packout', 'Hose', 'Frames'].map(department =>
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
