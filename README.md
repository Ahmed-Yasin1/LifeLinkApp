# 🩸 Blood Management System

A modern, attractive, and responsive **Full-Stack Blood Management System** designed to manage blood donors, patients, blood inventory, blood requests, users, and reports through a centralized web application.

The system provides a secure backend API, responsive frontend dashboard, database management, authentication, role-based authorization, validation, and complete CRUD operations.

---

## 📌 Project Overview

The **Blood Management System** is a web-based application developed to simplify and organize blood-bank operations.

It allows authorized users to:

* Manage blood donors
* Manage patients
* Manage blood inventory
* Track blood groups and quantities
* Manage blood requests
* Manage system users
* Monitor activities through a dashboard
* Generate and view reports
* Control access using user roles
* Maintain accurate and organized blood-bank records

The system is designed with a **responsive and user-friendly interface** that works across desktop, laptop, tablet, and mobile devices.

---

# 🚀 Technologies Used

## Frontend

* **React.js**
* **Vite**
* **JavaScript (ES6+)**
* **Bootstrap**
* **Axios**
* **React Router**
* **ESLint**

## Backend

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**
* **JWT Authentication**
* **bcrypt**
* **dotenv**
* **CORS**
* **Validator**

## Development Tools

* **Git**
* **GitHub**
* **VS Code**
* **Postman**
* **npm**

---

# 🏗️ System Architecture

The application follows a client-server architecture:

```text
                    ┌──────────────────────┐
                    │       USER           │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │  Vite + Bootstrap    │
                    └──────────┬───────────┘
                               │
                         HTTP / REST API
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Node.js Backend    │
                    │   Express.js API     │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴───────────┐
                    │                      │
                    ▼                      ▼
             Authentication          Business Logic
             JWT + bcrypt            Services/Controllers
                    │                      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       MongoDB        │
                    │     Database         │
                    └──────────────────────┘
```

---

# 📁 Complete Project Structure

```text
Blood-Management-System/
│
├── Backend/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authcontroller.js
│   │   ├── studentcontroller.js
│   │   ├── donorcontroller.js
│   │   ├── patientcontroller.js
│   │   ├── bloodcontroller.js
│   │   ├── requestcontroller.js
│   │   └── dashboardcontroller.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Donor.js
│   │   ├── Patient.js
│   │   ├── Blood.js
│   │   └── BloodRequest.js
│   │
│   ├── routes/
│   │   ├── authroute.js
│   │   ├── donorroute.js
│   │   ├── patientroute.js
│   │   ├── bloodroute.js
│   │   ├── requestroute.js
│   │   └── dashboardroute.js
│   │
│   ├── services/
│   │   ├── authservice.js
│   │   ├── donorservice.js
│   │   ├── patientservice.js
│   │   ├── bloodservice.js
│   │   ├── requestservice.js
│   │   └── dashboardservice.js
│   │
│   ├── middleware/
│   │   ├── authmiddleware.js
│   │   └── rolemiddleware.js
│   │
│   ├── validator/
│   │   └── ...
│   │
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── Frontend/
│   │
│   └── blood-management-system/
│       │
│       ├── public/
│       │
│       ├── src/
│       │   ├── assets/
│       │   │
│       │   ├── components/
│       │   │   ├── Navbar.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   ├── Footer.jsx
│       │   │   ├── Loading.jsx
│       │   │   └── ...
│       │   │
│       │   ├── pages/
│       │   │   ├── Login.jsx
│       │   │   ├── Register.jsx
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Donors.jsx
│       │   │   ├── Patients.jsx
│       │   │   ├── BloodInventory.jsx
│       │   │   ├── BloodRequests.jsx
│       │   │   ├── Users.jsx
│       │   │   └── Reports.jsx
│       │   │
│       │   ├── services/
│       │   │   ├── api.js
│       │   │   ├── authService.js
│       │   │   ├── donorService.js
│       │   │   ├── patientService.js
│       │   │   ├── bloodService.js
│       │   │   └── requestService.js
│       │   │
│       │   ├── context/
│       │   │   └── AuthContext.jsx
│       │   │
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   └── ...
│       │
│       ├── .env
│       ├── package.json
│       └── vite.config.js
│
├── .gitignore
└── README.md
```

