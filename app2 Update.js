const { useState } = React;
import PaintEditor from './js/paint_Editor.js'; // Import ExcelEditor component
import PackOutEditor from './js/packout_Editor.js';
import HandlesEditor from './js/handles_Editor.js';


function DepartmentMenu() {
  const [selectedDepartment, setSelectedDepartment] = useState('Paint');

  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department);
  };

  const renderContent = () => {
    if (selectedDepartment === 'Paint') {
      return React.createElement('div', { className: 'ui active' },
        React.createElement('h2', { className: 'ui header', style:{marginTop:'20px'} }, 
          React.createElement('i', { className: 'large icons' }, 
            React.createElement('i', { className: 'bitbucket  icon ' })          ),
          'Paint Department'
        ),
        React.createElement(PaintEditor) // Render ExcelEditor when Paint is selected
      );
    }else if (selectedDepartment === 'Packout') {
      return React.createElement('div', { className: 'ui active ' },
        React.createElement('h2', { className: 'ui header', style:{marginTop:'20px'} }, 
          React.createElement('i', { className: 'large icons' }, 
            React.createElement('i', { className: 'dropbox icon' })          ),
          'Packout Department'
        ),  
        React.createElement(PackOutEditor) // Render ExcelEditor when Paint is selected
       
      );
    }else if (selectedDepartment === 'Handles') {
      return React.createElement('div', { className: 'ui active' },
        React.createElement('h2', { className: 'ui header', style:{marginTop:'20px'} }, 
          React.createElement('i', { className: 'large icons' }, 
            React.createElement('i', { className: 'dolly icon' })          ),
          'Handles Department'
        ),
        React.createElement(HandlesEditor) // Render ExcelEditor when Paint is selected
      );
    } else {
      return React.createElement('div', { className: 'ui container' },
        React.createElement('h2', null, 'No Access Yet'),
        React.createElement('p', null, 'Please contact admin for access to this department.')
      );
    }
  };

  return React.createElement('div', { className: 'ui grid' },
    // Left Sidebar Menu
    React.createElement('div', { className: 'ui left fixed vertical menu inverted grey wide', style: { height: '100%' } },
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
    ),

    // Content Area
    React.createElement('div', { className: 'ui sixteen wide column', style: { marginLeft: '225px' } },
      renderContent()
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(DepartmentMenu));
