import { findUserByEmail, createUser, loginUser } from "./auth.service.js";

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "A user with this email already exists." });
    }

    const newUser = await createUser(email, password, name);

    // Don't send the password back in the response
    const { password: _, ...userToSend } = newUser;

    res
      .status(201)
      .json({ message: "User created successfully", user: userToSend });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
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
