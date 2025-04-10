const WarehouseHeaderDetail = ({ imageSrc,sectionType }) => {

    const renderSection = (sectionType) => {
        switch (sectionType) {
          case 'inventory':
            return (
              <div className="ui very padded segment">
                <h1 className="ui header">Inventory Management</h1>
                <div className="ui four column grid">
                  <div className="row">
                    <p className="column"><strong>Stock Tracking</strong></p>
                    <p className="column"><strong>Replenishment Status</strong></p>
                    <p className="column"><strong>Item Condition</strong></p>
                    <p className="column"><strong>Stock Audits</strong></p>
                  </div>
                </div>
              </div>
            );
          case 'order':
            return (
              <div className="ui very padded segment">
                <h1 className="ui header">Order Management</h1>
                <div className="ui four column grid">
                  <div className="row">
                    <p className="column"><strong>Pending Orders:</strong> [Details of pending orders]</p>
                    <p className="column"><strong>Completed Orders:</strong> [Details of completed orders]</p>
                    <p className="column"><strong>Order Processing Time:</strong> [Processing time]</p>
                    <p className="column"><strong>Order Prioritization:</strong> [Priority level]</p>
                  </div>
                </div>
              </div>
            );
          case 'shipment':
            return (
              <div className="ui very padded segment">
                <h1 className="ui header">Shipment & Receiving</h1>
                <div className="ui four column grid">
                  <div className="row">
                    <p className="column"><strong>Received Shipments:</strong> [Details of received shipments]</p>
                    <p className="column"><strong>Shipment Processing Times:</strong> [Processing time]</p>
                    <p className="column"><strong>Delivery Schedule:</strong> [Delivery schedule]</p>
                    <p className="column"><strong>Carrier Management:</strong> [Carrier information]</p>
                  </div>
                </div>
              </div>
            );
          case 'performance':
            return (
              <div className="ui very padded segment">
                <h1 className="ui header">Warehouse Performance</h1>
                <div className="ui four column grid">
                  <div className="row">
                    <p className="column"><strong>Inventory Turnover Rate:</strong> [Rate details]</p>
                    <p className="column"><strong>Shipping Accuracy:</strong> [Accuracy details]</p>
                    <p className="column"><strong>Workforce Efficiency:</strong> [Efficiency details]</p>
                    <p className="column"><strong>Warehouse Utilization:</strong> [Utilization rate]</p>
                  </div>
                </div>
              </div>
            );
          case 'safety':
            return (
              <div className="ui very padded segment">
                <h1 className="ui header">Safety & Compliance</h1>
                <div className="ui four column grid">
                  <div className="row">
                    <p className="column"><strong>Safety Standards:</strong> [Safety standards details]</p>
                    <p className="column"><strong>Workplace Hazards:</strong> [Hazard details]</p>
                    <p className="column"><strong>Regulatory Compliance:</strong> [Compliance status]</p>
                    <p className="column"><strong>Employee Safety Training:</strong> [Training status]</p>
                  </div>
                </div>
              </div>
            );
          case 'workforce':
            return (
              <div className="ui very padded segment">
                <h1 className="ui header">Staff & Workforce Management</h1>
                <div className="ui four column grid">
                  <div className="row">
                    <p className="column"><strong>Employee Shifts:</strong> [Shift details]</p>
                    <p className="column"><strong>Team Assignments:</strong> [Team assignment info]</p>
                    <p className="column"><strong>Workforce Productivity:</strong> [Productivity stats]</p>
                    <p className="column"><strong>Employee Training:</strong> [Training details]</p>
                  </div>
                </div>
              </div>
            );
          case 'equipment':
            return (
              <div className="ui very padded segment">
                <h1 className="ui header">Equipment & Maintenance</h1>
                <div className="ui four column grid">
                  <div className="row">
                    <p className="column"><strong>Equipment Availability:</strong> [Availability status]</p>
                    <p className="column"><strong>Scheduled Maintenance:</strong> [Maintenance schedule]</p>
                    <p className="column"><strong>Breakdowns and Repairs:</strong> [Details]</p>
                    <p className="column"><strong>Equipment Usage Tracking:</strong> [Usage details]</p>
                  </div>
                </div>
              </div>
            );
          case 'technology':
            return (
              <div className="ui very padded segment">
                <h1 className="ui header">Warehouse Technology</h1>
                <div className="ui four column grid">
                  <div className="row">
                    <p className="column"><strong>Automation Systems:</strong> [Automation details]</p>
                    <p className="column"><strong>Inventory Software:</strong> [Software details]</p>
                    <p className="column"><strong>Barcode Scanning:</strong> [Barcode tech]</p>
                    <p className="column"><strong>Warehouse Robotics:</strong> [Robot tech details]</p>
                  </div>
                </div>
              </div>
            );

          default:
             return (
                <div className="ui very padded segment">
                  <h1 className="ui header">Inventory Management</h1>
                  <div className="ui four column grid">
                    <div className="row">
                      <p className="column"><strong>Stock Tracking:</strong> [Details about stock tracking]</p>
                      <p className="column"><strong>Replenishment Status:</strong> [Current replenishment status]</p>
                      <p className="column"><strong>Item Condition:</strong> [Item Condition]</p>
                      <p className="column"><strong>Stock Audits:</strong> [Audit Status]</p>
                    </div>
                  </div>
                </div>
              );
        }
      };
      
    return (
        <>
            <div className="ui horizontal segments">
                <div className="ui center aligned segment">
                    {
                        <img className="ui small rounded image" src={imageSrc} />
                    }
                </div>
                {/* Warehouse Overview */}
                {renderSection(sectionType)}
            </div>
        </>
    );
};
