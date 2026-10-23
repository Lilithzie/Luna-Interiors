// Order e-mail + PDF receipt for Luna Interiors.
//  - buildReceiptPdf(order, customer) -> Buffer   (PDF receipt)
//  - buildOrderEmail(order, customer, kind) -> { subject, html }
//  - sendOrderEmail(order, customer, kind) -> { sent, to, error? }   (never throws)
const PDFDocument = require('pdfkit');
const sendEmail = require('./sendEmail');

const BROWN = '#8B5A2B';
const DARK = '#2E1F14';

const transactionNo = (order) => order.transactionNo || `LUNA-${String(order._id).slice(-8).toUpperCase()}`;

// PDF's built-in fonts have no peso sign, so the PDF writes "PHP 1,234.00"; the e-mail uses the real peso sign.
const num = (n) => Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const php = (n) => `PHP ${num(n)}`;
const peso = (n) => `₱${num(n)}`;
const when = (d) => (d ? new Date(d).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' }) : '');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const paymentText = (order) => {
    const paid = order.paymentInfo && order.paymentInfo.status === 'succeeded';
    return paid ? 'PAID' : (order.paymentMethod === 'Cash on Delivery' ? 'TO PAY ON DELIVERY' : 'NOT PAID');
};

/* ------------------------------ PDF receipt ------------------------------ */
const buildReceiptPdf = (order, customer = {}) => new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: `Receipt ${transactionNo(order)}`, Author: 'Luna Interiors' } });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const left = 50, right = 545, width = right - left;

    // header band
    doc.rect(0, 0, 595.28, 95).fill(BROWN);
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(24).text('Luna Interiors', left, 30);
    doc.font('Helvetica').fontSize(11).text('Official Receipt', left, 60);
    doc.font('Helvetica-Bold').fontSize(11).text(transactionNo(order), left, 32, { width, align: 'right' });
    doc.font('Helvetica').fontSize(10).text(when(order.createdAt), left, 50, { width, align: 'right' });

    // customer + order info
    doc.fillColor(DARK);
    let y = 118;
    const s = order.shippingInfo || {};
    doc.font('Helvetica-Bold').fontSize(11).text('Billed to', left, y);
    doc.font('Helvetica').fontSize(10)
        .text(customer.name || '', left, y + 16)
        .text(customer.email || '', left, y + 30)
        .text(`${s.address || ''}, ${s.city || ''} ${s.postalCode || ''}`, left, y + 44, { width: 250 })
        .text(`${s.country || ''}  |  Phone: ${s.phoneNo || ''}`, left, y + 70, { width: 250 });

    doc.font('Helvetica-Bold').fontSize(11).text('Order details', 330, y);
    doc.font('Helvetica').fontSize(10)
        .text(`Status: ${order.orderStatus}`, 330, y + 16)
        .text(`Payment: ${order.paymentMethod || 'Card'}`, 330, y + 30)
        .text(`Payment status: ${paymentText(order)}`, 330, y + 44);
    if (order.deliveredAt) doc.text(`Delivered: ${when(order.deliveredAt)}`, 330, y + 58);

    // items table
    y = 225;
    const col = { name: left + 8, price: 300, qty: 390, sub: 545 };
    doc.rect(left, y, width, 24).fill(BROWN);
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(10)
        .text('Product', col.name, y + 7)
        .text('Price', col.price, y + 7, { width: 80, align: 'right' })
        .text('Qty', col.qty, y + 7, { width: 40, align: 'right' })
        .text('Subtotal', col.sub - 110, y + 7, { width: 102, align: 'right' });
    y += 30;

    doc.fillColor(DARK).font('Helvetica').fontSize(10);
    (order.orderItems || []).forEach((item, i) => {
        const h = Math.max(doc.heightOfString(item.name, { width: 230 }), 14) + 10;
        if (y + h > 720) { doc.addPage(); y = 50; }
        if (i % 2 === 0) doc.rect(left, y - 4, width, h).fill('#f6efe6');
        doc.fillColor(DARK).font('Helvetica').fontSize(10)
            .text(item.name, col.name, y, { width: 230 })
            .text(php(item.price), col.price - 20, y, { width: 100, align: 'right' })
            .text(String(item.quantity), col.qty, y, { width: 40, align: 'right' })
            .text(php(item.price * item.quantity), col.sub - 110, y, { width: 102, align: 'right' });
        y += h;
    });

    // totals
    y += 12;
    if (y > 650) { doc.addPage(); y = 50; }
    const line = (label, value, bold) => {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 12 : 10).fillColor(DARK)
            .text(label, 330, y, { width: 100 })
            .text(value, 430, y, { width: 115, align: 'right' });
        y += bold ? 22 : 17;
    };
    line('Items subtotal', php(order.itemsPrice));
    line('Shipping', Number(order.shippingPrice) === 0 ? 'FREE' : php(order.shippingPrice));
    line('Tax (5%)', php(order.taxPrice));
    doc.moveTo(330, y).lineTo(right, y).lineWidth(1.5).strokeColor(BROWN).stroke();
    y += 8;
    line('GRAND TOTAL', php(order.totalPrice), true);

    // footer
    doc.font('Helvetica').fontSize(9).fillColor('#8a7a69')
        .text('Thank you for shopping with Luna Interiors. Keep this receipt for your records.', left, 770, { width, align: 'center' });

    doc.end();
});

