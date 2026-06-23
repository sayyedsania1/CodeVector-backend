const pool = require("./db/db");
const express= require('express');
const cors=require('cors');
const productRoutes = require("./routes/productRoutes");
const app= express();
app.use(cors());
app.use(express.json());
app.use("/products", productRoutes);
app.get('/',(req,res)=>{
    res.json({
    success: true,
    message: "CodeVector Backend Running"

    });
});
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
const port=process.env.port || 5000;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});