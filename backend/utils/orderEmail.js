// Order e-mail + PDF receipt for Luna Interiors.
//  - buildReceiptPdf(order, customer) -> Buffer   (PDF receipt)
//  - buildOrderEmail(order, customer, kind) -> { subject, html }
//  - sendOrderEmail(order, customer, kind) -> { sent, to, error? }   (never throws)
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
// pdfkit loads its built-in fonts with a dynamic require that Vercel's bundler cannot see, so the
// font files were left out of the deployment and every PDF failed there. Requiring the two fonts
// the receipt uses makes the bundler include them.
require('pdfkit/standard-fonts/Helvetica');
require('pdfkit/standard-fonts/HelveticaBold');
const sendEmail = require('./sendEmail');

// Luna Interiors palette (same as theme.css)
const BROWN = '#8B5A2B';
const DARK = '#2E1F14';
const CREAM = '#FAF6EF';
const LINE = '#E8DFD2';
const MUTED = '#7A6A5A';
const GREEN = '#4F6B3A';
const RED = '#A1461F';
const STEPS = ['Processing', 'Shipped', 'Delivered'];

// light gold logo: it sits on the dark header band, like the site header. Skipped if the file is missing.
const LOGO = path.join(__dirname, '..', 'assets', 'luna-logo.png');
const LOGO_CID = 'luna-logo';
const hasLogo = () => fs.existsSync(LOGO);

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
const isPaid = (order) => !!(order.paymentInfo && order.paymentInfo.status === 'succeeded');

// when each step of Processing -> Shipped -> Delivered happened (same rules as the order timeline on the site)
const stepDate = (order, status) => {
    const hit = (order.statusHistory || []).find(h => h.status === status);
    if (hit) return hit.at;
    if (status === 'Processing') return order.createdAt;
    if (status === 'Delivered') return order.deliveredAt;
    return null;
};

