import nodemailer from 'nodemailer';

export async function sendEmail(to: string, html: string) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();
  // console.log('testAccount', testAccount);
  //   {
  //   user: 'tbbpehz3ehi74ydc@ethereal.email',
  //   pass: '5Tqnqr5QVSZqzjfqy8',
  //   smtp: { host: 'smtp.ethereal.email', port: 587, secure: false
  // },
  //   imap: { host: 'imap.ethereal.email', port: 993, secure: true },
  //   pop3: { host: 'pop3.ethereal.email', port: 995, secure: true },
  //   web: 'https://ethereal.email'
  // }

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'tbbpehz3ehi74ydc@ethereal.email', // generated ethereal user
      pass: '5Tqnqr5QVSZqzjfqy8', // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to, // list of receivers
    subject: 'Change Password', // Subject line
    html, // html body
  });

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
