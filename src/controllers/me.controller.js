const currentUser = async (req, res) => {
  try {
    // req.user is set by the authMiddleware
    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }
    console.log(req.user);
    res.json({
      user: req.user,
    });
  } catch (error) {
    console.error("Get Current User Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { currentUser };
