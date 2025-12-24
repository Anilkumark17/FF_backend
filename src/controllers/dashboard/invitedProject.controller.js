const supabase = require("../../config/db");

const invitedProject = async (req, res) => {
  try {
    const memberId = req.user?.id;

    if (!memberId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("project_members")
      .select(`
        project_id,
        projects (
          id,
          name,
          description,
          deadline
        )
      `)
      .eq("user_id", memberId);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ message: "Query failed" });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("invited project error", error);
    res.status(500).json({
      message: "error in the invited project",
    });
  }
};

module.exports = invitedProject;
