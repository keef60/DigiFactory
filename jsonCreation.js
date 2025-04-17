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

const WorkOrderPriority = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical"
};

const UserRoles = {
  OPERATOR: "Operator",
  LEAD: "Lead",
  SUPERVISOR: "Supervisor",
  ADMIN: "Admin"
};

const WorkOrderStatus = {
  PENDING: "Pending",
  IN_PROGRESS: "InProgress",
  ON_HOLD: "OnHold",
  AWAITING_MATERIALS: "AwaitingMaterials",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  CLOSED: "Closed",
  ERROR: "Error"
};

// Map which roles can set which statuses
const StatusPermissions = {
  [WorkOrderStatus.PENDING]: [UserRoles.OPERATOR, UserRoles.LEAD, UserRoles.SUPERVISOR, UserRoles.ADMIN],
  [WorkOrderStatus.IN_PROGRESS]: [ UserRoles.LEAD, UserRoles.SUPERVISOR, UserRoles.ADMIN],
  [WorkOrderStatus.ON_HOLD]: [UserRoles.LEAD, UserRoles.SUPERVISOR, UserRoles.ADMIN],
  [WorkOrderStatus.AWAITING_MATERIALS]: [UserRoles.LEAD, UserRoles.SUPERVISOR, UserRoles.ADMIN],
  [WorkOrderStatus.READY]: [UserRoles.LEAD, UserRoles.SUPERVISOR, UserRoles.ADMIN],
  [WorkOrderStatus.COMPLETED]: [UserRoles.SUPERVISOR, UserRoles.ADMIN],
  [WorkOrderStatus.CANCELLED]: [UserRoles.SUPERVISOR, UserRoles.ADMIN],
  [WorkOrderStatus.CLOSED]: [UserRoles.ADMIN],
  [WorkOrderStatus.ERROR]: [UserRoles.ADMIN]
};


function createReference(prefix = "FNA") {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // e.g., "20250417"
  const randomSegment = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // e.g., "0382"

  return `${prefix}-${dateStr}-${randomSegment}`;
}


const goalProgressJSONCreation = (item, departmentName,user) => {
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
        goal: runQuantity, 
        progress: 0, 
        "creation date": timestamp, 
        assignedTo:{
          department:departmentName,
        },
        isActive: false, 
        workOrder: {
          id: workOrder,
          reference: createReference('DTX'),
          status: WorkOrderStatus.PENDING.label,
          priority: WorkOrderPriority.MEDIUM.label,
          dueDate: null,
          material_Picks:{
            confirmedBy:user,
            timestamp:Date.now()
          }
        },
        deviations: deviations,
        team: {
          supervisor: {
            UserRoles: UserRoles.SUPERVISOR,
            name: null,
            pin:1234
          },
          lead: {
            UserRoles: UserRoles.LEAD,
            name: null,
            pin:1234
          }
        }
        ,
        product: {
          id: fields.Title,
          name:null,
        },
        logs: []
      };
    

    // Store the object in localStorage
    localStorage.setItem(key, JSON.stringify(goalProgressData));
}
  
  // 🧠 Utility to manage logs
  function handleLogs(orderData) {
    return {
      // ✅ Add a log only if the event is valid
      addLog: function (event,data) {
        if (!manufacturingEvents.includes(event)) {
          console.warn(`🚫 Invalid event: "${event}". Log not added.`);
          return;
        }
  
        const timestamp = new Date().toISOString();
        if (!orderData.logs) {
          orderData.logs = [];
        }
        orderData.logs.push({ time: timestamp, event,data:data });
        console.log(`✅ Log added: "${event}" at ${timestamp}`);
        return orderData;
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
  
  function updateWorkOrderStatus(workOrder, newStatus, userRole) {
    const validStatuses = Object.values(WorkOrderStatus);
  
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: "${newStatus}".`);
    }
  
    const allowedRoles = StatusPermissions[newStatus] || [];
  
    if (!allowedRoles.includes(userRole)) {
      throw new Error(`Role "${userRole}" is not authorized to set status "${newStatus}".`);
    }
  
    const previousStatus = workOrder.status;
    workOrder.status = newStatus;
  
    console.log(`Status changed from "${previousStatus}" to "${newStatus}" by ${userRole}`);
    return workOrder;
  }

 
  
  