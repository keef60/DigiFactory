//Commit Update
const InventoryLevels = () => {
  const data = [
    { product: 'Steel Rods', beginningInventory: 1500, received: 800, used: 1200, endingInventory: 1100 },
    { product: 'Paint', beginningInventory: 300, received: 100, used: 150, endingInventory: 250 },
  ];

  return (
    <div>
      <h2>Inventory Levels</h2>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Beginning Inventory</th>
            <th>Received</th>
            <th>Used</th>
            <th>Ending Inventory</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.product}</td>
              <td>{row.beginningInventory}</td>
              <td>{row.received}</td>
              <td>{row.used}</td>
              <td>{row.endingInventory}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
