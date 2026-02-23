import React from 'react';

function DataTable({ columns, data, emptyMessage, actions }) {
  if (!data || data.length === 0) {
    return <p>{emptyMessage || 'No data available.'}</p>;
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={`${row.id}-${column.key}`}>
                  {column.format 
                    ? column.format(row[column.key]) 
                    : (row[column.key] || 'N/A')}
                </td>
              ))}
              {actions && (
                <td>
                  {typeof actions === 'function' 
                    ? actions(row) 
                    : actions}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;