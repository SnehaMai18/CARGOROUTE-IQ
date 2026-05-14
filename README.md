# CargoRoute IQ 🚛📦

CargoRoute IQ is a comprehensive, web-based logistics platform designed for regional carriers, freight forwarders, and logistics coordinators. It streamlines supply chain operations by centralizing bookings, managing vehicle capacity, optimizing route assignments, and balancing load consolidation across fleets.

## 🚀 Key Features

*   **Fleet Management**: Track vehicle availability, capacity, and maintenance.
*   **Dynamic Routing**: Optimize routes for efficiency and fuel savings.
*   **Load Balancing**: Consolidate shipments to maximize vehicle utilization.
*   **Real-time Bookings**: Centralized management of shipping requests and status updates.
*   **Advanced Analytics**: Visual KPIs and reports using Recharts.
*   **Role-Based Access Control**: Secure access for Admins, Dispatchers, Drivers, and Shippers[cite: 1].

---

## 🛠 Tech Stack

### Frontend
*   **Framework**: React 19.2.4[cite: 1]
*   **Routing**: React Router DOM 7.14.0[cite: 1]
*   **Icons**: Lucide-React, React-Icons[cite: 1]
*   **Charts**: Recharts 3.8.1[cite: 1]
*   **API Client**: Axios 1.14.0[cite: 1]
*   **Security**: JWT Decode 4.0.0[cite: 1]

### Backend (Microservices)
*   **Language**: Java 17[cite: 1]
*   **Framework**: Spring Boot 4.0.5[cite: 1]
*   **Architecture**: Spring Cloud 2025.1.1 (Microservices)[cite: 1]
*   **Service Discovery**: Netflix Eureka[cite: 1]
*   **Security**: Spring Security & JWT[cite: 1]
*   **Database**: MySQL with Spring Data JPA[cite: 1]
*   **Build Tool**: Maven[cite: 1]

---

## 📂 Project Structure

```text
cargoRoute-IQ-Project/
├── CargoRoute-IQ/           # Backend Microservices (Spring Boot)
│   ├── API-Gateway/         # Central Entry Point & Routing
│   ├── Eureka-Server/       # Service Registry
│   ├── Fleet-Service/       # Vehicle & Driver Management
│   ├── Routing-Service/     # Route Optimization Logic
│   └── Booking-Service/     # Shipment & Order Management
└── frontendproject/         # Frontend Application (React)
    ├── src/api/             # Axios API instances
    ├── src/components/      # Reusable UI Components
    ├── src/pages/           # Dashboard & Feature Modules
    └── src/styles/          # CSS Modules & Global Styles


    ```


###Getting Started
Prerequisites
Node.js: v18+[cite: 1]

JDK: 17[cite: 1]

Maven: 3.8+[cite: 1]

MySQL Server: Running on port 3306[cite: 1]

Installation & Setup
Clone the Repository

Bash
git clone [https://github.com/SnehaMai18/cargoRoute-IQ-Project.git](https://github.com/SnehaMai18/cargoRoute-IQ-Project.git)
cd cargoRoute-IQ-Project
Frontend Setup

Bash
cd frontendproject
npm install
npm start

    The UI will be available at `http://localhost:3000`[cite: 1].

3.  **Backend Setup**
    *   Start the **Eureka Server** first[cite: 1].
    *   Start the **API Gateway**[cite: 1].
    *   Start individual microservices (Fleet, Routing, Booking, etc.)[cite: 1].

---

## 🧪 Testing

The frontend is equipped with Jest and React Testing Library[cite: 1].
```bash
npm test


