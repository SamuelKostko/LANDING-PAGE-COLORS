const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Método no permitido' });
    }

    const { name, company, phone, email, format, message } = req.body;

    // SMTP Transporter configuration
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: `"ADMINISTRACION COLORS" <${process.env.SMTP_SENDER}>`,
        to: process.env.RECEIVER_EMAIL,
        replyTo: email,
        subject: `Nueva Cotización: ${format} - ${name}`,
        text: `
            Has recibido una nueva solicitud de contacto desde la web (Vercel).

            Nombre: ${name}
            Empresa: ${company || 'No especificada'}
            Teléfono: ${phone}
            Email: ${email}
            Formato interesado: ${format}

            Mensaje:
            ${message || 'Sin mensaje adicional'}
        `,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #1E5BA8;">Nueva Solicitud de Cotización</h2>
                <p><strong>Nombre:</strong> ${name}</p>
                <p><strong>Empresa:</strong> ${company || 'No especificada'}</p>
                <p><strong>Teléfono:</strong> ${phone}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Formato:</strong> ${format}</p>
                <hr>
                <p><strong>Mensaje:</strong></p>
                <p>${message ? message.replace(/\n/g, '<br>') : 'Sin mensaje adicional'}</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: 'Correo enviado con éxito' });
    } catch (error) {
        console.error('Error enviando correo:', error);
        return res.status(500).json({ success: false, message: 'Error al enviar el correo', error: error.message });
    }
}
