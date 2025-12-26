const supabase = require("../../config/db");

/**
 * GET CURRENT PROJECT DETAILS
 * Allows project owner AND invited members to view details
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

    // First, get the project details
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name, description, client_name, deadline, owner_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is the owner
    const isOwner = project.owner_id === userId;

    // If not owner, check if user is an invited member
    let isMember = false;
    if (!isOwner) {
      const { data: memberData, error: memberError } = await supabase
        .from("project_members")
        .select("id")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .single();

      isMember = !memberError && memberData;
    }

    // User must be either owner or member to access
    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this project",
      });
    }

    // Remove owner_id from response and add access info
    const { owner_id, ...projectData } = project;
    
    return res.status(200).json({
      success: true,
      data: {
        ...projectData,
        isOwner, // Frontend can use this to show/hide features
      },
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
 * Only project owner can send invites
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

    // Check if user is the project owner
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("owner_id")
      .eq("id", project_id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Only owner can invite
    if (project.owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can invite members",
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

    // Check if already a member
    const { data: existingMember } = await supabase
      .from("project_members")
      .select("id")
      .eq("project_id", project_id)
      .eq("user_id", member.id)
      .single();

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this project",
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
      message: "User added to project successfully",
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
