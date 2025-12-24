const supabase = require("../../config/db");

/**
 * GET CURRENT PROJECT DETAILS
 */
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

/**
 * SEND INVITE (DIRECT ADD, NO ACCEPTANCE)
 */
const sendInvite = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user?.id;
    const project_id = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // 1. Find user by email
    const { data: member, error: memberError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (memberError || !member) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Insert directly into project_members
    const { data: projectInvite, error: inviteError } = await supabase
      .from("project_members")
      .insert([
        {
          project_id: project_id,
          user_id: member.id,
          role: "editor",
        },
      ])
      .select()
      .single();

    if (inviteError) {
      return res.status(400).json({
        success: false,
        message: inviteError.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: projectInvite,
    });
  } catch (error) {
    console.error("sendInvite error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  currentProjectDetails,
  sendInvite,
};
