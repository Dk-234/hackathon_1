const nodemailer = require('nodemailer');

// @desc    Share article via email
// @route   POST /api/share/email
// @access  Private
const shareViaEmail = async (req, res) => {
  const { article, recipientEmail, message } = req.body;
  const { username } = req.user;

  if (!article || !recipientEmail) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      subject: `${username} shared a news article with you`,
      html: `
        <h2>${username} shared an article with you</h2>
        <h3>${article.title}</h3>
        ${message ? `<p><strong>Message from ${username}:</strong> ${message}</p>` : ''}
        <p>${article.description || ''}</p>
        ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" style="max-width: 100%; height: auto; max-height: 300px;">` : ''}
        <p><a href="${article.url}" target="_blank">Read the full article</a></p>
        <p><small>Shared via News Aggregator</small></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ success: true, message: 'Article shared successfully' });
  } catch (error) {
    console.error('Share via email error:', error);
    res.status(500).json({ message: 'Failed to share article' });
  }
};

module.exports = {
  shareViaEmail
};
