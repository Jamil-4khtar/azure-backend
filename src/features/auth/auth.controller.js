import { findUserByEmail, createUser, loginUser, registerUserWithInvite } from "./auth.service.js";

export const register = async (req, res) => {
  try {
    const { invite, name, password } = req.body;
		const token = invite;

    if (!token || !name || !password) {
      return res
        .status(400)
        .json({ error: "Token, name, and password are required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long." });
    }

    const newUser = await registerUserWithInvite({ token, name, password });

    // Don't send the password back in the response
    const { password: _, ...userToSend } = newUser;

    res
      .status(201)
      .json({ message: "User registered successfully", user: userToSend });
  } catch (error) {
    console.error("Registration Error:", error);
    // Send a more generic error message to the client
    res.status(400).json({ error: error.message || "Registration failed." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const result = await loginUser(email, password);

    if (!result) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    res.status(200).json({ message: "Login successful", ...result });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};


export const getProfile = async (req, res) => {
	try {
		const {password: _, ...userProfile } = req.user;
		res.status(200).json({ user: userProfile })
	} catch (error) {
		console.error("Profile Error:", error);
    res.status(500).json({ error: "An unexpected error occurred." })
	}
}