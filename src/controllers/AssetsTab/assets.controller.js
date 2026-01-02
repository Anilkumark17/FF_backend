const supabase = require("../../config/db");
const { UTApi } = require("uploadthing/server");

// Use the provided UploadThing token
const uploadthingToken = 'eyJhcGlLZXkiOiJza19saXZlXzQ3ZmM3OThlN2EwMzE5NjZmNjcwZTUxOWNjOWFkMDkyZTVkMDMyN2EzYjRmMWViMjMxOTcxM2VhY2RkOTY5MzEiLCJhcHBJZCI6Im8zY3NseGZ6d2EiLCJyZWdpb25zIjpbInNlYTEiXX0=';

// Initialize UploadThing
const utapi = new UTApi({ token: uploadthingToken });

/**
 * Normalizes MIME type to simple category for database check constraint
 */

const normalizeAssetType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "audio";
  if (mimetype.includes("pdf")) return "pdf";
  if (mimetype.includes("text/plain")) return "text";
  if (
    mimetype.includes("msword") ||
    mimetype.includes("officedocument")
  ) {
    return "text"; // Trying 'text' for other docs or we could try 'other'
  }
  return "other";
};

/**
 * UPLOAD ASSETS - Using UploadThing
 */
const uploadAssets = async (req, res) => {
  try {
    console.log("=== Upload Assets (UploadThing) ===");
    
    const { filename, project_id } = req.body;
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
      .from("assets")
      .insert({
        project_id,
        title: filename.trim(),
        file_url: fileUrl,
        type: normalizeAssetType(file.mimetype),
        created_by: userId,
        is_fixed: false,
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
    console.error("❌ Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  }
};

/**
 * GET PROJECT ASSETS
 */
const getProjectAssets = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!projectId) {
      return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    console.log(`Fetching assets for project: ${projectId}`);

    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching assets:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch assets",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("❌ Error in getProjectAssets:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { uploadAssets, getProjectAssets };
