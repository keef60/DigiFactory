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
import DetailPaneMini from './components/detailPaneMini.js';
import LookUpTable from './components/lookupTable.js';
import SkillSelect from './components/issesPane.js';
import LinesEditor from './js/line.js';
import LineSelection from './components/chooseLine.js';
import ChartContainer from './components/chart.js';
import InventoryLookup from './js/inventory_Editor.js';
import LoginToken from './js/login.js';
import Dashboard from './components/dashboard.js';

function DepartmentMenu() {

  const [selectedDepartment, setSelectedDepartment] = useState('Reports');
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
    ["Model", "Description", "All of packout kits", "Oil", "Gun", "Lance", "Soap Hose / Filter", "knob bolts", "Hose", "Hose Hanger", "Gun Holder"],
    ['Model #', 'Frame Color', 'Raw Frame', 'Frame #', 'Frame Description', 'Raw Handle', 'Handle', 'Handle Description', 'Raw 2nd Handle', '2nd Handle', '2nd Handle Description']
  ])
  const [generalFrameData, setGeneralFrameData] = useState();
  // State to store the selected number
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false); // State to control login modal visibility
  const [clearLoading, setClearLoading] = useState(true);
  const [ userInfo,setUserInfo] = useState();
  const [isLoggedIn,setIsLoggedIn] = useState(false);
  const [woNdev,setWOnDev] = useState();
  const [userName, setUserName] = useState(undefined);


  useEffect(() => {
    if (!tableData) {

      main.fetchSharePointData('FRAMETABLE', 'all', true, setTableData, '')
        .then(e => e)
        .catch(err => console.log(err.error.message))

      main.fetchSharePointData('PACKOUTTABLE', 'all', true, '', setPackoutTableData)
        .then(e => e)
        .catch(err => console.log(err.error.message));


    } else if (dataLifted.length === 0 && Array.isArray(tableData) && selectedDepartment !== 'Packout') {

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
      setClearLoading(false);


    } else if (dataLifted.length === 0 && Array.isArray(packoutTableData) && selectedDepartment === 'Packout') {

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
      setClearLoading(false);

    }


  }, [tableData, packoutTableData, selectedDepartment])

  useEffect(() => {

    if (selectedDepartment === 'Paint') {
      setDepartmentIcon('certificate')
    } else if (selectedDepartment === 'Packout') {
      setDepartmentIcon('certificate')
    } else if (selectedDepartment === 'Handles') {
      setDepartmentIcon('certificate')
    } else if (selectedDepartment === 'Frames') {
      setDepartmentIcon('certificate');
    } else if (selectedDepartment === 'Lines') {
      setDepartmentIcon('cog');
    }

  }, [selectedDepartment,isLoggedIn])

  useEffect(() => {
    $('.ui.login.dimmer').dimmer()
    getMe()
    setUserName(userInfo?.displayName)
  },[userInfo,isLoggedIn])

  const getMe = async()=>{

     const accessToken = sessionStorage.getItem('access_token');
    try {
      if(!userInfo)
       fetch("https://graph.microsoft.com/v1.0/me", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      .then(response => response.json())
      .then(data => {setUserInfo(data);setIsLoggedIn(true);})
      .catch(error => setIsLoggedIn(false));
    } catch (error) {
      setIsLoggedIn(false);
    }
   
      
}

  const handleDepartmentClick = (department) => {
    setData([])
    setSelectedDepartment(department);
  };

  const renderContent = () => {
    if (selectedDepartment === 'Paint') {

      return React.createElement('div', { className: 'ui ' },

        React.createElement(PaintEditor, {
          spMethod: main,
          pickListApp: PickListApp,
          selectedDepartment: "FRAMES KIT",
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
          lineSelection: LineSelection,
          chart: ChartContainer,
          clearLoading,
          detailPaneMini:DetailPaneMini,
          setWOnDev,
          woNdev

        })
      );
    } else if (selectedDepartment === 'Packout') {
      return React.createElement('div', { className: 'ui ' },

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
          lineSelection: LineSelection,
          chart: ChartContainer,
          clearLoading,
          detailPaneMini:DetailPaneMini,
          setWOnDev,
          woNdev


        })
      );
    } else if (selectedDepartment === 'Handles') {
      return React.createElement('div', { className: 'ui ' },

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
          lineSelection: LineSelection,
          chart: ChartContainer,
          clearLoading,
          detailPaneMini:DetailPaneMini,
          setWOnDev,
          woNdev



        })
      );
    } else if (selectedDepartment === 'Frames') {
      return React.createElement('div', { className: 'ui ' },

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
          lineSelection: LineSelection,
          chart: ChartContainer,
          clearLoading,
          detailPaneMini:DetailPaneMini,
          setWOnDev,
          woNdev


        })
      );
    } else if (selectedDepartment === 'Lines') {
      return React.createElement('div', { className: 'ui ' },

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
          lineSelection: LineSelection,
          selectedNumber,
          setSelectedNumber,
          chart: ChartContainer,
          clearLoading,
          detailPaneMini:DetailPaneMini,
          setWOnDev,
          woNdev


        })
      );
    } else if (selectedDepartment === 'Inventory') {
      return React.createElement('div', { className: 'ui ' },
        React.createElement(InventoryLookup, {
          spMethod: main,
          selectedDepartment: "Inventory",
          departmentName: ['inventory', 'sage'],
          searchQueryLifted,
          clearLoading,
        }))
    } else if (selectedDepartment === 'Reports') {
      return React.createElement('div', { className: 'ui ' },
        React.createElement(Dashboard, {spMethod:main})
      )
    } else {
      return React.createElement('div', { className: 'ui sixteen wide column segment ', style: {
        position: 'absolute',
        top: '60%',
        left: '50%',
        transform: 'translate(-50%, 60%)'
      }
       },
        React.createElement('h2', null, 'No Access Yet'),
        React.createElement(
          'p',
          null,
          'Please contact admin for access to this department. ',
          React.createElement(
            'a',
            { href: `mailto:${userInfo.mail}` },
            userInfo.mail
          )
        )
        
      );
    }
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

  const header = () => {
   return React.createElement('div', null,
      
      React.createElement('h1', { className: 'ui header huge', style: { marginTop: '2%', marginLeft: '3%' } },
        React.createElement('div',{className:'ui  image avatar'},
          React.createElement('img', { 
            className:'',
            src: 'img/logo.jpg', // replace with your image source
            alt: 'Department Image',
          })
        ), `${selectedDepartment}`
      )
    )
    
  };

  const leftMenuBar = () => {
    return React.createElement('div', { className: 'ui left fixed vertical menu   ',/*  style: { margin: ".75%" } */ },
      React.createElement('div', { className: 'item' },
        React.createElement('div', { className: 'ui header' },`${userName?userName:'Not Logged In'}`),
      ),
      topBar(),
      ['Reports', 'Paint', 'Handles', 'Pumps', 'Packout', 'Hose', 'Frames', 'Lines', 'Inventory'].map(department =>
        React.createElement('a', {
          key: department,
          className: `item ${selectedDepartment === department ? 'active' : ''}`,
          onClick: () => { handleDepartmentClick(department); setClearLoading(true); }
        }, department)
      ), // Login button to toggle the login modal
      React.createElement('a', {
        className: ' item ',       

      }, React.createElement('button', { className: `ui ${userName?'red':'primary'} button fluid`, onClick: () =>{ setLoginModalOpen(!loginModalOpen)}, }, `${userName?'Logout':'Login'}`))

    )
  };

  const loginUser = ()=>{

    setIsLoggedIn(true);
    setSelectedDepartment('Paint');
    setUserName(userInfo.displayName);

  }
  // Render the login modal using className
  const loginModal = () => {
    return React.createElement('div', {
      className: `ui page dimmer login ${loginModalOpen ? 'active' : ''}`, // React controls visibility
    },
      React.createElement('div', { className: 'header' }, 'Login'),
      React.createElement('div', { className: 'content' },
        React.createElement(LoginToken, {setIsLoggedIn:loginUser,isLoggedIn:isLoggedIn})
      ),
      React.createElement('div', { className: 'actions' },
        React.createElement('button', {
          className: 'ui red button deny',
          onClick: () => setLoginModalOpen(false)
        }, 'Close')
      )
    );
  };

  return React.createElement('div', { className: 'ui  ' },
    React.createElement('div', {
      className: 'ui grid  contentPane '
    },
      // Left Sidebar Menu
      leftMenuBar(),
      // Content Area with manually created tabs
      React.createElement('div', {
        className: 'ui sixteen wide column',
        style: { marginLeft: '15.5%', "padding-right": '5%', }
      },
        header(),
        renderContent(),
        loginModal()

      )
    ));
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(DepartmentMenu));
