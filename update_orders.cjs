const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/OrdersManage.tsx', 'utf8');

const statuses = `
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' || order.status === 'returned' || order.status === 'refunded' ? 'bg-red-100 text-red-700' :
                          order.status === 'shipped' || order.status === 'packed' ? 'bg-indigo-100 text-indigo-700' :
                          order.status === 'processing' || order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
`;
// We just replace the <option> blocks
const optionBlockSearch = `
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
`;
const newOptionBlockSearch = `
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
            <option value="refunded">Refunded</option>
`;

code = code.replace(optionBlockSearch, newOptionBlockSearch);

// Also inside the select in the table body
const optionBlockBody = `
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
`;
const newOptionBlockBody = `
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="returned">Returned</option>
                          <option value="refunded">Refunded</option>
`;

code = code.replace(optionBlockBody, newOptionBlockBody);

fs.writeFileSync('src/pages/admin/OrdersManage.tsx', code);
