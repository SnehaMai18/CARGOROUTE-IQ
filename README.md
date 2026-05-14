# CargoRoute IQ 🚛📦

CargoRoute IQ is a comprehensive, web-based logistics platform designed for regional carriers, freight forwarders, and logistics coordinators. It streamlines supply chain operations by centralizing bookings, managing vehicle capacity, optimizing route assignments, and balancing load consolidation across fleets.

---

## 🚀 Key Features

*   **Fleet Management**: Track vehicle availability, capacity, and maintenance logs.
*   **Dynamic Routing**: Optimize delivery paths for maximum efficiency and fuel savings.
*   **Load Balancing**: Intelligently consolidate shipments to maximize vehicle utilization.
*   **Real-time Bookings**: Centralized management of shipping requests with live status updates.
*   **Advanced Analytics**: Visual KPIs and interactive reports powered by Recharts.
*   **Role-Based Access Control (RBAC)**: Secure, granular access tailored for Admins, Dispatchers, Drivers, and Shippers[cite: 1].

---

## 🛠 Tech Stack

### Frontend
*   **Library**: React 19.2.4[cite: 1]
*   **Routing**: React Router DOM 7.14.0[cite: 1]
*   **UI Components**: Lucide-React & React-Icons[cite: 1]
*   **Data Visualization**: Recharts 3.8.1[cite: 1]
*   **HTTP Client**: Axios 1.14.0[cite: 1]
*   **Authentication**: JWT Decode 4.0.0[cite: 1]

### Backend (Microservices)
*   **Language**: Java 17 (LTS)[cite: 1]
*   **Framework**: Spring Boot 4.0.5[cite: 1]
*   **Architecture**: Spring Cloud 2025.1.1 (Microservices)[cite: 1]
*   **Service Discovery**: Netflix Eureka[cite: 1]
*   **Security**: Spring Security with JWT (jjwt)[cite: 1]
*   **Persistence**: MySQL with Spring Data JPA[cite: 1]
*   **Build Tool**: Maven[cite: 1]

---

## 📂 Project Structure

```text
cargoRoute-IQ-Project/
├── CargoRoute-IQ/           # Spring Boot Microservices
│   ├── API-Gateway/         # Unified entry point & routing logic
│   ├── Eureka-Server/       # Service registry & discovery
│   ├── Fleet-Service/       # Vehicle & driver resource management
│   ├── Routing-Service/     # Path optimization & route planning
│   └── Booking-Service/     # Shipment lifecycle & order management
└── frontendproject/         # React Frontend Application
    ├── src/api/             # API services & Axios interceptors
    ├── src/components/      # Shared UI elements
    ├── src/pages/           # View modules (Dashboards, Login, etc.)
    └── src/styles/          # Unified CSS & theme modules
```

---
### Getting Started
Prerequisites
**Node.js**: v18 or higher[cite: 1]

**JDK**: 17 (LTS)[cite: 1]

**Maven**: 3.8 or higher[cite: 1]

**MySQL**: Running on port 3306[cite: 1]

**Installation & Execution**
1. Clone the Repository
#### git clone [https://github.com/SnehaMai18/cargoRoute-IQ-Project.git](https://github.com/SnehaMai18/cargoRoute-IQ-Project.git)
cd cargoRoute-IQ-Project

**Frontend Deployment**
2.cd frontendproject
npm install
npm start
*   The application will be accessible at `http://localhost:3000`[cite: 1].

3.  **Backend Deployment**
    *   Initialize the **Eureka Server** module first to enable service discovery[cite: 1].
    *   Launch the **API Gateway** module[cite: 1].
    *   Start functional microservices: **Fleet**, **Routing**, and **Booking**[cite: 1].

---

## 🧪 Quality Assurance

The frontend utilizes a robust testing suite for components and user workflows[cite: 1].
```bash
npm test


