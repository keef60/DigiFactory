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
    const goalProgressData = {
        goal: runQuantity,
        progress: "0",
        "creation date": timestamp,
        isActive: true,
        wo: workOrder,
        dev: deviations
    };

    // Store the object in localStorage
    localStorage.setItem(key, JSON.stringify(goalProgressData));
}