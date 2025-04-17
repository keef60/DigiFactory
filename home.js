const HomeScreen = () => {
    return (
      <div className="ui segment">
  
        {/* Hero Section */}
        <div className="ui vertical segment hero-section">
          <div className="ui container center aligned text">
            <h1 className="ui huge header">Welcome to CARTr</h1>
            <h4 className="ui header">
              Centralized Automated Real-Time Reporting
            </h4>
            <p className="ui large text">
              Simple tools for smarter, faster decisions.
            </p>
            <button className="ui big black button">
              Get Started
              <i className="right arrow icon"></i>
            </button>
          </div>
        </div>
  
        {/* Info Section */}
        <div className="ui vertical segment info-section">
          <div className="ui container">
            <div className="ui stackable grid">
              <div className="column">
                <h3 className="ui header">Smarter Manufacturing</h3>
                <p>
                  Keep track of performance in real-time, reduce downtime,
                  and make data-driven decisions—effortlessly.
                </p>
              </div>
            </div>
          </div>
        </div>
  
      </div>
    );
  };
  