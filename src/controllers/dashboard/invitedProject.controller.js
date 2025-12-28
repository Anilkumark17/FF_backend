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
          deadline,
          client_name
        )
      `)
      .eq("user_id", memberId);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ message: "Query failed" });
    }

    // Transform data to make it easier for frontend
    const transformedData = data.map(item => ({
      project_id: item.project_id,
      id: item.projects?.id,
      name: item.projects?.name,
      description: item.projects?.description,
      deadline: item.projects?.deadline,
      client_name: item.projects?.client_name,
      // Also keep nested structure for compatibility
      projects: item.projects
    }));

    return res.status(200).json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error("invited project error", error);
    res.status(500).json({
      message: "error in the invited project",
    });
  }
};

module.exports = invitedProject;
