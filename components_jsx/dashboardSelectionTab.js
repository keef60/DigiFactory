//Commit Update
const SelectionMenuTab_DashComponent = ({setDepartmentClick,setDepartmentTitle }) => {
    useEffect(() => {
        $('.ui.dropdown.line').dropdown()
    }, []);
    return (<div class='ui segment black'>
        <div className="ui mini secondary  menu">
            <div className="ui item header grey">Department</div>
            {['Paint', 'Handles', 'Pumps', 'Packout', 'Hose', 'Frames', 'Line'].map(department => {
                if (department === 'Line') {
                    return (
                        <div key={department} className="item">
                            <div className="ui dropdown button line">
                                <span className="text">Line</span>
                                <i className="dropdown icon" />
                                <div className="menu">
                                    {[1, 2, 3, 4, 5, 6, 7].map(number =>
                                        <div
                                            key={number}
                                            className="item"
                                            onClick={() => {
                                                setDepartmentClick(`line${number}`);
                                                setDepartmentTitle(`Line ${number}`);
                                            }}
                                        >
                                            {`Line ${number}`}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                }

                return (
                    <a
                        key={department}
                        className={`item`}
                        onClick={() => {
                            setDepartmentClick(department.toLocaleLowerCase());
                            setDepartmentTitle(department);
                        }}
                    >
                        {department}
                    </a>
                );
            })}
        </div></div>
    );


};


