const products = require("../lib/products");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  const { name, phone, address, items } = req.body;
  if (!name || !phone || !address || !Array.isArray(items)) {
    return res.status(400).json({ error: "Missing fields" });
  }

  let basic = 0;
  const itemsList = items
    .map((i) => {
      const p = products.find((x) => x.id === Number(i.id));
      if (!p) return null;
      const qty = Math.max(1, parseInt(i.qty) || 1);
      const total = p.price * qty;
      basic += total;
      return { name: p.name, qty, rate: p.price, total };
    })
    .filter(Boolean);

  const cgst = basic * 0.09;
  const sgst = basic * 0.09;

  const order = {
    id: Date.now(),
    time: new Date().toLocaleString(),
    name,
    phone,
    address,
    itemsList,
    items: itemsList.map((i) => `${i.name} (Qty: ${i.qty})`).join(", "),
    basicTotal: basic.toFixed(2),
    cgst: cgst.toFixed(2),
    sgst: sgst.toFixed(2),
    grandTotal: (basic + cgst + sgst).toFixed(2),
  };

  try {
    const getRes = await fetch(
      `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_ID}/latest`,
      {
        headers: { "X-Master-Key": process.env.JSONBIN_KEY },
      },
    );
    const data = await getRes.json();
    const orders = Array.isArray(data.record) ? data.record : [];
    orders.unshift(order);

    await fetch(`https://api.jsonbin.io/v3/b/${process.env.JSONBIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": process.env.JSONBIN_KEY,
      },
      body: JSON.stringify(orders),
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save order" });
  }
};
