import { requestPasswordReset, resendResetEmail, resetPassword } from './password-reset.service.js';

export const handlePasswordResetRequest = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    await requestPasswordReset(email);

    // Always send a success response to prevent attackers from guessing which emails are registered.
    res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

  } catch (error) {
    console.error('Password Reset Request Error:', error);
    // Send a generic error message
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

// --- NEW CONTROLLER: HANDLE RESEND ---
export const handleResendRequest = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }
        const result = await resendResetEmail(email);
        res.status(200).json(result);
    } catch (error) {
        console.error('Resend Email Error:', error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
};


// --- NEW CONTROLLER: HANDLE PASSWORD RESET ---
export const handleResetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }
    
    // You might want to add password strength validation here

    const success = await resetPassword(token, password);

    if (!success) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};