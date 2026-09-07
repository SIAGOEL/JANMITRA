const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const caseRoutes = require('./routes/caseRoutes');
const draftRoutes = require('./routes/draftRoutes');
const otpRoutes = require('./routes/otpRoutes');
const phoneOTPRoutes = require('./routes/phoneOTPRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ------- Global middleware -------
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: clientUrl === '*' ? true : clientUrl.split(',').map((o) => o.trim()),
    credentials: true,
  })
);

// Documents are uploaded from the frontend as base64 data URLs, so allow a large JSON body.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ------- Health check -------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'kora-backend', time: new Date().toISOString() });
});

// ------- Routes -------
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/draft', draftRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/phone-otp', phoneOTPRoutes);

// ------- Error handling (keep last) -------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
