//Commit Update
const HomeScreen = () => {
  return (
    <div className="ui segment no-border no-padding">
      {/* Hero Section */}
      <div className="ui vertical  segment hero-section center aligned">
        <div className="ui text container">
          <img
            src={`./img/cartr.png`} // or "/cartr-logo.png" if using public folder
            alt="CARTr Logo"
            className="cartr-logo"
          />
          <h1 className="ui  huge header">Smarter Manufacturing Starts Here</h1>
          <h4 className="ui  header">
            Real-Time Insights for Industrial Operations
          </h4>
          <p className="ui  large text">
            Empower your factory with centralized, automated reporting built for efficiency and control.
          </p>
          <button className="ui huge orange button">
            <i className="industry icon"></i>
            Explore the Platform
          </button>
        </div>
      </div>

    </div>
  );
};
