const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    const targetEmail = 'juliannoorrizani@gmail.com';

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"Uangku App" <${process.env.EMAIL_USER}>`,
        to: targetEmail,
        subject: 'Reset PIN Akun Uangku Anda',
        html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <h2>Reset PIN Berhasil</h2>
                <p>PIN baru Anda untuk aplikasi Uangku adalah:</p>
                <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; background-color: #f0f0f0; padding: 10px; border-radius: 5px;">
                    ${newPin}
                </p>
                <p>Silakan gunakan PIN ini untuk login. Anda dapat mengubahnya di menu Pengaturan.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email reset PIN terkirim ke ${targetEmail}`);

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json({ newPin: newPin });
    } catch (error) {
        console.error('Gagal mengirim email:', error);
        res.status(500).json({ error: 'Gagal mengirim email reset PIN.' });
    }
}