//Commit Update
const YieldAnalysis = () => {
  const data = [
    { productType: 'Product A', unitsProduced: 500, defectiveUnits: 20, yield: 96 },
    { productType: 'Product B', unitsProduced: 400, defectiveUnits: 10, yield: 97.5 },
  ];

  return (
    <div>
      <h2>Yield Analysis</h2>
      <table>
        <thead>
          <tr>
            <th>Product Type</th>
            <th>Units Produced</th>
            <th>Defective Units</th>
            <th>Yield (%)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.productType}</td>
              <td>{row.unitsProduced}</td>
              <td>{row.defectiveUnits}</td>
              <td>{row.yield}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

