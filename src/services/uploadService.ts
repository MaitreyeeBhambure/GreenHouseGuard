export const upload = async (item: any) => {
  try {
    const formData = new FormData();

    formData.append("file", {
      uri: item.uri,
      type: item.type || "image/jpeg",
      name: item.fileName || "photo.jpg",
    });

    const response = await fetch("https://local-api.com/upload", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
        // Authorization: `Bearer ${token}` (if needed)
      },
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Upload error:", error);
    throw error; // important for retry logic
  }
};