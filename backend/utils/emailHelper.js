const https = require('https');

const sendEmail = ({ to, toName, subject, htmlContent }) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      sender: { name: 'PayFlow', email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent,
    });

    const req = https.request(
      {
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`Brevo API error ${res.statusCode}: ${data}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

const sendWelcomeEmail = async (employee, plainPassword) => {
  const fullName = `${employee.firstName} ${employee.lastName}`;
  await sendEmail({
    to: employee.email,
    toName: fullName,
    subject: 'Welcome to PayFlow — Your Account Details',
    htmlContent: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0F0F1A;color:#E2E8F0;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6C63FF,#00D4AA);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:28px;color:#fff;">Welcome to <span style="color:#fff;">PayFlow</span></h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Payroll Intelligence System</p>
        </div>
        <div style="padding:32px;">
          <p style="font-size:16px;margin:0 0 24px;">Hi <strong>${fullName}</strong>,</p>
          <p style="color:#94A3B8;margin:0 0 24px;">Your employee account has been created. Here are your login credentials:</p>
          <div style="background:#1A1A2E;border:1px solid #2D2D44;border-radius:8px;padding:20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="color:#94A3B8;font-size:13px;padding:6px 0;">Login URL</td>
                <td style="font-family:monospace;color:#6C63FF;font-size:13px;text-align:right;">${process.env.FRONTEND_URL || 'https://payflow-f.onrender.com'}</td>
              </tr>
              <tr>
                <td style="color:#94A3B8;font-size:13px;padding:6px 0;">Email</td>
                <td style="font-family:monospace;color:#E2E8F0;font-size:13px;text-align:right;">${employee.email}</td>
              </tr>
              <tr>
                <td style="color:#94A3B8;font-size:13px;padding:6px 0;">Password</td>
                <td style="font-family:monospace;color:#00D4AA;font-size:13px;text-align:right;">${plainPassword}</td>
              </tr>
              <tr>
                <td style="color:#94A3B8;font-size:13px;padding:6px 0;">Department</td>
                <td style="font-family:monospace;color:#E2E8F0;font-size:13px;text-align:right;">${employee.department}</td>
              </tr>
              <tr>
                <td style="color:#94A3B8;font-size:13px;padding:6px 0;">Designation</td>
                <td style="font-family:monospace;color:#E2E8F0;font-size:13px;text-align:right;">${employee.designation}</td>
              </tr>
            </table>
          </div>
          <p style="color:#94A3B8;font-size:13px;margin:0 0 8px;">⚠️ Please change your password after your first login.</p>
          <p style="color:#64748B;font-size:12px;margin:0;">If you have any issues, contact your HR administrator.</p>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #2D2D44;text-align:center;">
          <p style="color:#64748B;font-size:11px;margin:0;">PayFlow Payroll Intelligence System</p>
        </div>
      </div>
    `,
  });
};

const sendPayrollEmail = async (employee, payroll) => {
  const fullName = `${employee.firstName} ${employee.lastName}`;
  const fmt = (n) => `Rs.${Math.abs(n || 0).toLocaleString('en-IN')}`;
  await sendEmail({
    to: employee.email,
    toName: fullName,
    subject: `PayFlow — Your ${payroll.month} ${payroll.year} Payslip is Ready`,
    htmlContent: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0F0F1A;color:#E2E8F0;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6C63FF,#00D4AA);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:24px;color:#fff;">Payslip Ready</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${payroll.month} ${payroll.year}</p>
        </div>
        <div style="padding:32px;">
          <p style="font-size:16px;margin:0 0 24px;">Hi <strong>${fullName}</strong>,</p>
          <p style="color:#94A3B8;margin:0 0 24px;">Your salary for ${payroll.month} ${payroll.year} has been processed and approved.</p>
          <div style="background:#1A1A2E;border:1px solid #2D2D44;border-radius:8px;padding:20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="color:#94A3B8;font-size:13px;padding:6px 0;">Basic Salary</td><td style="font-family:monospace;color:#E2E8F0;font-size:13px;text-align:right;">${fmt(payroll.basicSalary)}</td></tr>
              <tr><td style="color:#94A3B8;font-size:13px;padding:6px 0;">HRA</td><td style="font-family:monospace;color:#00D4AA;font-size:13px;text-align:right;">+${fmt(payroll.hra)}</td></tr>
              ${payroll.overtimePay > 0 ? `<tr><td style="color:#94A3B8;font-size:13px;padding:6px 0;">Overtime</td><td style="font-family:monospace;color:#00D4AA;font-size:13px;text-align:right;">+${fmt(payroll.overtimePay)}</td></tr>` : ''}
              ${payroll.lopDays > 0 ? `<tr><td style="color:#94A3B8;font-size:13px;padding:6px 0;">LOP (${payroll.lopDays} days)</td><td style="font-family:monospace;color:#FF4365;font-size:13px;text-align:right;">-${fmt(payroll.lopDeduction)}</td></tr>` : ''}
              <tr><td style="color:#94A3B8;font-size:13px;padding:6px 0;">PF + Prof Tax</td><td style="font-family:monospace;color:#FF4365;font-size:13px;text-align:right;">-${fmt(payroll.totalDeductions)}</td></tr>
              <tr style="border-top:1px solid #2D2D44;"><td style="color:#fff;font-size:14px;font-weight:bold;padding:10px 0 6px;">Net Salary</td><td style="font-family:monospace;color:#6C63FF;font-size:16px;font-weight:bold;text-align:right;padding:10px 0 6px;">${fmt(payroll.netSalary)}</td></tr>
            </table>
          </div>
          <a href="${process.env.FRONTEND_URL || 'https://payflow-f.onrender.com'}/my-payslips" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#6C63FF,#00D4AA);color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">View Payslip</a>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #2D2D44;text-align:center;">
          <p style="color:#64748B;font-size:11px;margin:0;">PayFlow Payroll Intelligence System</p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendWelcomeEmail, sendPayrollEmail };

