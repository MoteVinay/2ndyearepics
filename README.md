# 🎓 College Events Management System 🎉

Welcome to the **College Events Management System** – a beginner-friendly full-stack web app that simplifies how students and organizers interact with campus events! Whether you're eager to attend hackathons or looking to host a cultural fest, this system empowers both ends!

---

## 🚀 Technologies Used

### 🖥️ Frontend:

- HTML & CSS
- [Bootstrap](https://getbootstrap.com/) – for sleek, responsive UI
- [EJS](https://ejs.co/) – Embedded JavaScript templating

### 🔧 Backend:

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- PostgreSQL (hosted on [Supabase](https://supabase.com/))

---

## ✨ Features

### 👥 User Panel:

- **User Registration & Login:**  
  Students can sign up and securely log in.
- **Event Browsing:**  
  Discover events by category – Technical, Cultural, or Sports.

- **Enrollment:**  
  Register for events with a click and track your enrollments.

### 🧑‍💼 Organizer Panel:

- **Event Scheduling:**  
  Organizers can create new events and upload posters.

- **Enrollment Tracking:**  
  See how many participants signed up for each event.

---

## 🛠️ How to Run Locally

Follow these steps to set up and run the project on your machine:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/college-events-management.git
cd college-events-management
```

### 2. 💻 Install Node.js

Download and install the LTS version of Node.js from the official website:

👉 https://nodejs.org/

To verify that Node.js and npm are installed, run:

```bash
node -v
npm -v
```

### 3. 📦 Install Dependencies

After cloning the repo, install the required packages:

```bash
npm install
```

### 4. 🔐 Set Up Supabase

Create a free Supabase project at https://supabase.com

Go to your project → Settings → Database

Copy your credentials and create a .env file in the root folder:

```bash
DB_HOST=your-project.supabase.co
DB_USER=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=postgres
DB_PORT=5432
```

⚠️ NOTE: Never commit the .env file to GitHub or share it publicly.

### 5. 🗃️ Set Up the Database

You can set up your PostgreSQL tables using:

Supabase SQL Editor (paste your schema there), or

Run the schema setup file if included:

```bash

node SchemaSetUp.js
```

Make sure your PostgreSQL schema is applied before launching the app.

### 6. ▶️ Start the Server

Once everything is ready, start the app:

```bash
node index.js
```

The server will start on:

```bash
http://localhost:3000
```

Happy coding! 🚀