/* ------------------------------ PDF receipt ------------------------------ */
// Same layout as the order pages on the website: header, status pill, then cream cards for the
// order status, the items with totals, and payment + shipping.
const buildReceiptPdf = (order, customer = {}) => new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: `Receipt ${transactionNo(order)}`, Author: 'Luna Interiors' } });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const left = 50, right = 545, width = right - left;
    const PAD = 16, GAP = 12;
    const BOTTOM = 750;                                       // keep cards clear of the footer
    const card = (x, y, w, h) => doc.roundedRect(x, y, w, h, 8).lineWidth(0.8).fillAndStroke(CREAM, LINE);
    const cardTitle = (text, x, y) => doc.fillColor(DARK).font('Helvetica-Bold').fontSize(11).text(text, x, y, { lineBreak: false });

    // header band
    doc.rect(0, 0, 595.28, 95).fill(DARK);
    const brandX = hasLogo() ? left + 78 : left;
    if (hasLogo()) doc.image(LOGO, left, 14, { fit: [67, 67] });
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(24).text('Luna Interiors', brandX, 30);
    doc.font('Helvetica').fontSize(11).text('Official Receipt', brandX, 60);
    doc.font('Helvetica-Bold').fontSize(11).text(transactionNo(order), left, 32, { width, align: 'right' });
    doc.font('Helvetica').fontSize(10).text(when(order.createdAt), left, 50, { width, align: 'right' });

    // order number + status pill
    let y = 115;
    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(17).text(`Order # ${transactionNo(order)}`, left, y, { lineBreak: false });
    doc.fillColor(MUTED).font('Helvetica').fontSize(10).text(`Placed on ${when(order.createdAt)}`, left, y + 23, { lineBreak: false });
    const status = order.orderStatus || 'Processing';
    doc.font('Helvetica-Bold').fontSize(9);
    const pillW = doc.widthOfString(status) + 22;
    const delivered = status === 'Delivered';
    doc.roundedRect(right - pillW, y + 2, pillW, 20, 10).fill(delivered ? '#E3E8DC' : '#EFE4D6');
    doc.fillColor(delivered ? GREEN : BROWN).text(status, right - pillW, y + 8, { width: pillW, align: 'center', lineBreak: false });
    y += 52;

    // order status card: Processing -> Shipped -> Delivered
    const current = Math.max(STEPS.indexOf(status), 0);
    card(left, y, width, 84);
    cardTitle('Order status', left + PAD, y + 14);
    const boxW = (width - PAD * 2 - 16) / 3;
    STEPS.forEach((step, i) => {
        const bx = left + PAD + i * (boxW + 8), by = y + 36;
        const reached = i <= current;
        doc.roundedRect(bx, by, boxW, 34, 6).lineWidth(i === current ? 1.4 : 0.8).fillAndStroke('#FFFFFF', reached ? BROWN : LINE);
        const cx = bx + 17, cy = by + 17;
        doc.circle(cx, cy, 9).fill(reached ? BROWN : '#EFE4D6');
        if (reached) {
            doc.moveTo(cx - 4, cy).lineTo(cx - 1, cy + 3).lineTo(cx + 4, cy - 3).lineWidth(1.6).strokeColor('#FFFFFF').stroke();
        } else {
            doc.fillColor(BROWN).font('Helvetica-Bold').fontSize(9).text(String(i + 1), cx - 9, cy - 4, { width: 18, align: 'center', lineBreak: false });
        }
        doc.fillColor(reached ? DARK : MUTED).font('Helvetica-Bold').fontSize(10).text(step, bx + 32, by + 6, { width: boxW - 38, lineBreak: false });
        doc.fillColor(MUTED).font('Helvetica').fontSize(8).text(reached ? when(stepDate(order, step)) : 'Waiting', bx + 32, by + 20, { width: boxW - 38, lineBreak: false, ellipsis: true });
    });
    y += 84 + GAP;

    // items card (continues on the next page when an order is long)
    const ix = left + PAD, iw = width - PAD * 2;
    const nameW = iw - 260;
    const cols = { price: ix + iw - 250, qty: ix + iw - 150, sub: ix + iw - 100 };
    const items = order.orderItems || [];
    doc.font('Helvetica').fontSize(10);
    const rows = items.map(item => ({ item, h: Math.max(doc.heightOfString(item.name, { width: nameW }), 12) + 12 }));
    const HEAD = 30 + 22, TOTALS = 100;
    const drawHead = (top, title) => {
        cardTitle(title, ix, top + 14);
        doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(8);
        doc.text('PRODUCT', ix, top + 38, { characterSpacing: 0.6, lineBreak: false });
        doc.text('PRICE', cols.price, top + 38, { width: 90, align: 'right', characterSpacing: 0.6, lineBreak: false });
        doc.text('QTY', cols.qty, top + 38, { width: 40, align: 'right', characterSpacing: 0.6, lineBreak: false });
        doc.text('SUBTOTAL', cols.sub, top + 38, { width: 100, align: 'right', characterSpacing: 0.6, lineBreak: false });
        doc.moveTo(ix, top + 50).lineTo(ix + iw, top + 50).lineWidth(0.8).strokeColor(LINE).stroke();
    };
    const drawTotals = (top) => {
        let ty = top + 8;
        const line = (label, value, bold) => {
            doc.fillColor(DARK).font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 12 : 10)
                .text(label, ix, ty, { lineBreak: false })
                .text(value, ix + iw - 200, ty, { width: 200, align: 'right', lineBreak: false });
            ty += bold ? 22 : 18;
        };
        line('Items subtotal', php(order.itemsPrice));
        line('Shipping', Number(order.shippingPrice) === 0 ? 'FREE' : php(order.shippingPrice));
        line('Tax (5%)', php(order.taxPrice));
        doc.moveTo(ix, ty).lineTo(ix + iw, ty).lineWidth(1.4).strokeColor(BROWN).stroke();
        ty += 9;
        line('Grand total', php(order.totalPrice), true);
    };
    let next = 0, part = 0;
    for (;;) {
        const room = BOTTOM - y;
        let used = HEAD, end = next;
        while (end < rows.length && used + rows[end].h <= room - PAD) { used += rows[end].h; end++; }
        const withTotals = end === rows.length && used + TOTALS <= room - PAD;
        if (end === next && !withTotals) { doc.addPage(); y = 50; continue; }
        const h = used + (withTotals ? TOTALS : 0) + PAD - 6;
        card(left, y, width, h);
        drawHead(y, part === 0 ? 'Items' : 'Items (continued)');
        let ry = y + HEAD + 4;
        for (let k = next; k < end; k++) {
            const { item, h: rh } = rows[k];
            doc.fillColor(DARK).font('Helvetica').fontSize(10)
                .text(item.name, ix, ry, { width: nameW })
                .text(php(item.price), cols.price, ry, { width: 90, align: 'right', lineBreak: false })
                .text(String(item.quantity), cols.qty, ry, { width: 40, align: 'right', lineBreak: false })
                .text(php(item.price * item.quantity), cols.sub, ry, { width: 100, align: 'right', lineBreak: false });
            ry += rh;
            if (k < end - 1) doc.moveTo(ix, ry - 6).lineTo(ix + iw, ry - 6).lineWidth(0.5).strokeColor(LINE).stroke();
        }
        if (withTotals) drawTotals(ry);
        y += h + GAP;
        next = end; part += 1;
        if (withTotals) break;
        doc.addPage(); y = 50;
    }

    // payment + ship to, side by side
    const half = (width - GAP) / 2;
    const s = order.shippingInfo || {};
    const address = `${s.address || ''}, ${s.city || ''}, ${s.postalCode || ''}, ${s.country || ''}`;
    doc.font('Helvetica').fontSize(10);
    const shipH = 36 + (customer.name ? 16 : 0) + doc.heightOfString(address, { width: half - PAD * 2 }) + 16 + (customer.email ? 14 : 0) + PAD;
    const boxH = Math.max(shipH, 92);
    if (y + boxH > BOTTOM) { doc.addPage(); y = 50; }
    card(left, y, half, boxH);
    cardTitle('Payment', left + PAD, y + 14);
    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(10).text('Method: ', left + PAD, y + 36, { continued: true })
        .font('Helvetica').text(order.paymentMethod || 'Card');
    doc.fillColor(isPaid(order) ? GREEN : RED).font('Helvetica-Bold').fontSize(10).text(paymentText(order), left + PAD, y + 54, { lineBreak: false });
    if (order.deliveredAt) doc.fillColor(MUTED).font('Helvetica').fontSize(9).text(`Delivered ${when(order.deliveredAt)}`, left + PAD, y + 72, { lineBreak: false });

    const sx = left + half + GAP;
    card(sx, y, half, boxH);
    cardTitle('Ship to', sx + PAD, y + 14);
    let sy = y + 36;
    if (customer.name) { doc.fillColor(DARK).font('Helvetica-Bold').fontSize(10).text(customer.name, sx + PAD, sy, { lineBreak: false }); sy += 16; }
    doc.fillColor(DARK).font('Helvetica').fontSize(10).text(address, sx + PAD, sy, { width: half - PAD * 2 });
    doc.text(`Phone: ${s.phoneNo || ''}`, sx + PAD, doc.y + 2, { width: half - PAD * 2 });
    if (customer.email) doc.fillColor(MUTED).fontSize(9).text(customer.email, sx + PAD, doc.y + 2, { width: half - PAD * 2 });

    // footer
    doc.font('Helvetica').fontSize(9).fillColor(MUTED)
        .text('Thank you for shopping with Luna Interiors. Keep this receipt for your records.', left, 770, { width, align: 'center', lineBreak: false });

    doc.end();
});

