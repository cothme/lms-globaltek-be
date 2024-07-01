const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    // Find the index of "uploads/" in the URL
    const startIndex = url.indexOf("uploads/") + "uploads/".length;

    // Find the index of the file extension, assuming it's .png, .jpg, etc.
    const endIndex = url.lastIndexOf(".");

    // Extract the substring between startIndex and endIndex
    return url.substring(startIndex, endIndex);
  } catch (error) {
    console.error("Error extracting public_id from URL:", error);
    return null;
  }
};

export default extractPublicIdFromUrl;
