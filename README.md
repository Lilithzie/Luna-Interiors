# Luna Interiors

<p align="center">
  A modern online furniture shop built for our Integrative Programming and Technology subject with <strong>MERN Stack</strong>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/MongoDB-Database-B76E79" alt="MongoDB">
  <img src="https://img.shields.io/badge/Express.js-Backend-B76E79" alt="Express.js">
  <img src="https://img.shields.io/badge/React.js-Frontend-B76E79" alt="React.js">
  <img src="https://img.shields.io/badge/Node.js-Runtime-B76E79" alt="Node.js">
  <img src="https://img.shields.io/badge/Cloudinary-Image%20Storage-B76E79" alt="Cloudinary">
  <img src="https://img.shields.io/badge/Firebase-Authentication-B76E79" alt="Firebase">
</p>

---

## 📖 About

**Luna Interiors** is an online furniture shop developed using the **JavaScript MERN Stack** — MongoDB, Express.js, React.js, and Node.js.

The platform allows customers to:

* 🛍️ Browse furniture products
* 🔎 Search and explore available items
* 🛒 Purchase furniture
* ⭐ Review and rate products
* 👤 Manage their profiles and accounts

Administrators can:

* 📦 Manage products and inventory
* 👥 Manage users
* 🧾 Manage transactions
* 📊 Monitor sales
* ⭐ Manage customer reviews

---

## 🛠️ Technologies Used

| Technology                  | Purpose                      |
| --------------------------- | ---------------------------- |
| **MongoDB**                 | Database                     |
| **Express.js**              | Backend framework            |
| **React.js**                | Frontend library             |
| **Node.js**                 | Server-side runtime          |
| **Cloudinary**              | Image storage and management |
| **Firebase Authentication** | User authentication          |

---

## ✨ Features

### 👤 Customer

* User registration and login
* Profile management
* Browse furniture products
* Product search and filtering
* Shopping cart
* Purchase products
* Product reviews and ratings
* View transaction history

### 🔐 Administrator

* Product CRUD management
* Multiple product image uploads
* Inventory management
* User management
* Transaction management
* Sales monitoring
* Review management
* PDF receipt generation
* Email transaction updates

---

## 🪑 Furniture Categories

Luna Interiors offers furniture across different categories, including:

* 🛋️ Living Room
* 🛏️ Bedroom
* 🪑 Dining Room
* 🌿 Outdoor
* 📚 Storage
* 🍳 Kitchen
* 🚪 Entryway
* 🧸 Kids & Nursery

---

## ☁️ External Services

### Cloudinary

Used for storing and managing furniture and user-uploaded images.

### Firebase Authentication

Used to provide secure user authentication and account management.

---

## 📁 Project Structure

```text
Luna-Interiors/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Luna-Interiors
```

### 2. Install dependencies

**Frontend:**

```bash
cd frontend
npm install
```

**Backend:**

```bash
cd ../backend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `backend` folder and add the required database, authentication, Cloudinary, and email configuration.

### 4. Run the application

**Backend:**

```bash
npm run dev
```

**Frontend:**

```bash
npm run dev
```

---

## Developers

- Tumpap, Julianne (BSIT-NS-3A)
- Barasi, Ira (BSIT-NS-3A)

---

<p align="center">
  <strong>Luna Interiors © 2026</strong>
</p>

---

## ✅ Progress — Machine Problems 1–3

| MP | Feature | Where |
| -- | ------- | ----- |
| MP1 (20) | Product CRUD datatable, multiple photo upload, bulk delete via checkboxes | `frontend/src/Components/Admin/ProductsList.jsx`, `ProductForm.jsx`, `NewProduct.jsx`, `UpdateProduct.jsx` · `backend/controllers/product.js` (`DELETE /api/v1/admin/products` = bulk) |
| MP2 (20) | Price, category, ratings and review-count filters (+ sort, pagination) | `frontend/src/Components/Home.jsx` · `backend/utils/apiFeatures.js` |
| MP3 (20) | Customers who ordered a product can review/rate it, edit their own review, admin can delete any review | `frontend/src/Components/Product/ProductDetails.jsx`, `Admin/ProductReviews.jsx` · `createProductReview`, `deleteReview` |

Built on the itcp318 reference system (same Express + Mongoose models, Redux, cookie/JWT auth, same MongoDB via `DB_URI`).

### Setup
```bash
cd backend && npm install
cp config/.env.example config/.env     # fill DB_URI (same DB), JWT_SECRET, Cloudinary keys
npm run seed                           # optional: demo products + admin/customer accounts
npm run dev                            # http://localhost:4001

cd ../frontend && npm install
npm run dev                            # http://localhost:5173  (VITE_API in frontend/.env)
```
Seeded logins: `admin@lunainteriors.com / admin123` · `customer@lunainteriors.com / customer123`.
If the Cloudinary keys are blank, product photos are saved to `backend/uploads` instead.
