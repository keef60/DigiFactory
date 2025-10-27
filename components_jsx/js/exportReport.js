//Commit Update
// 📘 Helper class for formatting each sheet's data
  class DTXProductionFormatHelpers {
    static formatRunRates(data) {
      return data.map(item => ({
        "Unit": item.unit,
        "Earned Hours": Number(item.earnedHours).toFixed(2),
        "Operators": item.operators,
        "Run Rate": Number(item.runRate).toFixed(2)
      }));
    }

    static formatReport(data) {
      return data.map(line => ({
        "Model": line.model,
        "Quantity": Number(line.qty).toFixed(0),
        "Hours per Unit": Number(line.hrsPerUnit).toFixed(2),
        "Earned Hours": Number(line.earnedHrs).toFixed(2),
        "Line Hours": Number(line.lineHrs).toFixed(2)
      }));
    }

    static formatOverview(data) {
      return data.map(month => ({
        "Date": month.date,
        "Quantity": Number(month.quantity).toFixed(0)
      }));
    }

    static formatEfficiencyOnLabor(data) {
      return data.map(entry => ({
        "Hour": entry.hour,
        "Model": entry.model,
        "Machines Produced": Number(entry.machProduced).toFixed(0),
        "Run Rate": Number(entry.runRate).toFixed(2),
        "Variance": Number(entry.variance).toFixed(2),
        "Variance %": Number(entry.variancePercent).toFixed(2)
      }));
    }

    static formatLineHourByHour(data) {
      return data.map(entry => ({
        "Hour": entry.hour,
        "Line": entry.line,
        "Model": entry.model,
        "Produced": Number(entry.produced).toFixed(0),
        "Run Rate": Number(entry.runRate).toFixed(2),
        "Variance": Number(entry.variance).toFixed(2),
        "Variance %": Number(entry.variancePercent).toFixed(2)
      }));
    }

    static formatKittingReport(data) {
      return data.map(entry => ({
        "Hour": entry.hour,
        "Required Units": Number(entry.required).toFixed(0),
        "Produced Units": Number(entry.produced).toFixed(0),
        "Variance": Number(entry.produced - entry.required).toFixed(0),
        "Variance (%)": Number(entry.variancePercent).toFixed(2)
      }));
    }

    static formatRecap(data) {
      return data.map(line => ({
        "Line": line.line,
        "Scheduled": Number(line.scheduled).toFixed(0),
        "Produced": Number(line.produced).toFixed(0),
        "Efficiency (Capability)": Number(line.efficiencyCapability).toFixed(2),
        "Efficiency (Labor)": Number(line.efficiencyLabor).toFixed(2)
      }));
    }

    static formatUnitInfo(data) {
      return data.map(unit => ({
        "Model": unit.model,
        "Engine": unit.engine,
        "Pump": unit.pump,
        "Frame": unit.frame,
        "Wheel": unit.wheel,
        "Handle": unit.handle,
        "Dashboard": unit.dashboard,
        "Hose": unit.hose,
        "Carton": unit.carton
      }));
    }

    static formatAssemblyLineNotes(data) {
      return data.map(note => ({
        "Timestamp": note.timestamp,
        "Line": note.line,
        "Author": note.author,
        "Note": note.content
      }));
    }

    static formatAssemblyLineProductionSummary(data) {
      return data.map(line => ({
        "Line": line.line,
        "Scheduled Units": Number(line.scheduled).toFixed(0),
        "Produced Units": Number(line.produced).toFixed(0),
        "Efficiency (%)": Number(line.efficiencyPercent).toFixed(2),
        "Downtime (min)": Number(line.downtime || 0).toFixed(0),
        "Notes": line.notes || ""
      }));
    }
  }

  // 📗 Main class to build the workbook
  class DTXProductionFormatter {
    constructor(data) {
      this.data = data;
    }

    buildWorkbook() {
      const wb = XLSX.utils.book_new();

      const sheets = {
        "Run Rates": DTXProductionFormatHelpers.formatRunRates(this.data.runRates),
        "Report": DTXProductionFormatHelpers.formatReport(this.data.report),
        "Overview": DTXProductionFormatHelpers.formatOverview(this.data.overview),
        "Eff. on act. labor": DTXProductionFormatHelpers.formatEfficiencyOnLabor(this.data.efficiency),
        "Line Hour by Hour": DTXProductionFormatHelpers.formatLineHourByHour(this.data.lineHourByHour),
        "Kitting Report": DTXProductionFormatHelpers.formatKittingReport(this.data.kitting),
        "Recap": DTXProductionFormatHelpers.formatRecap(this.data.recap.coldWater),
        "Unit Info": DTXProductionFormatHelpers.formatUnitInfo(this.data.unitInfo),
        "Assembly Line Notes": DTXProductionFormatHelpers.formatAssemblyLineNotes(this.data.assemblyNotes),
        "Assembly Line Summary": DTXProductionFormatHelpers.formatAssemblyLineProductionSummary(this.data.productionSummary)
      };

      for (const [sheetName, data] of Object.entries(sheets)) {
        const ws = XLSX.utils.json_to_sheet(data);
        ws['!cols'] = Object.keys(data[0] || {}).map(key => ({ wch: Math.max(12, key.length + 2) }));
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }

      XLSX.writeFile(wb, "DTX_Production_Report.xlsx");
    }
  }

  // 🧪 Example usage:
  /*
  const inputData = {
    runRates: [...],
    report: [...],
    overview: [...],
    efficiency: [...],
    lineHourByHour: [...],
    kitting: [...],
    recap: { coldWater: [...] },
    unitInfo: [...],
    assemblyNotes: [...],
    productionSummary: [...]
  };

  const formatter = new DTXProductionFormatter(inputData);
  formatter.buildWorkbook(); // Generates and downloads the Excel file
  */
