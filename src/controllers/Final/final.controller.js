const supabase = require("../../config/db");
const { UTApi } = require("uploadthing/server");

// Use the provided UploadThing token
const uploadthingToken =
  "eyJhcGlLZXkiOiJza19saXZlXzQ3ZmM3OThlN2EwMzE5NjZmNjcwZTUxOWNjOWFkMDkyZTVkMDMyN2EzYjRmMWViMjMxOTcxM2VhY2RkOTY5MzEiLCJhcHBJZCI6Im8zY3NseGZ6d2EiLCJyZWdpb25zIjpbInNlYTEiXX0=";

// Initialize UploadThing
const utapi = new UTApi({ token: uploadthingToken });

/**
 * Normalizes MIME type to simple category for database check constraint
 */

const normalizeAssetType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.includes("pdf")) return "link"; // PDFs stored as links since 'pdf' not in schema
  if (mimetype.includes("text/plain")) return "text";
  if (mimetype.includes("msword") || mimetype.includes("officedocument")) {
    return "text"; // Docs as text
  }
  return "link"; // Default to link for other types
};

const finalUploadAssets = async (req, res) => {
  try {
    console.log("=== Upload Assets (UploadThing) ===");
    
    const { filename, project_id ,description} = req.body;
    const file = req.file;
    const userId = req.user?.id;

    // Validate
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!filename?.trim()) {
      return res.status(400).json({ success: false, message: "Filename required" });
    }
    if (!project_id) {
      return res.status(400).json({ success: false, message: "Project ID required" });
    }
    if (!file) {
      return res.status(400).json({ success: false, message: "File required" });
    }

    console.log("Uploading:", file.originalname, file.size, "bytes");

    // Create Blob for Node.js (File constructor doesn't exist in Node)
    const blob = new Blob([file.buffer], { type: file.mimetype });
    
    // Add filename as property (UploadThing needs this)
    Object.defineProperty(blob, 'name', {
      value: file.originalname,
      writable: false,
    });

    // Upload to UploadThing
    const uploadResponse = await utapi.uploadFiles(blob);

    console.log("Upload response:", JSON.stringify(uploadResponse, null, 2));

    // Handle response - UploadThing returns array or single object
    const uploadResult = Array.isArray(uploadResponse) ? uploadResponse[0] : uploadResponse;

    if (!uploadResult || uploadResult.error) {
      console.error("Upload failed:", uploadResult?.error);
      return res.status(500).json({
        success: false,
        message: "Upload failed",
        error: uploadResult?.error?.message || "Unknown error",
      });
    }

    // Use ufsUrl (new) or fallback to url (deprecated)
    const fileUrl = uploadResult.data?.ufsUrl || uploadResult.data?.url;
    const fileKey = uploadResult.data?.key;

    if (!fileUrl) {
      console.error("No URL in response:", uploadResult);
      return res.status(500).json({
        success: false,
        message: "Upload succeeded but no URL returned",
      });
    }

    console.log("✅ Uploaded:", fileUrl);

    // Save to database
    const { data: assetData, error: dbError } = await supabase
      .from("final_outputs")
      .insert({
        project_id,
        title: filename.trim(),
        source_url: fileUrl,
        description:description?.trim() || null,
        type: normalizeAssetType(file.mimetype),
        created_by: userId,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError.message);
      // Rollback
      try {
        await utapi.deleteFiles([fileKey]);
        console.log("Rolled back upload");
      } catch (e) {
        console.error("Rollback failed:", e);
      }
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: dbError.message,
      });
    }

    console.log("✅ Success!");
    return res.status(201).json({
      success: true,
      message: "Asset uploaded successfully",
      data: assetData,
    });
  } catch (error) {
    console.error("Error in finalUploadAssets:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


/**
 * GET FINAL OUTPUTS - Get all final outputs for a project
 */
const getFinalOutputs = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!projectId) {
      return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    console.log(`Fetching final outputs for project: ${projectId}`);

    const { data, error } = await supabase
      .from("final_outputs")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true }); // Chronological order (oldest first)

    if (error) {
      console.error("Error fetching final outputs:");
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error("Error details:", error.details);
      console.error("Full error:", JSON.stringify(error, null, 2));
      return res.status(500).json({
        success: false,
        message: "Failed to fetch final outputs",
        error: error.message,
        details: error.details,
      });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error in getFinalOutputs:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET FINAL OUTPUT BY ID - Get single final output with details
 */
const getFinalOutputById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ success: false, message: "Output ID is required" });
    }

    console.log(`Fetching final output: ${id}`);

    const { data, error } = await supabase
      .from("final_outputs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching final output:", error.message);
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
    console.error("Error in getFinalOutputById:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * ADD COMMENT - Add comment to final output
 */
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, timestamp_seconds } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ success: false, message: "Output ID is required" });
    }

    if (!comment?.trim()) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    console.log(`Adding comment to final output: ${id}`);

    const { data: commentData, error } = await supabase
      .from("final_comments")
      .insert({
        final_output_id: id,
        user_id: userId,
        comment: comment.trim(),
        timestamp_seconds: timestamp_seconds || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error adding comment:", error.message);
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
    console.error("Error in addComment:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * GET COMMENTS - Get all comments for a final output
 */
const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ success: false, message: "Output ID is required" });
    }

    console.log(`Fetching comments for final output: ${id}`);

    const { data, error } = await supabase
      .from("final_comments")
      .select("*")
      .eq("final_output_id", id)
      .order("timestamp_seconds", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error.message);
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
    console.error("Error in getComments:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  finalUploadAssets,
  getFinalOutputs,
  getFinalOutputById,
  addComment,
  getComments,
};