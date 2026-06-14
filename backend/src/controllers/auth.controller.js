export async function checkAuth(req, res) {
  try {
    console.log("checkAuth req.user:", req.user);

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("Error in checkAuth:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
}
