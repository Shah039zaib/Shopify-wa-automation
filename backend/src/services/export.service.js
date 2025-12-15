/**
 * Export Service
 * Generates reports in PDF, Excel, and CSV formats
 */

const { logger } = require('../utils/logger');

/**
 * Convert data to CSV format
 */
function toCSV(data, headers) {
  if (!data || data.length === 0) {
    return headers ? headers.join(',') : '';
  }

  const keys = headers || Object.keys(data[0]);
  const headerRow = keys.join(',');

  const rows = data.map(item => {
    return keys.map(key => {
      let value = item[key];

      // Handle null/undefined
      if (value === null || value === undefined) {
        value = '';
      }

      // Handle objects
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }

      // Escape quotes and wrap in quotes if contains comma
      value = String(value).replace(/"/g, '""');
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value}"`;
      }

      return value;
    }).join(',');
  });

  return [headerRow, ...rows].join('\n');
}

/**
 * Generate CSV report for customers
 */
async function exportCustomersCSV(customers) {
  const headers = [
    'ID', 'Name', 'Phone', 'Email', 'Language',
    'Status', 'Total Orders', 'Total Spent', 'Created At'
  ];

  const data = customers.map(c => ({
    ID: c.id,
    Name: c.name || 'N/A',
    Phone: c.phone_number,
    Email: c.email || 'N/A',
    Language: c.language_preference,
    Status: c.status,
    'Total Orders': c.total_orders,
    'Total Spent': c.total_spent,
    'Created At': new Date(c.created_at).toLocaleDateString()
  }));

  return toCSV(data, headers);
}

/**
 * Generate CSV report for orders
 */
async function exportOrdersCSV(orders) {
  const headers = [
    'Order ID', 'Customer', 'Phone', 'Package',
    'Amount', 'Status', 'Created At', 'Paid At', 'Completed At'
  ];

  const data = orders.map(o => ({
    'Order ID': o.id.slice(0, 8),
    Customer: o.customer_name || 'N/A',
    Phone: o.customer_phone || 'N/A',
    Package: o.package_name || 'N/A',
    Amount: o.amount,
    Status: o.status,
    'Created At': new Date(o.created_at).toLocaleDateString(),
    'Paid At': o.paid_at ? new Date(o.paid_at).toLocaleDateString() : 'N/A',
    'Completed At': o.completed_at ? new Date(o.completed_at).toLocaleDateString() : 'N/A'
  }));

  return toCSV(data, headers);
}

/**
 * Generate CSV report for conversations
 */
async function exportConversationsCSV(conversations) {
  const headers = [
    'ID', 'Customer', 'Phone', 'Status',
    'Messages', 'Last Message', 'Created At'
  ];

  const data = conversations.map(c => ({
    ID: c.id.slice(0, 8),
    Customer: c.customer_name || 'N/A',
    Phone: c.phone_number || 'N/A',
    Status: c.status,
    Messages: c.messages_count || 0,
    'Last Message': c.last_message_at ? new Date(c.last_message_at).toLocaleString() : 'N/A',
    'Created At': new Date(c.created_at).toLocaleDateString()
  }));

  return toCSV(data, headers);
}

/**
 * Generate sales analytics report
 */
async function exportSalesReportCSV(salesData) {
  const headers = [
    'Date', 'Orders', 'Revenue', 'Avg Order Value'
  ];

  const data = salesData.map(s => ({
    Date: s.date,
    Orders: s.order_count || 0,
    Revenue: s.revenue || 0,
    'Avg Order Value': s.avg_order_value || 0
  }));

  return toCSV(data, headers);
}

/**
 * Generate AI analytics report
 */
async function exportAIReportCSV(aiData) {
  const headers = [
    'Provider', 'Total Requests', 'Successful', 'Failed',
    'Success Rate', 'Avg Response Time', 'Total Tokens'
  ];

  const data = aiData.map(a => ({
    Provider: a.provider_name,
    'Total Requests': a.total_requests || 0,
    Successful: a.successful_requests || 0,
    Failed: a.failed_requests || 0,
    'Success Rate': `${a.success_rate || 0}%`,
    'Avg Response Time': `${Math.round(a.avg_response_time || 0)}ms`,
    'Total Tokens': a.total_tokens || 0
  }));

  return toCSV(data, headers);
}

/**
 * Generate JSON export (can be converted to Excel)
 */
function toJSON(data) {
  return JSON.stringify(data, null, 2);
}

/**
 * Generate simple HTML report (can be printed as PDF)
 */
function toHTML(title, data, columns) {
  const headers = columns || Object.keys(data[0] || {});

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #128C7E; border-bottom: 2px solid #25D366; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background-color: #25D366; color: white; padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    tr:hover { background-color: #f5f5f5; }
    .footer { margin-top: 30px; color: #666; font-size: 12px; }
    .stats { display: flex; gap: 20px; margin: 20px 0; }
    .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; }
    .stat-value { font-size: 24px; font-weight: bold; color: #128C7E; }
    .stat-label { color: #666; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>Generated on: ${new Date().toLocaleString()}</p>

  <table>
    <thead>
      <tr>
        ${headers.map(h => `<th>${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>
          ${headers.map(h => `<td>${row[h] !== undefined ? row[h] : 'N/A'}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>WhatsApp Automation System - Report</p>
    <p>Total Records: ${data.length}</p>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Generate comprehensive dashboard report
 */
async function generateDashboardReport(stats, recentOrders, recentCustomers) {
  return {
    generated_at: new Date().toISOString(),
    summary: {
      total_customers: stats.total_customers,
      total_orders: stats.total_orders,
      total_revenue: stats.total_revenue,
      active_conversations: stats.active_conversations
    },
    recent_orders: recentOrders.slice(0, 10),
    recent_customers: recentCustomers.slice(0, 10)
  };
}

module.exports = {
  toCSV,
  toJSON,
  toHTML,
  exportCustomersCSV,
  exportOrdersCSV,
  exportConversationsCSV,
  exportSalesReportCSV,
  exportAIReportCSV,
  generateDashboardReport
};
