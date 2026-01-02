const supabase = require("../config/db");

/**
 * GET PUBLIC FINAL OUTPUT - View final output without authentication
 */
const getPublicFinalOutput = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Output ID is required" });
    }

    console.log(`Fetching public final output: ${id}`);

    const { data, error } = await supabase
      .from("final_outputs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching public final output:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch final output",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error in getPublicFinalOutput:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * ADD PUBLIC COMMENT - Add comment without authentication (requires name)
 */
const addPublicComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, comment, timestamp_seconds } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Output ID is required" });
    }

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    if (!comment?.trim()) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    console.log(`Adding public comment to final output: ${id}`);

    // For public comments, we'll store them with user_id as null and include name in comment
    const commentWithName = `[${name.trim()}]: ${comment.trim()}`;

    const { data: commentData, error } = await supabase
      .from("final_comments")
      .insert({
        final_output_id: id,
        user_id: null, // Public comment
        comment: commentWithName,
        timestamp_seconds: timestamp_seconds || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding public comment:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to add comment",
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: commentData,
    });
  } catch (error) {
    console.error("Error in addPublicComment:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET PUBLIC COMMENTS - Get all comments for a final output (no auth)
 */
const getPublicComments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Output ID is required" });
    }

    console.log(`Fetching public comments for final output: ${id}`);

    const { data, error } = await supabase
      .from("final_comments")
      .select("*")
      .eq("final_output_id", id)
      .order("timestamp_seconds", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching public comments:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch comments",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error in getPublicComments:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getPublicFinalOutput,
  addPublicComment,
  getPublicComments,
};
