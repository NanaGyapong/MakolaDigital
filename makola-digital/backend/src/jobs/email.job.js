// jobs/email.job.js
import Queue from "bull";
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({ host:process.env.SMTP_HOST, port:587, auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS} });
export const emailQueue = new Queue("emails", process.env.REDIS_URL);
const t = {
  "verify-email":({name,otp})=>({ subject:"Verify your Makola Digital account", html:`<p>Hi ${name}, your code is: <strong>${otp}</strong>. Expires in 10 minutes.</p>` }),
  "forgot-password":({name,token})=>({ subject:"Reset your Makola Digital password", html:`<p>Hi ${name}, <a href="${process.env.CLIENT_URL}/auth/reset-password?token=${token}">reset your password</a>. Expires in 30 minutes.</p>` }),
  "kyc-result":({name,status,note})=>({ subject:status==="verified"?"Your account is now verified!":"Makola KYC update", html:`<p>Hi ${name}. KYC status: ${status}. ${note||""}</p>` }),
};
emailQueue.process(async(job)=>{
  const tmpl=t[job.name]; if(!tmpl) return;
  const{subject,html}=tmpl(job.data);
  await transporter.sendMail({from:`"Makola Digital" <${process.env.FROM_EMAIL}>`,to:job.data.to,subject,html});
});
