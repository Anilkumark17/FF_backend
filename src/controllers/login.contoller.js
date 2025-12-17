const supabase = require("../config/db");

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Supabase v2 auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      token: data.session.access_token,
      user: data.user,
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { loginController };
