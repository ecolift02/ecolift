# EcoLift

**A Smart Ride-Sharing and Carpooling Platform**

EcoLift is a full-stack web application that connects drivers and passengers traveling in the same direction, enabling cost-effective, eco-friendly commuting through real-time ride coordination and messaging.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Project Structure](#project-structure)
6. [Core Modules](#core-modules)
7. [Chat Module](#chat-module)
8. [Database Schema](#database-schema)
9. [API Reference](#api-reference)
10. [Authentication and Security](#authentication-and-security)
11. [Real-Time Communication](#real-time-communication)
12. [Installation and Setup](#installation-and-setup)
13. [Environment Configuration](#environment-configuration)
14. [Troubleshooting](#troubleshooting)
15. [Future Roadmap](#future-roadmap)
16. [Contributing](#contributing)
17. [License](#license)

---

## Overview

EcoLift addresses a common urban commuting problem: too many people driving alone to similar destinations. The platform allows any registered user to act as either a **driver** or a **passenger**, switching between the two roles as needed from their profile.

Drivers can list available rides with route and timing details; passengers can search for and request seats on those rides. Once a booking is confirmed, both parties gain access to a dedicated, real-time chat to coordinate pickup logistics.

The application is built as a modern three-tier system: a **React frontend**, a **Spring Boot backend**, and a **PostgreSQL database** hosted on Supabase.

---

## Key Features

| Feature | Description |
|---|---|
| Secure Authentication | JWT-based login and registration using Spring Security |
| Dual User Roles | Users can operate as either a Driver or a Passenger from a single account |
| Ride Management | Drivers can create, view, and manage ride listings |
| Booking Requests | Passengers can request seats; drivers accept or decline requests |
| Vehicle Management | Drivers register and manage the vehicles used for rides |
| Real-Time Messaging | Instant, WebSocket-based chat between matched ride partners |
| Message Status Tracking | Sent, delivered, and seen indicators for every message |
| Message Editing and Deletion | Messages can be edited within a two-minute window or deleted for all participants |
| Live Updates | All data — messages, statuses, and booking changes — updates without requiring a page refresh |

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React (Vite) | Component-based user interface |
| Tailwind CSS | Utility-first responsive styling |
| React Router DOM | Client-side page routing |
| Axios | HTTP client for API communication |
| Context API | Global state management (authentication and chat session) |
| STOMP.js with SockJS | Real-time WebSocket messaging |

### Backend

| Technology | Purpose |
|---|---|
| Java Spring Boot | Core application and REST API framework |
| Spring Security with JWT | Stateless authentication and authorization |
| Spring Data JPA (Hibernate) | Object-relational mapping and database access |
| Spring WebSocket (STOMP) | Real-time, bi-directional communication |
| HikariCP | Database connection pooling |
| Maven | Build automation and dependency management |

### Database and Hosting

| Technology | Purpose |
|---|---|
| PostgreSQL | Primary relational database |
| Supabase | Managed PostgreSQL hosting and connection pooling |

---

## System Architecture

EcoLift follows a standard three-tier architecture, separating presentation, business logic, and data persistence.

```
   React Frontend            Spring Boot Backend            PostgreSQL
   (Vite, Tailwind)   <--->   (REST API + STOMP)    <--->   (Supabase)
```

- The frontend communicates with the backend over standard REST endpoints for operations such as authentication, ride management, bookings, and vehicle data.
- For chat functionality, the frontend establishes a persistent WebSocket connection using the STOMP protocol, allowing messages and status updates to be pushed to clients instantly.
- The backend authenticates every incoming request through a JWT validation filter before any business logic or database interaction occurs.

---

## Project Structure

```
EcoLift/
├── backend/
│   ├── src/main/java/com/ecolift/
│   │   ├── config/          Security, WebSocket, and CORS configuration
│   │   ├── controller/      REST controllers for each domain (Auth, Ride, Booking, Vehicle, Chat)
│   │   ├── entity/          JPA entity classes (User, Ride, Booking, Vehicle, ChatMessage)
│   │   ├── repository/      Spring Data JPA repository interfaces
│   │   ├── security/        JWT filter and user details service
│   │   ├── service/         Business logic layer
│   │   ├── dto/             Request and response data transfer objects
│   │   └── EcoliftBackendApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── api/             Axios configuration and API service functions
│   │   ├── components/      Shared UI components (Navbar, Footer, etc.)
│   │   ├── context/         AuthContext and ChatContext
│   │   ├── pages/           Route-level page components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## Core Modules

**Authentication**
Manages user registration, login, and session handling. Upon successful login, the backend issues a JWT that the frontend stores and attaches to subsequent requests. The current user's identity and active role are made available application-wide through `AuthContext`.

**Ride Management**
Allows drivers to create ride listings with pickup location, drop-off location, departure time, and available seats. Both drivers and passengers can review their ride history, categorized by status.

**Booking Requests**
Enables passengers to request a seat on an available ride. Drivers review incoming requests and choose to accept or decline them. An accepted booking establishes the connection — identified by a booking ID — that also serves as the identifier for the associated chat conversation.

**Vehicle Management**
Allows drivers to register and maintain details of the vehicles they use, including model, registration number, and seating capacity. A vehicle must be registered before a ride can be listed.

**Chat**
Provides a dedicated, real-time conversation between a driver and passenger once a booking is confirmed, allowing them to coordinate pickup details directly within the platform.

---

## Chat Module

The chat module was designed to closely mirror the user experience of widely used messaging applications.

| Capability | Implementation |
|---|---|
| Message Alignment | The current user's messages are displayed on the right; the other participant's messages are displayed on the left, each labeled with the sender's name |
| Status Indicators | Each message progresses through three states — Sent, Delivered, and Seen — tracked via a status field on the message record |
| Edit Window | Messages may be edited within two minutes of being sent. This restriction is enforced on both the client and the server |
| Delete for Everyone | Deleting a message removes or replaces its content for all participants in the conversation |
| Real-Time Delivery | New messages, status changes, edits, and deletions are broadcast instantly through dedicated WebSocket topics, eliminating the need for manual refreshes |

---

## Database Schema

The following tables represent the core data model. Column types and names may be adjusted to match the final implementation.

**users**

| Column | Type | Description |
|---|---|---|
| id | BIGINT (Primary Key) | Unique user identifier |
| name | VARCHAR | Full name |
| email | VARCHAR | Unique email address |
| password | VARCHAR | Hashed password |
| current_mode | VARCHAR | Active role — DRIVER or PASSENGER |

**vehicles**

| Column | Type | Description |
|---|---|---|
| id | BIGINT (Primary Key) | Unique vehicle identifier |
| owner_id | BIGINT (Foreign Key → users) | Vehicle owner |
| model | VARCHAR | Vehicle model |
| registration_number | VARCHAR | License plate number |
| seats | INT | Total available seats |

**rides**

| Column | Type | Description |
|---|---|---|
| id | BIGINT (Primary Key) | Unique ride identifier |
| driver_id | BIGINT (Foreign Key → users) | Driver offering the ride |
| vehicle_id | BIGINT (Foreign Key → vehicles) | Vehicle used for the ride |
| pickup_location | VARCHAR | Starting point |
| drop_location | VARCHAR | Destination |
| departure_time | TIMESTAMP | Scheduled departure |
| available_seats | INT | Remaining open seats |

**bookings**

| Column | Type | Description |
|---|---|---|
| id | BIGINT (Primary Key) | Unique booking identifier |
| ride_id | BIGINT (Foreign Key → rides) | Associated ride |
| passenger_id | BIGINT (Foreign Key → users) | Requesting passenger |
| status | VARCHAR | PENDING, ACCEPTED, or REJECTED |

**chat_messages**

| Column | Type | Description |
|---|---|---|
| id | BIGINT (Primary Key) | Unique message identifier |
| booking_id | BIGINT (Foreign Key → bookings) | Associated conversation |
| sender_id | BIGINT (Foreign Key → users) | Message sender |
| content | TEXT | Message body |
| status | VARCHAR | SENT, DELIVERED, or SEEN |
| edited | BOOLEAN | Indicates whether the message has been edited |
| deleted | BOOLEAN | Indicates whether the message has been deleted |
| sent_at | TIMESTAMP | Time the message was sent |

---

## API Reference

The table below outlines representative endpoints. Adjust paths to match the actual controller mappings in the codebase.

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register a new user account |
| POST | /api/auth/login | Authenticate a user and issue a JWT |
| GET | /api/rides | Retrieve available rides |
| POST | /api/rides | Create a new ride listing |
| GET | /api/bookings | Retrieve booking requests |
| POST | /api/bookings | Submit a new booking request |
| PATCH | /api/bookings/{id} | Accept or decline a booking request |
| GET | /api/vehicles | Retrieve a driver's registered vehicles |
| POST | /api/vehicles | Register a new vehicle |
| GET | /chat/{bookingId}/messages | Retrieve conversation history |
| POST | /chat/{bookingId}/messages | Send a new message |
| PATCH | /api/chat/message/{id} | Edit an existing message |
| DELETE | /api/chat/message/{id} | Delete a message for all participants |

---

## Authentication and Security

- User passwords are hashed before being stored; plain-text passwords are never persisted.
- Upon successful login, the backend issues a signed JWT containing the user's identity and an expiration timestamp.
- All protected endpoints are guarded by a JWT authentication filter, which validates the token before granting access to any resource.
- The frontend includes the JWT as a Bearer token in the Authorization header of every authenticated request.
- Time-sensitive or ownership-dependent actions — such as editing a message within the two-minute window or accepting a booking — are validated on the server, regardless of any checks performed on the client. Client-side validation is treated strictly as a usability aid, not a security boundary.

---

## Real-Time Communication

Real-time features are implemented using Spring's WebSocket support with the STOMP messaging protocol, layered over SockJS for broader browser compatibility.

1. When a user opens a conversation, the client subscribes to a topic specific to that booking.
2. When a new message is sent, the backend persists it and then broadcasts it to that topic, updating both participants immediately.
3. Separate topics are used for message delivery, status updates, edits, and deletions, keeping each type of event isolated and easy to manage.
4. Subscriptions are established only after the WebSocket connection has been confirmed, and are properly closed when a component is unmounted to prevent duplicate connections or memory leaks.

---

## Installation and Setup

### Prerequisites

- Java 17 or later
- Node.js 18 or later
- Maven
- A PostgreSQL database instance (Supabase recommended)

### Backend Setup

```
cd backend
```

Configure database credentials in `src/main/resources/application.properties`:

```
spring.datasource.url=jdbc:postgresql://<your-database-host>:5432/postgres
spring.datasource.username=your-username
spring.datasource.password=your-password
jwt.secret=your-jwt-secret-key
```

Run the backend:

```
mvn spring-boot:run
```

The backend will be available at `http://localhost:8080`.

### Frontend Setup

```
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Environment Configuration

| Variable | Location | Description |
|---|---|---|
| spring.datasource.url | backend application.properties | Database connection string |
| spring.datasource.username | backend application.properties | Database username |
| spring.datasource.password | backend application.properties | Database password |
| jwt.secret | backend application.properties | Secret key used to sign authentication tokens |
| VITE_API_BASE_URL | frontend .env | Base URL of the backend API |

---

## Troubleshooting

| Issue | Likely Cause | Resolution |
|---|---|---|
| UnknownHostException referencing a Supabase hostname | The Supabase project has been automatically paused due to inactivity | Log in to the Supabase dashboard, restore the project, and restart the backend |
| Database migration fails with a "column contains null values" error | A NOT NULL column was added to a table that already contains rows | Add the column as nullable, populate existing rows with a default value, then apply the NOT NULL constraint |
| "There is no underlying STOMP connection" error in the browser console | The client attempted to subscribe to a topic before the WebSocket connection was established | Move all subscription calls inside the connection's onConnect callback |
| Chat messages display with incorrect alignment or missing sender names | A mismatch between the sender ID format returned by the backend and the format expected by the frontend | Normalize identifiers before comparison and confirm the exact field name used by the backend response |

---

## Future Roadmap

- Live location tracking during active rides
- Ride rating and review system
- Push notifications for bookings and messages
- Native mobile application
- In-app payment integration
- Multi-language support

---

## Contributing

Contributions, bug reports, and feature suggestions are welcome. Please open an issue to discuss proposed changes before submitting a pull request.

---

## License

This project is licensed under the MIT License.