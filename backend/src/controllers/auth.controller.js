export async function checkAuth(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.status(200).json({
    success: true,
    user: req.user,
  });
}