/* ------------------------------- e-mail body ------------------------------- */
const HEADLINES = {
    placed: { subject: 'Order received', title: 'Thank you! We received your order.', note: 'We will email you again whenever the status of your order changes.' },
    Processing: { subject: 'Order is being processed', title: 'Your order is being processed.', note: 'We are preparing your items.' },
    Shipped: { subject: 'Order shipped', title: 'Your order is on its way!', note: 'Your order has been shipped and will reach you soon.' },
    Delivered: { subject: 'Order delivered', title: 'Your order has been delivered.', note: 'Thank you for shopping with us. You can now write a review for the products you bought.' },
};

// e-mail clients ignore <style> blocks, so every style is inline
const CARD = `background:${CREAM};border:1px solid ${LINE};border-radius:10px;padding:16px 18px;margin:0 0 12px`;
const CARD_TITLE = `margin:0 0 10px;font-size:15px;font-weight:bold;color:${DARK}`;
const TH = `padding:6px 4px;border-bottom:1px solid ${LINE};color:${MUTED};font-size:11px;letter-spacing:.06em;text-transform:uppercase`;
const TD = `padding:8px 4px;border-bottom:1px solid ${LINE}`;

// logo: true when the e-mail carries the logo as an inline (cid) attachment - see sendOrderEmail
const buildOrderEmail = (order, customer = {}, kind = 'placed', logo = hasLogo()) => {
    const h = HEADLINES[kind] || HEADLINES.placed;
    const tn = transactionNo(order);
    const status = order.orderStatus || 'Processing';
    const current = Math.max(STEPS.indexOf(status), 0);
    const steps = STEPS.map((step, i) => {
        const reached = i <= current;
        return `<td style="width:33%;padding:0 4px">
            <div style="background:#fff;border:1px solid ${reached ? BROWN : LINE};border-radius:8px;padding:8px 10px">
              <div style="font-weight:bold;color:${reached ? DARK : MUTED}">${reached ? '&#10003; ' : `${i + 1}. `}${step}</div>
              <div style="font-size:12px;color:${MUTED}">${reached ? esc(when(stepDate(order, step))) : 'Waiting'}</div>
            </div></td>`;
    }).join('');
    const rows = (order.orderItems || []).map(i => `
        <tr>
          <td style="${TD}">${esc(i.name)}</td>
          <td style="${TD};text-align:right">${peso(i.price)}</td>
          <td style="${TD};text-align:right">${esc(i.quantity)}</td>
          <td style="${TD};text-align:right">${peso(i.price * i.quantity)}</td>
        </tr>`).join('');
    const s = order.shippingInfo || {};
    const delivered = status === 'Delivered';
    const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:auto;color:${DARK}">
      <div style="background:${DARK};color:#fff;padding:18px 22px;border-radius:10px 10px 0 0">
        <table role="presentation" style="border-collapse:collapse"><tr>
          ${logo ? `<td style="padding:0 14px 0 0;vertical-align:middle"><img src="cid:${LOGO_CID}" width="56" height="56" alt="Luna Interiors" style="display:block;border:0"></td>` : ''}
          <td style="padding:0;vertical-align:middle;color:#fff">
            <div style="font-size:22px;font-weight:bold">Luna Interiors</div>
            <div style="opacity:.9">${esc(h.subject)} &middot; ${esc(tn)}</div>
          </td>
        </tr></table>
      </div>
      <div style="border:1px solid ${LINE};border-top:0;padding:22px;border-radius:0 0 10px 10px;background:#fff">
        <p style="margin:0 0 4px">Hi ${esc(customer.name || 'there')},</p>
        <h2 style="margin:6px 0">${esc(h.title)}</h2>
        <p style="margin:0 0 14px">${esc(h.note)}</p>
        <p style="margin:0 0 16px"><b>Order # ${esc(tn)}</b> &nbsp;
          <span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:bold;background:${delivered ? '#E3E8DC' : '#EFE4D6'};color:${delivered ? GREEN : BROWN}">${esc(status)}</span></p>

        <div style="${CARD}">
          <p style="${CARD_TITLE}">Order status</p>
          <table role="presentation" style="width:100%;border-collapse:collapse"><tr>${steps}</tr></table>
        </div>

        <div style="${CARD}">
          <p style="${CARD_TITLE}">Items</p>
          <table style="width:100%;border-collapse:collapse">
            <thead><tr>
              <th style="${TH};text-align:left">Product</th><th style="${TH};text-align:right">Price</th>
              <th style="${TH};text-align:right">Qty</th><th style="${TH};text-align:right">Subtotal</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <table style="width:100%;margin-top:10px;border-collapse:collapse">
            <tr><td style="padding:4px">Items subtotal</td><td style="padding:4px;text-align:right">${peso(order.itemsPrice)}</td></tr>
            <tr><td style="padding:4px">Shipping</td><td style="padding:4px;text-align:right">${Number(order.shippingPrice) === 0 ? 'FREE' : peso(order.shippingPrice)}</td></tr>
            <tr><td style="padding:4px">Tax (5%)</td><td style="padding:4px;text-align:right">${peso(order.taxPrice)}</td></tr>
            <tr><td style="padding:8px 4px;border-top:2px solid ${BROWN};font-size:16px"><b>Grand total</b></td>
                <td style="padding:8px 4px;border-top:2px solid ${BROWN};font-size:16px;text-align:right"><b>${peso(order.totalPrice)}</b></td></tr>
          </table>
        </div>

        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:0"><tr>
          <td style="width:50%;vertical-align:top;padding-right:6px">
            <div style="${CARD}">
              <p style="${CARD_TITLE}">Payment</p>
              <p style="margin:0 0 4px"><b>Method:</b> ${esc(order.paymentMethod || 'Card')}</p>
              <p style="margin:0;font-weight:bold;color:${isPaid(order) ? GREEN : RED}">${esc(paymentText(order))}</p>
            </div>
          </td>
          <td style="width:50%;vertical-align:top;padding-left:6px">
            <div style="${CARD}">
              <p style="${CARD_TITLE}">Ship to</p>
              ${customer.name ? `<p style="margin:0 0 4px"><b>${esc(customer.name)}</b></p>` : ''}
              <p style="margin:0">${esc(s.address)}, ${esc(s.city)}, ${esc(s.postalCode)}, ${esc(s.country)}<br>Phone: ${esc(s.phoneNo)}</p>
            </div>
          </td>
        </tr></table>

        <p style="color:${MUTED};font-size:13px;margin:6px 0 0">Your PDF receipt is attached to this email.</p>
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
        const logo = hasLogo();
        const { subject, html } = buildOrderEmail(order, customer, kind, logo);
        const attachments = [{ filename: `Receipt-${transactionNo(order)}.pdf`, content: pdf, contentType: 'application/pdf' }];
        if (logo) attachments.push({ filename: 'luna-logo.png', path: LOGO, cid: LOGO_CID });
        await sendEmail({
            email: to,
            subject,
            html,
            attachments,
        });
        return { sent: true, to };
    } catch (err) {
        console.error('Order e-mail failed:', err.message);
        return { sent: false, to, error: err.message };
    }
};

module.exports = { buildReceiptPdf, buildOrderEmail, sendOrderEmail, transactionNo };
