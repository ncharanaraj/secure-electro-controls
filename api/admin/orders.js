module.exports = async (req, res) => {
  if (req.headers["x-admin-password"] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const r = await fetch(
    `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_ID}/latest`,
    {
      headers: { "X-Master-Key": process.env.JSONBIN_KEY },
    },
  );
  const data = await r.json();
  res.json(Array.isArray(data.record) ? data.record : []);
};
