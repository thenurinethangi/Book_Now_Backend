# Synema – Movie Ticket Booking Platform (Backend)

## Overview
**Synema** is a full-stack movie ticket booking platform designed to support multiple cinemas, multiple screens, and real-time seat-based bookings within a single system. The application focuses on providing a smooth and reliable booking experience for users while offering dedicated management interfaces for cinemas and system administrators.

This repository contains the **frontend application**, developed using **React and TypeScript**, with an emphasis on usability, performance, and responsive design across devices.

**From a user perspective**, Synema allows users to browse and search movies by title, genre, or cinema, view complete movie details (including trailers and cast information), and check showtimes for the same movie across different cinemas and screens. Users can also search by cinema to find nearby cinemas and view the movies currently playing at a selected cinema along with their available showtimes and ticket prices.

During the booking process, users select seats from an interactive seat layout. Once a seat is selected, it is temporarily locked for 5 minutes to allow the user to complete the booking. If the booking is not completed within this time window, the session expires and the locked seats are automatically released, allowing other users to select them. This seat-locking mechanism is implemented using Redis, ensuring that double-booking is prevented even when multiple users attempt to book seats simultaneously.

An advanced feature of the platform is AI-generated movie summaries, which are produced using the Grok AI model. This enhances the user experience by providing concise and informative summaries beyond standard movie descriptions.

Synema provides a dedicated interface for **cinema owners**, allowing cinemas to register on the platform with login access granted only after approval by the system administrator, ensuring controlled onboarding and platform integrity. Once approved, cinema users can log in to manage their cinema profile, add and configure screens, select and manage movies to be screened, create and update showtimes for each screen, and view bookings made by users for their cinema. This functionality enables cinema owners to independently manage their day-to-day operations while remaining seamlessly integrated with the central Synema system.

**The Synema administration panel** provides system-level control for managing the entire platform. Administrators can approve or reject cinema registrations, manage cinemas, screens, and movies, and oversee user, cinema, and admin accounts. In addition, administrators are responsible for controlling primary system features such as promotional banners and featured content, ensuring data consistency, platform security, and smooth overall operation. This centralized administration layer enables effective monitoring, moderation, and scalability of the Synema platform.

Overall, Synema delivers a modern, scalable, and real-world movie booking experience that reflects **industry-level application design and development practices**.


## Technologies and tools used

#### Frontend

- React.js (with TypeScript) -
Used to build a component-based, scalable, and type-safe user interface for the application.

- Redux Toolkit -
Handles global state management, including user authentication, booking flow, and seat selection state.

- Tailwind CSS -
Provides a modern, responsive, and consistent UI design with utility-first styling.

- React Router -
Manages client-side routing and role-based navigation within the application.

- Axios -
Used for handling HTTP requests and communication with the backend API.

#### Backend

- Node.js -
Provides the runtime environment for executing server-side JavaScript.

- Express.js -
Used to build a RESTful API and handle routing, middleware, and request processing.

- MongoDB -
Serves as the primary database for storing users, cinemas, movies, screens, showtimes, and bookings.

- Mongoose -
Acts as an ODM to model application data and enforce schema validation.

- Redis -
Implements real-time seat locking with automatic timeout handling to prevent double bookings.

- JWT (JSON Web Tokens) -
Used for secure authentication and role-based authorization.

- Nodemailer -
Sends email ex: booking confirmation containing ticket details, email verify otp

#### AI & Advanced Features

- Grok AI Model -
Generates AI-powered movie summaries to enhance the movie discovery experience.

- Redis-based Concurrency Control -
Ensures consistent seat availability when multiple users attempt bookings simultaneously.

#### Development & Deployment

- Git & GitHub -
Used for version control and project collaboration.

- Postman -
Used for testing and validating API endpoints during development.

- Render / Railway -
Used for deploying and hosting the frontend and backend services.


## Setup and Run Instructions

This project consists of two separate applications:

- Frontend – React-based client application
- Backend – Node.js & Express REST API

Both applications must be set up and run separately.

#### Prerequisites

Ensure the following are installed on your system:

- Node.js (v18 or later)
- npm or yarn
- MongoDB (local or cloud instance)
- Redis Server (for seat locking functionality)

### Frontend Setup

1. Clone the Frontend Repository
```bash
git clone https://github.com/thenurinethangi/Book_Now_Frontend.git
cd synema-frontend
```

2. Install Dependencies
```bash
npm install
```

3. Run the Application
```bash
npm run dev
```