/* ------------------------------- e-mail body ------------------------------- */
const HEADLINES = {
    placed: { subject: 'Order received', title: 'Thank you! We received your order.', note: 'We will email you again whenever the status of your order changes.' },
    Processing: { subject: 'Order is being processed', title: 'Your order is being processed.', note: 'We are preparing your items.' },
    Shipped: { subject: 'Order shipped', title: 'Your order is on its way!', note: 'Your order has been shipped and will reach you soon.' },
    Delivered: { subject: 'Order delivered', title: 'Your order has been delivered.', note: 'Thank you for shopping with us. You can now write a review for the products you bought.' },
};

const buildOrderEmail = (order, customer = {}, kind = 'placed') => {
    const h = HEADLINES[kind] || HEADLINES.placed;
    const tn = transactionNo(order);
    const rows = (order.orderItems || []).map(i => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${esc(i.name)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${peso(i.price)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${esc(i.quantity)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${peso(i.price * i.quantity)}</td>
        </tr>`).join('');
    const s = order.shippingInfo || {};
    const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:auto;color:${DARK}">
      <div style="background:${BROWN};color:#fff;padding:18px 22px;border-radius:10px 10px 0 0">
        <div style="font-size:22px;font-weight:bold">Luna Interiors</div>
        <div style="opacity:.9">${esc(h.subject)} &middot; ${esc(tn)}</div>
      </div>
      <div style="border:1px solid #e6dccf;border-top:0;padding:22px;border-radius:0 0 10px 10px">
        <p>Hi ${esc(customer.name || 'there')},</p>
        <h2 style="margin:6px 0">${esc(h.title)}</h2>
        <p>${esc(h.note)}</p>
        <p><b>Status:</b> ${esc(order.orderStatus)} &nbsp;|&nbsp; <b>Payment:</b> ${esc(order.paymentMethod || 'Card')} (${esc(paymentText(order))})</p>

        <table style="width:100%;border-collapse:collapse;margin-top:12px">
          <thead><tr style="background:#f6efe6">
            <th style="padding:8px;text-align:left">Product</th><th style="padding:8px;text-align:right">Price</th>
            <th style="padding:8px;text-align:center">Qty</th><th style="padding:8px;text-align:right">Subtotal</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>

        <table style="width:100%;margin-top:12px;border-collapse:collapse">
          <tr><td style="padding:4px 8px">Items subtotal</td><td style="padding:4px 8px;text-align:right">${peso(order.itemsPrice)}</td></tr>
          <tr><td style="padding:4px 8px">Shipping</td><td style="padding:4px 8px;text-align:right">${Number(order.shippingPrice) === 0 ? 'FREE' : peso(order.shippingPrice)}</td></tr>
          <tr><td style="padding:4px 8px">Tax (5%)</td><td style="padding:4px 8px;text-align:right">${peso(order.taxPrice)}</td></tr>
          <tr><td style="padding:8px;border-top:2px solid ${BROWN};font-size:16px"><b>Grand total</b></td>
              <td style="padding:8px;border-top:2px solid ${BROWN};font-size:16px;text-align:right"><b>${peso(order.totalPrice)}</b></td></tr>
        </table>

        <p style="margin-top:16px"><b>Ship to:</b> ${esc(s.address)}, ${esc(s.city)}, ${esc(s.postalCode)}, ${esc(s.country)} (${esc(s.phoneNo)})</p>
        <p style="color:#8a7a69;font-size:13px">Your PDF receipt is attached to this email.</p>
      </div>
    </div>`;
    return { subject: `Luna Interiors - ${h.subject} (${tn})`, html };
};

/* ------------------------------- send it ------------------------------- */
// Never throws: a mail problem must not break checkout or the admin's status update.
const sendOrderEmail = async (order, customer, kind = 'placed') => {
    const to = customer && customer.email;
    if (!to) return { sent: false, error: 'Customer has no email address' };
    if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        return { sent: false, to, error: 'SMTP is not configured (SMTP_HOST / SMTP_EMAIL / SMTP_PASSWORD)' };
    }
    try {
        const pdf = await buildReceiptPdf(order, customer);
        const { subject, html } = buildOrderEmail(order, customer, kind);
        await sendEmail({
            email: to,
            subject,
            html,
            attachments: [{ filename: `Receipt-${transactionNo(order)}.pdf`, content: pdf, contentType: 'application/pdf' }],
        });
        return { sent: true, to };
    } catch (err) {
        console.error('Order e-mail failed:', err.message);
        return { sent: false, to, error: err.message };
    }
};

module.exports = { buildReceiptPdf, buildOrderEmail, sendOrderEmail, transactionNo };