---

# ✨ Main Features

## 🔐 1. Authentication

The system provides secure authentication for authorized users.

Features include:

* User registration
* User login
* User logout
* Password hashing
* JWT authentication
* Protected routes
* Token-based API authorization
* Account status management
* Role-based authorization

### Authentication Flow

```text
User
  │
  ▼
Login
  │
  ▼
Backend Authentication
  │
  ▼
Verify Email & Password
  │
  ▼
Generate JWT
  │
  ▼
Send Token
  │
  ▼
Frontend
  │
  ▼
Protected Dashboard
```

---

# 👥 2. User Management

Administrators can manage system users.

Features:

* Add users
* View users
* Update users
* Delete users
* Activate/deactivate users
* Assign roles
* Search users

### User Roles

The system supports roles such as:

* **Admin**
* **Staff**

The administrator has greater access to system management features, while staff access can be restricted according to their responsibilities.

---

# 🩸 3. Donor Management

The donor module manages people who donate blood.

Features:

* Register donor
* View donors
* Search donors
* View donor details
* Update donor information
* Delete donor
* Record blood group
* Record contact information
* Track donor information

Example donor information:

```text
Donor ID
Full Name
Email
Phone
Gender
Date of Birth
Blood Group
Address
Last Donation Date
```

---



---

# 🩸 5. Blood Inventory Management

The blood inventory module tracks available blood units.

Features:

* Add blood units
* View blood stock
* Update blood stock
* Delete blood records
* Track blood groups
* Monitor available quantities
* Track blood expiration
* Identify low-stock blood groups

Supported blood groups:

```text
A+
A-
B+
B-
AB+
AB-
O+
O-
```

Example inventory:

```text
Blood Group     Available Units
--------------------------------
A+                    25
A-                    10
B+                    18
B-                     7
AB+                   12
AB-                    4
O+                    30
O-                     8
```

---

# 📋 6. Blood Request Management

Hospitals, patients, or authorized staff can create blood requests.

Features:

* Create blood request
* View requests
* Search requests
* Update requests
* Approve requests
* Reject requests
* Track request status
* Track requested blood group
* Track requested quantity

Request statuses:

```text
Pending
Approved
Rejected
Completed
```

---

# 📊 7. Dashboard

The dashboard provides a complete overview of the system.

It can display:

* Total donors
* Total blood units
* Available blood groups
* Pending requests
* Approved requests
* Recent donors
* Recent requests
* Low-stock alerts
* System statistics

Example:

```text
┌──────────────┐ ┌──────────────┐
│ Total Donors │ │   Patients   │
│     1,250    │ │      840     │
└──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐
│ Blood Units  │ │   Requests   │
│     3,420    │ │      125     │
└──────────────┘ └──────────────┘
```

---

# 📈 8. Reports

The system can provide useful reports for administrators and staff.

Reports may include:

* Donor reports
* Blood inventory reports
* Blood request reports
* Blood group availability
* Monthly donation statistics
* Approved/rejected requests

Reports can be extended in the future to support PDF and Excel exports.

---

# 🛡️ Security

Security is an important part of the system.

The backend includes:

* JWT authentication
* Password hashing with bcrypt
* Protected API routes
* Role-based authorization
* Input validation
* Email validation
* Environment variables
* CORS configuration
* Error handling

Passwords are never stored as plain text.

---

# ✅ Validation

The backend validates incoming data before storing it in the database.

Validation can include:

* Required fields
* Email format
* Phone number
* Blood group
* User role
* Password requirements
* Duplicate records
* Invalid IDs
* Invalid request data

This helps prevent invalid or incomplete data from entering the system.

---

# 🎨 Frontend Design

The frontend is designed to be:

* Attractive
* Clean
* Modern
* Responsive
* Easy to navigate
* User-friendly

Bootstrap is used for the responsive interface.

### Responsive Devices

The system supports:

