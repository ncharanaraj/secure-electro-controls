module.exports = async (req, res) => {
  if (req.headers["x-admin-password"] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { id } = req.body;
  const r = await fetch(
    `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_ID}/latest`,
    {
      headers: { "X-Master-Key": process.env.JSONBIN_KEY },
    },
  );
  const data = await r.json();
  const orders = (data.record || []).filter((o) => Number(o.id) !== Number(id));

  await fetch(`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": process.env.JSONBIN_KEY,
    },
    body: JSON.stringify(orders),
  });
  res.json({ ok: true });
};
