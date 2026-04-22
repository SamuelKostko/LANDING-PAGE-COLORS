const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SMTP Transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log("SMTP Error:", error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

// Route to handle form submission
app.post('/send-email', (req, res) => {
    const { name, company, phone, email, format, message } = req.body;

    const mailOptions = {
        from: `"ADMINISTRACION COLORS" <${process.env.SMTP_SENDER}>`, 
        to: process.env.RECEIVER_EMAIL,
        replyTo: email,
        subject: `Nueva Cotización: ${format} - ${name}`,
        text: `
            Has recibido una nueva solicitud de contacto desde la web.

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

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).send({ success: false, message: 'Error al enviar el correo' });
        }
        console.log('Correo enviado: ' + info.response);
        res.status(200).send({ success: true, message: 'Correo enviado con éxito' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