The frontend will be available at: [http://localhost:5173](http://localhost:5173)

### Backend Setup

1. Clone the Backend Repository
```bash
git clone https://github.com/thenurinethangi/Book_Now_Backend.git
cd synema-backend
```

2. Install Dependencies
```bash
npm install
```

3. Environment Configuration
Create a .env file in the root directory and configure the following:
```bash
# Database Configuration
DATABASE_URL=your_mongodb_connection_string

# Authentication Secrets
JWT_ACCESS_TOKEN_SECRET=your_jwt_access_token_secret
JWT_REFRESH_TOKEN_SECRET=your_jwt_refresh_token_secret

# Email Service (SMTP)
EMAIL_USER=your_email_address
EMAIL_PASS=your_app_specific_password

# Payment Gateway
STRIPE_SECRET_KEY=your_stripe_secret_key

# Redis Configuration (Upstash)
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# AI Model API Keys
GEMINI_API_KEY=your_google_gemini_api_key
HF_API_KEY=your_huggingface_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
```

4. Run the Server
```bash
npm run dev
```

The backtend will be available at: [http://localhost:5000](http://localhost:5000)


## Deployed URLs

The Synema application is deployed and accessible through the following live environments:

- Frontend Application:
<https://synema-frontend-url.com>

- Backend API:
<https://synema-backend-url.com>


## Main Features and Relevant Screenshots

### User Features
Synema provides a comprehensive and user-friendly booking experience for moviegoers. Users can browse and search movies by title, genre, or cinema, allowing them to easily discover movies currently playing across multiple locations. Each movie includes detailed information such as trailers, cast details, ticket pricing, and AI-generated summaries powered by the Grok AI model.

Users can view showtimes for a selected movie across different cinemas and screens, or alternatively search by cinema to find nearby cinemas and check the movies currently playing at that location. During the booking process, users select seats from an interactive seating layout. Selected seats are temporarily locked for 5 minutes to allow booking completion; if the session expires, the seats are released automatically and become available to other users. Upon successful booking, users receive a confirmation email containing their ticket, which can be presented at the cinema as proof of purchase. Additionally, users can save movies to a personal watchlist for future reference and cancel bookings if needed.

#### Key User Features
1. Browse Movies  
Users can explore all movies available on the platform, filtering by title, genre, or cinema.

2. Movie Details & Trailer  
Each movie provides full details, including cast, synopsis, ticket price, and trailer playback.

3. AI-Generated Summaries  
Synema generates concise movie summaries using the Grok AI model, helping users quickly understand the movie.

4. Search by Cinema  
Users can find nearby cinemas and check which movies are currently playing, along with showtimes.

5. Showtime Selection Across Cinemas  
View the available showtimes for a specific movie in different cinemas and screens.

6. Seat Selection with Locking  
Interactive seat selection locks chosen seats for 5 minutes to prevent double booking.

7. Booking & Payment  
Complete the booking process and pay securely through the platform.

8. Booking Confirmation & Email Ticket  
Receive a ticket via email that can be used as proof at the cinema.

9. Watchlist  
Save movies to a personal watchlist for future reference or planning.

10. Cancel Booking  
Cancel existing bookings if plans change, with automatic release of locked seats.

### Cinema Features
Synema includes a dedicated portal for cinema owners to manage their operations. Cinemas can register on the platform, with access granted only after approval by the system administrator. Once approved, cinema users can log in to manage cinema profile details, add and configure screens, select movies to be shown, and create showtimes for each screen.

Cinema users can monitor bookings made by customers for their cinema, allowing them to track seat occupancy and showtime performance. This role-based functionality enables cinemas to operate independently while remaining integrated within the Synema ecosystem.

#### Key Cinema Features
1. Cinema Registration & Approval  
Cinemas can register on the Synema platform; login access is only granted after admin approval.

2. Manage Cinema Profile  
Update cinema information including name, location, contact details, and branding.

3. Screen Management  
Add, edit, or remove screens within the cinema to organize movie showings.

4. Movie Management  
Select movies to be shown in each screen and update movie details as required.

5. Showtime Management  
Create, edit, and delete showtimes for each screen, ensuring accurate scheduling.

6. View Bookings  
Monitor user bookings for their cinema, track seat occupancy, and manage seat availability.

7. Seat Availability Management  
See real-time booked and available seats for each showtime.

8. Integration with Platform Features  
Work seamlessly with user booking flow, email confirmations, and seat locking handled by Redis.

### Admin Features
The administration module provides full control over the Synema platform. Administrators can approve or reject cinema registrations, manage cinemas, screens, and movies, and oversee user, cinema, and admin accounts. The admin panel also allows control over core system features such as promotional banners and featured content.

This centralized administration ensures platform security, content moderation, and consistent system operation, supporting scalability and long-term maintenance of the application.

#### Key Admin Features
1. Cinema Approval & Management  
Approve or reject cinema registrations and update cinema information as needed.

2. Screen & Movie Management  
Add, edit, or remove screens and movies across all cinemas to maintain content consistency.

3. Showtime Oversight  
Monitor and manage showtimes for all cinemas to ensure accurate scheduling.

4. User & Admin Management  
Manage user accounts, cinema accounts, and other admin accounts, including access control.

5. Booking Oversight  
Monitor bookings across all cinemas for operational tracking and reporting.

6. Promotional Banners & Featured Content  
Add and manage banners, featured movies, and other platform-wide promotional content.

7. System Security & Monitoring  
Oversee platform activity, enforce rules, and ensure secure operation of all functionalities.

8. Integration with Platform Features  
Maintain seamless interaction with user booking flow, seat locking, and AI-powered movie summaries.