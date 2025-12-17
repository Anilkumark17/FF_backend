const currentUser = async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error("Get Current User Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { currentUser };