* 💻 Desktop
* 🖥️ Laptop
* 📱 Mobile
* 📲 Tablet

The dashboard automatically adapts to different screen sizes.

---

# 🧭 Frontend Navigation

A typical navigation structure is:

```text
Dashboard
│
├── Donors
│   ├── All Donors
│   ├── Add Donor
│   └── Donor Details
│
├── Patients
│   ├── All Patients
│   ├── Add Patient
│   └── Patient Details
│
├── Blood Inventory
│   ├── Blood Stock
│   ├── Add Blood
│   └── Blood Details
│
├── Blood Requests
│   ├── All Requests
│   ├── Pending
│   ├── Approved
│   └── Rejected
│
├── Reports
│
├── Users
│
└── Logout
```

---

# 🔗 API Architecture

The backend follows a RESTful API architecture.

Example API structure:

```text
/api/auth
/api/donors
/api/patients
/api/blood
/api/requests
/api/users
/api/dashboard
```

Example endpoints:

### Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
```

### Donors

```text
GET      /api/donors
GET      /api/donors/:id
POST     /api/donors
PUT      /api/donors/:id
DELETE   /api/donors/:id
```

### Patients

```text
GET      /api/patients
GET      /api/patients/:id
POST     /api/patients
PUT      /api/patients/:id
DELETE   /api/patients/:id
```

### Blood Inventory

```text
GET      /api/blood
GET      /api/blood/:id
POST     /api/blood
PUT      /api/blood/:id
DELETE   /api/blood/:id
```

### Blood Requests

```text
GET      /api/requests
GET      /api/requests/:id
POST     /api/requests
PUT      /api/requests/:id
DELETE   /api/requests/:id
```

---

# ⚙️ Backend Installation

## 1. Clone the Repository

```bash
git clone <your-repository-url>
```

## 2. Open the Project

```bash
cd Blood-Management-System
```

## 3. Open Backend

```bash
cd Backend
```

## 4. Install Dependencies

```bash
npm install
```

## 5. Configure Environment Variables

Create a `.env` file inside the `Backend` folder:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

NODE_ENV=development
```

Do not commit `.env` to GitHub.

## 6. Start Backend

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

The backend will normally run on:

```text
http://localhost:5000
```

---

# 💻 Frontend Installation

Open a new terminal.

```bash
cd Frontend/blood-management-system
```

Install dependencies:

```bash
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

---

# 🔄 Running the Complete System

You need to run both frontend and backend.

### Terminal 1 — Backend

```bash
cd Backend
npm run dev
```

### Terminal 2 — Frontend

```bash
cd Frontend/blood-management-system
npm run dev
```

Then open the frontend in your browser.

```text
http://localhost:5173
```

---

# 🗄️ Database

The project uses **MongoDB** as the database.

The database stores information such as:

```text
Users
Donors
Patients
Blood Inventory
Blood Requests
```

MongoDB Atlas can be used for cloud database hosting.

---

# 🧪 API Testing

The backend APIs can be tested using **Postman**.

Recommended testing order:

### Authentication

```text
Register
   ↓
Login
   ↓
Copy JWT Token
   ↓
Use Bearer Token
   ↓
