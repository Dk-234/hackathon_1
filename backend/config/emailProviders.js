/**
 * Alternative email provider configurations for password reset functionality
 * Uncomment and use any of these in your .env file
 */

// Gmail configuration
const gmailConfig = {
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password' // Use an App Password if 2FA is enabled
  }
};

// Outlook configuration
const outlookConfig = {
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@outlook.com',
    pass: 'your-password'
  }
};

// Mailtrap (for testing)
const mailtrapConfig = {
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '0b160a955d0cd9',
    pass: '097691fdb1bb0f'
  }
};

// Ethereal (for testing - generates a temporary email account)
const createEtherealTransport = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    return {
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    };
  } catch (error) {
    console.error('Failed to create ethereal account', error);
    return null;
  }
};

module.exports = {
  gmailConfig,
  outlookConfig,
  mailtrapConfig,
  createEtherealTransport
};
