# Integrated Workplace Management System Backend

This repository contains the backend code for the Integrated Workplace Management Software, designed to efficiently manage employees, assets, and their movement and assignment across the company's ecosystem.

## Features

- **Employee Management**: Keep track of employee details and roles.
- **Asset Management**: Monitor assets, their assignment, and movement within the organization.
- **Assignment Tracking**: Track the assignment of employees and assets across different departments.
- **Real-time Updates**: Ensures real-time notifications to the logged in admins.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 14.x or higher)
- **npm** (version 6.x or higher)
- **MongoDB** 
- **Redis** 

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/Abhijeet1005/Visitrx-new
   cd Visitrx-new
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory by copying the template from `.envDemo` and filling in the necessary configurations:

   ```bash
   cp .envDemo .env
   ```

   Update the `.env` file with your environment variables (e.g., database URL, Redis configuration, etc.).

### Running the Application

To start the server in development mode, use:

```bash
npm run dev
```

For production, use:

```bash
npm run start
```

## Contact

Feel free to reach out to me at [aschauhan1052002@gmail.com].

---