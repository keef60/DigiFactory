const goalProgressJSONCreation = (item, departmentName) => {
    // Get the start and end of the current week
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const daysToStartOfWeek = currentDay === 0 ? 6 : currentDay - 1; // Get days to Monday
    const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - daysToStartOfWeek));
    startOfWeek.setHours(0, 0, 0, 0); // Start of week at midnight

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (Sunday)
    endOfWeek.setHours(23, 59, 59, 999); // End of week just before midnight
    
    const fields = item.fields;
    const runQuantity = fields.Quantity
    const title = fields.Title;  // Assuming the title field is here 
    const workOrder = fields['WO'];
    const deviations = fields['DEV'];
    const key = 'goalProgress-' + `${departmentName}-${title}`
    // Generating a timestamp for the record
    const timestamp = new Date().toISOString();

    // Check if the record already exists in localStorage
    const existingGoalProgress = localStorage.getItem(key);


    // If the record exists, check its timestamp and isActive
    if (existingGoalProgress) {
        const existingData = JSON.parse(existingGoalProgress);
        const existingTimestamp = new Date(existingData["creation date"]);

        // If it's active, check if the timestamp is within the current week
        if (existingData.isActive === true) {
            // If the timestamp is outside the current week, set isActive to false
            if (existingTimestamp < startOfWeek || existingTimestamp > endOfWeek) {
                existingData.isActive = false;
                // Update localStorage with isActive set to false
                localStorage.setItem(key, JSON.stringify(existingData));
            }
            return; // Skip adding the new record if the existing record is active
        }
    }

    // Create the object to store in localStorage if not exists or if it's inactive
 /*    const goalProgressData = {
        goal: runQuantity,
        progress: "0",
        "creation date": timestamp,
        isActive: true,
        wo: workOrder,
        dev: deviations
    }; */

    const goalProgressData = {
        goal: runQuantity, // Total quantity to be produced
        progress: 0, // Quantity produced so far
        "creation date": timestamp, // ISO string or timestamp
        isActive: false, // Is the order still running?
        workOrder: {
          id: workOrder,
          reference: null,
          status: null,
          priority: null,
          dueDate: null
        },
        deviations: deviations, // Array of any deviations or issues
        machine: {
          id: null,
          name: null,
          operator: null
        },
        product: {
          id: fields.Title,
          name:null,
        },
        logs: []
      };
    

    // Store the object in localStorage
    localStorage.setItem(key, JSON.stringify(goalProgressData));
}

// 📚 Predefined Manufacturing Events
const manufacturingEvents = [
    // OrderLifecycle
    "Order Created",
    "Order Validated",
    "Order Queued",
    "Order Scheduled",
    "Order Updated",
    "Order Cancelled",
    "Order On Hold",
    "Order Released",
    "Order Completed",
    "Order Archived",
  
    // Production Workflow
    "Assigned to Machine",
    "Assigned to Operator",
    "Setup Started",
    "Setup Completed",
    "Production Started",
    "Production Paused",
    "Production Resumed",
    "Production Completed",
    "Job Changeover Initiated",
    "Job Changeover Completed",
  
    // Quality & Inspection
    "First Article Inspection Started",
    "First Article Inspection Passed",
    "First Article Inspection Failed",
    "In-Process Inspection Performed",
    "Inspection Deviation Noted",
    "Final Inspection Passed",
    "Final Inspection Failed",
  
    // Maintenance / Issues
    "Machine Downtime Reported",
    "Machine Maintenance Scheduled",
    "Unplanned Downtime",
    "Tooling Issue Detected",
    "Deviation Logged",
    "Defective Units Detected",
  
    // Post-Production
    "Moved to Packaging",
    "Moved to Warehouse",
    "Ready for Shipment",
    "Shipped",
    "Customer Notified",
  
    // Tracking & Metrics
    "Cycle Time Logged",
    "Scrap Count Updated",
    "Yield Calculated",
    "Efficiency Metrics Captured"
  ];
  
  // 🧠 Utility to manage logs
  function handleLogs(orderData) {
    return {
      // ✅ Add a log only if the event is valid
      addLog: function (event) {
        if (!manufacturingEvents.includes(event)) {
          console.warn(`🚫 Invalid event: "${event}". Log not added.`);
          return;
        }
  
        const timestamp = new Date().toISOString();
        if (!orderData.logs) {
          orderData.logs = [];
        }
        orderData.logs.push({ time: timestamp, event });
        console.log(`✅ Log added: "${event}" at ${timestamp}`);
      },
  
      // 🔍 Get logs with optional keyword filter
      getLogs: function (filterKeyword = "") {
        if (!orderData.logs) return [];
        return orderData.logs.filter(log =>
          log.event.toLowerCase().includes(filterKeyword.toLowerCase())
        );
      },
  
      // 📋 Print all logs
      printTimeline: function () {
        if (!orderData.logs || orderData.logs.length === 0) {
          console.log("No logs available.");
          return;
        }
  
        console.log("🔍 Order Timeline:");
        orderData.logs.forEach(log => {
          console.log(`📌 ${log.time} — ${log.event}`);
        });
      },
  
      // 📂 List all possible events
      listValidEvents: function () {
        console.log("🧾 Valid Manufacturing Events:");
        manufacturingEvents.forEach(event => console.log(`- ${event}`));
      }
    };
  }
  