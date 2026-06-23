const pool = require("../db/db");

const getProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const cursor = req.query.cursor;

    let query = `
      SELECT *
      FROM products
    `;

    const params = [];
    const conditions = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (cursor) {
      const decoded = JSON.parse(
  Buffer.from(cursor, "base64url").toString("utf-8")
);

      params.push(decoded.created_at);
      params.push(decoded.id);

      conditions.push(
        `(created_at, id) < ($${params.length - 1}, $${params.length})`
      );
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    params.push(limit + 1);

    query += ` ORDER BY created_at DESC, id DESC LIMIT $${params.length}`;

    const result = await pool.query(query, params);

    let nextCursor = null;
    let products = result.rows;

    if (products.length > limit) {
      const lastItem = products[limit - 1];

     nextCursor = Buffer.from(
  JSON.stringify({
    created_at: lastItem.created_at,
    id: lastItem.id,
  })
).toString("base64url");

      products = products.slice(0, limit);
    }

    res.json({
      count: products.length,
      nextCursor,
      products,
    });
  } catch (error) {
    console.error(error);
    console.log("Received Cursor:", cursor);
    console.log(
  Buffer.from(cursor, "base64").toString("utf-8")
);
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
};