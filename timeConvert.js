function convertToDateFormat(dateString) {
    const date = new Date(dateString);
    
    // Get the individual components of the date
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of the year
    
    // Return the formatted date
    return `${month}/${day}/${year}`;
  }

  function is24HoursOld(dateString) {
    // Parse the input date string into a Date object
    const inputDate = new Date(dateString);

    // Get the current time
    const currentTime = new Date();

    // Calculate the time difference in milliseconds
    const timeDifference = currentTime - inputDate;

    // Calculate the difference in milliseconds
    const hours = timeDifference / (1000 * 60 *60 ); // convert to hours

    switch (true) {
        case (hours >= 96):
            return { status: true, message: `Older`,color:'red' };
        case (hours <= 48 && 25 <= hours):
            return { status: true, message: `Yesterday`,color:'green' };
        case (hours <= 24 && 0 <= hours):
            return { status: true, message: `Today`,color:'yellow' };
        default:
            return { status: false, message: '',color:'' };
    }

}