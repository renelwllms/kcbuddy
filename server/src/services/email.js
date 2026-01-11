const FormData = require("form-data");
const Mailgun = require("mailgun.js");

const { API_KEY, MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM } = process.env;

function isEmailConfigured() {
  const key = API_KEY || MAILGUN_API_KEY;
  return Boolean(key && MAILGUN_DOMAIN && MAILGUN_FROM);
}

function getClient() {
  const MailgunClient = Mailgun.default || Mailgun;
  const mailgun = new MailgunClient(FormData);
  return mailgun.client({
    username: "api",
    key: API_KEY || MAILGUN_API_KEY
  });
}

async function sendFamilyWelcomeEmail({ to, familyName, familyCode, parentName, parentCode }) {
  if (!isEmailConfigured()) {
    return { skipped: true };
  }

  const client = getClient();
  const fromAddress = MAILGUN_FROM;
  const subject = "Your KCBuddy family account details";
  const text = `Hi ${parentName || "there"},

Welcome to KCBuddy! Here are your family details:

Family name: ${familyName}
Family code: ${familyCode}
Parent login code: ${parentCode}

Keep these codes handy for your household.`;

  const html = `<p>Hi ${parentName || "there"},</p>
<p>Welcome to <strong>KCBuddy</strong>! Here are your family details:</p>
<ul>
  <li><strong>Family name:</strong> ${familyName}</li>
  <li><strong>Family code:</strong> ${familyCode}</li>
  <li><strong>Parent login code:</strong> ${parentCode}</li>
</ul>
<p>Keep these codes handy for your household.</p>`;

  return client.messages.create(MAILGUN_DOMAIN, {
    from: fromAddress,
    to: [to],
    subject,
    text,
    html
  });
}

module.exports = {
  sendFamilyWelcomeEmail
};
