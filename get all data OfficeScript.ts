function main(workbook: ExcelScript.Workbook): { department: string, model: string, quantity: string, uom: { pid: string, ref: string }[], qtyToPick: { pid: string, ref: string }[], partDescription: { pid: string, ref: string }[], partNumber: { pid: string, ref: string }[] }[] {
    // Define the worksheet names (you can modify this list as needed)
    const worksheetNames: string[] = ["FRAME KIT", "HANDLE KIT", "PACKOUT KIT"];

    // Create the output object, typed as an array of objects with the specified structure
    let result: {
        department: string,
        model: string,
        quantity: string,
        uom: { pid: string, ref: string }[],
        qtyToPick: { pid: string, ref: string }[],
        partDescription: { pid: string, ref: string }[],
        partNumber: { pid: string, ref: string }[]
    }[] = [];

    // Loop through each of the target worksheets
    for (let sheetName of worksheetNames) {
        // Get the worksheet by name
        let sheet = workbook.getWorksheet(sheetName);

        // Check if the sheet exists
        if (sheet) {
            // The model number is the sheet name
            let modelNumber: string = workbook.getWorksheets()[0].getName(); // Directly use the sheet name as the model number
            let partNumber: string[] = [];
            let partDescription: string[] = [];
            let partRef: string[] = [];
            let partQty: string[] = [];
            let uom: string[] = [];
            let qtyToPick: string[] = [];

            // Check if cell is blank and return start cell range
            let cell: string = sheet.getCell(19, 0).getValue();
            let hasRowValue: string = (cell === null || cell === undefined || cell === "") ? "B20:B104" : "A20:A104";

            let cell2: string = sheet.getCell(19, 0).getValue();
            let hasColValue2: string = (cell2 === null || cell2 === undefined || cell2 === "") ? "G20:G104" : "F20:F104";

            let cell3: string = sheet.getCell(19, 0).getValue();
            let hasColValue3: string = (cell3 === null || cell3 === undefined || cell3 === "") ? "AJ20:AJ104" : "AI20:AI104";

            let cell4: string = sheet.getCell(19, 0).getValue();
            let hasColValue4: string = (cell4 === null || cell4 === undefined || cell4 === "") ? "AE9:AE9" : "AD9:AD9";

            // Get UOM and Qty To Pick columns using the provided logic
            let cell5: string = sheet.getCell(19, 0).getValue();
            let hasColValue5UOM: string = (cell5 === null || cell5 === undefined || cell5 === "") ? "W20:W104" : "V20:V104";
            let hasColValue5Qty: string = (cell5 === null || cell5 === undefined || cell5 === "") ? "AA20:AA104" : "Z20:Z104";

            // Define ranges based on sheet names
            if (sheetName === "PACKOUT KIT") {
                partNumber = sheet.getRange(hasRowValue).getValues().flat();
                partDescription = sheet.getRange(hasColValue2).getValues().flat();
                partRef = sheet.getRange(hasColValue3).getValues().flat();
                partQty = sheet.getRange(hasColValue4).getValues().flat();
                uom = sheet.getRange(hasColValue5UOM).getValues().flat();  // Get UOM values
                qtyToPick = sheet.getRange(hasColValue5Qty).getValues().flat();  // Get Qty To Pick values
            } else if (sheetName === "HANDLE KIT") {
                partNumber = sheet.getRange(hasRowValue).getValues().flat();
                partDescription = sheet.getRange(hasColValue2).getValues().flat();
                partRef = sheet.getRange(hasColValue3).getValues().flat();
                partQty = sheet.getRange(hasColValue4).getValues().flat();
                uom = sheet.getRange(hasColValue5UOM).getValues().flat();  // Get UOM values
                qtyToPick = sheet.getRange(hasColValue5Qty).getValues().flat();  // Get Qty To Pick values
            } else {
                partNumber = sheet.getRange(hasRowValue).getValues().flat();
                partDescription = sheet.getRange(hasColValue2).getValues().flat();
                partRef = sheet.getRange(hasColValue3).getValues().flat();
                partQty = sheet.getRange(hasColValue4).getValues().flat();
                uom = sheet.getRange(hasColValue5UOM).getValues().flat();  // Get UOM values
                qtyToPick = sheet.getRange(hasColValue5Qty).getValues().flat();  // Get Qty To Pick values
            }

            // Arrays to hold all UOM and QtyToPick values for this model
            let combinedUOM: { pid: string, ref: string }[] = [];
            let combinedQtyToPick: { pid: string, ref: string }[] = [];

            // Arrays to hold all partDescription and row values for this model
            let combinedPartDescription: { pid: string, ref: string }[] = [];
            let combinedPartNumbers: { pid: string, ref: string }[] = [];

            // Iterate through each row starting from row 20
            for (let i = 0; i < partNumber.length; i++) {
                let aValue = { pid: partNumber[i], ref: partRef[i] }; // The part number object
                let fValue = { pid: partDescription[i], ref: partRef[i] }; // The part description object
                let uomValue = { pid: uom[i], ref: partRef[i] }; // The UOM value object
                let qtyToPickValue = { pid: qtyToPick[i], ref: partRef[i] }; // The Qty To Pick value object

                // Check if the aValue's pid is not empty
                if (aValue.pid !== undefined && aValue.pid !== null && aValue.pid !== "") {
                    // Check if the fValue's pid is valid and not an empty string
                    if (fValue.pid !== undefined && fValue.pid !== null && fValue.pid !== "") {
                        // Add the entire fValue object to the combinedPartDescription array
                        combinedPartDescription.push(fValue);

                        // Add the entire aValue object to the combinedPartNumbers array
                        combinedPartNumbers.push(aValue);

                            // Add the UOM and QtyToPick objects to their respective arrays
                combinedUOM.push(uomValue);
                combinedQtyToPick.push(qtyToPickValue);
                    }
                }

            
            }

            // If partDescription and partNumber are not empty, push them into the result array
            if (combinedPartDescription.length > 0 && combinedPartNumbers.length > 0) {
                result.push({
                    department: sheetName, // Use the sheet name as the department
                    model: modelNumber,
                    quantity: partQty[0].match(/\d+/)[0],
                    uom: combinedUOM, // Add UOM data
                    qtyToPick: combinedQtyToPick, // Add QtyToPick data
                    partDescription: combinedPartDescription,
                    partNumber: combinedPartNumbers
                });
            } else {
                // If no valid data, still push the result with empty arrays
                result.push({
                    department: sheetName, // Use the sheet name as the department
                    model: modelNumber,
                    quantity: partQty[0].replace("QTY - ", ""),
                    uom: [], // Add empty UOM array
                    qtyToPick: [], // Add empty QtyToPick array
                    partDescription: [],
                    partNumber: []
                });
            }
        }
    }

    // Output the result for debugging
    console.log("Final Result:", JSON.stringify(result, null, 2));

    // Return the result object to Power Automate or use for further processing
    return result;
}
