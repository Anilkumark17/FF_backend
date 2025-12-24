const supabase = require("../../config/db");

/**
 * Create Project
 * POST /api/dashboard
 */
const createProject = async (req, res) => {
  try {
    const { name, description, client_name, deadline } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!name || !client_name || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        owner_id: userId,
        description: description,
        name: name,
        deadline: deadline,
        client_name: client_name,
      })
      .select()
      .single();

    if (error) {
      console.error("createProject error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create project",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data,
    });
  } catch (err) {
    console.error("createProject controller error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Fetch All Projects
 * GET /api/dashboard
 */
const fetchAllProjects = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("fetchAllProjects error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch projects",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("fetchAllProjects controller error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Edit Project
 * PUT /api/projects/:id
 */
const editProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user?.id;
    const { name, description, client_name, deadline } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!name || !client_name || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const { data, error } = await supabase
      .from("projects")
      .update({
        name,
        description,
        client_name,
        deadline,
        updated_at: new Date(),
      })
      .eq("id", projectId)
      .eq("owner_id", userId)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Project not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data,
    });
  } catch (err) {
    console.error("editProject controller error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Delete Project
 * DELETE /api/projects/:id
 */
const deleteProject = async (req, res) => {
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
      .delete()
      .eq("id", projectId)
      .eq("owner_id", userId)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Project not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      data,
    });
  } catch (err) {
    console.error("deleteProject controller error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createProject,
  fetchAllProjects,
  editProject,
  deleteProject,
};