Test Protected APIs
```

### CRUD Testing

Test:

* Create
* Read all
* Read by ID
* Update
* Delete

for each major resource.

---

# 🧪 Testing Checklist

## Authentication

* [ ] Register user
* [ ] Login user
* [ ] Logout
* [ ] Invalid email
* [ ] Invalid password
* [ ] Protected route
* [ ] JWT token
* [ ] Role authorization

## Users

* [ ] Create user
* [ ] View users
* [ ] Search user
* [ ] Update user
* [ ] Delete user

## Donors

* [ ] Create donor
* [ ] View donors
* [ ] View donor by ID
* [ ] Update donor
* [ ] Delete donor
* [ ] Search donor

## Patients

* [ ] Create patient
* [ ] View patients
* [ ] View patient by ID
* [ ] Update patient
* [ ] Delete patient

## Blood Inventory

* [ ] Add blood
* [ ] View inventory
* [ ] View blood by ID
* [ ] Update blood
* [ ] Delete blood
* [ ] Check blood availability

## Blood Requests

* [ ] Create request
* [ ] View requests
* [ ] View request by ID
* [ ] Update request
* [ ] Approve request
* [ ] Reject request
* [ ] Delete request

## Frontend

* [ ] Login page
* [ ] Registration page
* [ ] Dashboard
* [ ] Responsive sidebar
* [ ] Donor pages
* [ ] Patient pages
* [ ] Blood inventory pages
* [ ] Request pages
* [ ] Reports
* [ ] Protected routes
* [ ] Error handling
* [ ] Loading states
* [ ] Mobile responsiveness

---

# 🏗️ Production Build

## Frontend

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

The production files will be created inside:

```text
dist/
```

## Backend

Set:

```env
NODE_ENV=production
```

Then start the server:

```bash
npm start
```

---

# 🔒 Environment Variables

Never commit sensitive information.

The following files should normally be ignored:

```text
.env
.env.local
node_modules/
dist/
```

Example `.gitignore`:

```text
node_modules/
.env
.env.local
dist/
```

---

# 🌿 Git Workflow

For team development, avoid pushing directly to the `main` branch.

Recommended workflow:

```text
main
 │
 ├── develop
 │
 ├── feature/authentication
 │
 ├── feature/donors
 │
 ├── feature/blood-inventory
 │
 └── feature/dashboard
```

Create a feature branch:

```bash
git checkout -b feature/donors
```

Commit your changes:

```bash
git add .
git commit -m "Add donor management"
```

Push the branch:

```bash
git push origin feature/donors
```

Then create a Pull Request to merge into the main development branch.

---

# 📌 Development Guidelines

1. Use reusable React components.
2. Keep API calls inside the services layer.
3. Keep database logic inside backend services.
4. Keep request handling inside controllers.
5. Keep routes organized by feature.
6. Protect sensitive backend routes.
7. Validate user input.
8. Never store plain-text passwords.
9. Never commit `.env` files.
10. Use meaningful names for files, variables, and functions.
11. Handle API errors properly.
12. Make every page responsive.
13. Test APIs with Postman before connecting them to the frontend.
14. Test frontend functionality after connecting the API.
15. Use Git branches when working as a team.

---

# 🚀 Future Improvements

Possible future enhancements include:

* 📧 Email notifications
* 📱 SMS notifications
* 🔔 Real-time notifications
* 📄 PDF report generation
* 📊 Advanced analytics
* 📥 Excel report export
* 🩸 Automatic blood-stock alerts
* ⏰ Blood expiration notifications
* 📱 Progressive Web App support
* 🌓 Dark mode
* 📜 Activity/audit logs
* ☁️ Cloud deployment
* 🔍 Advanced filtering and search
* 📈 Advanced dashboard charts

---

# 🌍 Deployment

The application can be deployed using cloud services.

Possible architecture:

```text
                 Internet
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
     Frontend Host        Backend Host
          │                   │
          │                   │
          └─────────┬─────────┘
                    │
                    ▼
               MongoDB Atlas
```

The frontend communicates with the deployed backend API, while the backend communicates with MongoDB.

---

# 📄 License

This project is developed for educational and software-development purposes.

---

# ❤️ Blood Management System

> **Manage Blood. Connect Donors. Support Patients. Save Lives.**

A complete digital solution for organizing blood-bank operations efficiently, securely, and responsively.

---

## 👨‍💻 Project Status

**Status:** 🚧 Active Development

### Completed / Planned Modules

| Module             | Status |
| ------------------ | ------ |
| Authentication     | ✅      |
| User Management    | ✅      |
| Donor Management   | ✅      |
| Patient Management | ✅      |
| Blood Inventory    | ✅      |
| Blood Requests     | ✅      |
| Dashboard          | ✅      |
| Validation         | ✅      |
| Role-Based Access  | ✅      |
| Reports            | 🚧     |
| Advanced Analytics | 🔮     |
| Notifications      | 🔮     |

---
