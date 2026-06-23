const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const categories = [
  "Electronics",
  "Fashion",
  "Books",
  "Sports",
  "Home",
  "Beauty",
  "Toys",
  "Grocery",
];

const TOTAL_PRODUCTS = 200000;
const BATCH_SIZE = 5000;

function randomCategory() {
  return categories[Math.floor(Math.random() * categories.length)];
}

function randomPrice() {
  return (Math.random() * 10000 + 100).toFixed(2);
}

async function seedProducts() {
  try {
    console.log("Starting seeding...");

    for (let start = 0; start < TOTAL_PRODUCTS; start += BATCH_SIZE) {
      const values = [];
      const placeholders = [];

      for (let i = 0; i < BATCH_SIZE && start + i < TOTAL_PRODUCTS; i++) {
        const index = start + i;

        const id = uuidv4();
        const name = `Product ${index + 1}`;
        const category = randomCategory();
        const price = randomPrice();

        const createdAt = new Date(
          Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
        );

        const updatedAt = createdAt;

        const offset = i * 6;

        placeholders.push(
          `($${offset + 1},$${offset + 2},$${offset + 3},$${offset + 4},$${offset + 5},$${offset + 6})`
        );

        values.push(
          id,
          name,
          category,
          price,
          createdAt,
          updatedAt
        );
      }

      await pool.query(
        `
        INSERT INTO products
        (id,name,category,price,created_at,updated_at)
        VALUES ${placeholders.join(",")}
      `,
        values
      );

      console.log(
        `Inserted ${Math.min(start + BATCH_SIZE, TOTAL_PRODUCTS)} products`
      );
    }

    console.log("Seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedProducts();