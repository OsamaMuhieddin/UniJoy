# UniJoy University Event Planner - Backend

UniJoy is a full-stack **Event Management System** designed for universities and organizations to manage events, halls, reservations, and user registrations with secure payments and reporting.  
This repository contains the **backend API**, built with **Node.js, Express, and MongoDB**, following the **MVC architecture**.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
---

## 🚀 Features

- **Authentication & Authorization**
  - Secure user signup, login, password reset (via email).
  - JWT-based authentication.
  - Strict **Role-Based Access Control (RBAC)**:  
    - **User**: Register/unregister for events, request refunds, download invoices.  
    - **Host**: Create events (requires admin approval), view registrations, generate event reports.  
    - **Admin/Manager**: Approve/reject events, manage halls, users, and oversee reservations.

- **Event Management**
  - Create, update, and delete events (host/admin).
  - Event approval workflow: pending → approved/rejected.
  - Events linked with hall reservations.
  - Only approved events are visible for user registration.

- **Hall Reservation System**
  - Reserve one or more halls for approved events.
  - Prevents conflicting hall reservations.
  - **Automated job function** to free up halls when events end or are deleted.

- **Event Registration**
  - Users can register for both free and paid events.
  - Registration capacity and attendance logic enforced.
  - Unregistration allowed with refund request option for paid events.

- **Payments & Refunds**
  - **Stripe Checkout** integration for paid events.
  - Refund requests handled for cancelled/unregistered paid events.
  - Payments stored and verified against Stripe sessions/webhooks.

- **Invoices & Reports**
  - Generate and download **PDF invoices** for event registrations using **PDFKit**.
  - Hosts/Admins can generate **event reports** including:  
    - Event details  
    - Registered users (count & emails)  
    - Total payments  
    - Hall reservation details  

- **Email Notifications**
  - Password reset emails and event notifications.
  - Email service implemented using **Nodemailer with SendGrid (preferred) or Gmail**.
  - Supports HTML email templates for better delivery.

---

## 🛠️ Tech Stack

- **Backend Framework**: Node.js, Express.js  
- **Database**: MongoDB with Mongoose  
- **Authentication**: JWT (JSON Web Tokens)  
- **Payments**: Stripe Checkout  
- **PDF Generation**: PDFKit  
- **Email Service**: Nodemailer (Gmail/SendGrid)  
- **Validation**: express-validator  
- **Architecture**: MVC (Model–View–Controller)

---

## 📂 Project Structure

UniJoy/
├── controllers/ # Request handlers (Auth, Event, Hall, Payment, etc.)

├── models/ # Mongoose schemas (User, Event, Hall, Reservation, Payment)

├── routes/ # API routes

├── middlewares/ # Auth & error handling middlewares

├── utils/ # Helpers (check conflicts)

├── app.js # Express app setup

├── jobs/ # job functions (free hall reservations) 

└── README.md

---

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/OsamaMuhieddin/UniJoy.git
   cd UniJoy
   
2. **Install dependencies**

npm install

3. **Configure environment variables**
   
Create a .env file with the following keys:

PORT=8080

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

STRIPE_SECRET_KEY=your_stripe_secret_key

SENDGRID_API_KEY=your_sendgrid_api_key


4. **Run the server**

npm start


🔑 Authentication & Roles

All protected routes require a valid JWT token.

Roles and permissions:

user → register/unregister for events, request refunds, download invoices.

host → create/manage events (pending approval).

admin → full system access (approve events, manage halls/users).

💳 Payments & Refunds

Stripe Checkout is used for secure payment sessions.

Refunds are processed when:

A user unregisters from a paid event.

An event is cancelled.

Payment records are stored in MongoDB for verification and reporting.

📊 Reports

PDF invoices generated for every successful registration.

Event reports available for hosts/admins, including hall reservations and revenue.

🧪 Testing

API testing recommended with Postman or Insomnia.

Include auth token in headers for protected routes.

Example Postman collection can be added later.

🤝 Contribution

Fork the repo

Create your feature branch (git checkout -b feature-name)

Commit changes (git commit -m 'Add new feature')

Push to branch (git push origin feature-name)

Create a Pull Request

📄 License

This project is licensed under the MIT License.
