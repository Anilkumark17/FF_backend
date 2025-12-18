const supabase = require("../../config/db");

const currentProjectDetails = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { data, error } = await supabase
      .from("projects")
      .select("id, name, description, client_name, deadline")
      .eq("id", projectId)
      .eq("owner_id", userId)
      .single(); 

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Project not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
    
  } catch (err) {
    console.error("currentProjectDetails error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports =  currentProjectDetails 