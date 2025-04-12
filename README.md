# Deal Hunter

A web application that helps users find and track the best deals across various online retailers.

## Features

- Deal tracking and alerts
- Price comparison across multiple websites
- User account management
- Customizable deal filters
- Email notifications for price drops

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14.x or higher)
- [npm](https://www.npmjs.com/) (v6.x or higher)
- [Git](https://git-scm.com/)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rajshah9305/deal-hunter123.git
   cd deal-hunter123
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

   If the project has separate frontend and backend directories, you may need to install dependencies in both:
   ```bash
   # If there's a client folder
   cd client
   npm install
   cd ..

   # If there's a server folder
   cd server
   npm install
   cd ..
   ```

## Configuration

Create a `.env` file in the root directory (or in the server directory if applicable) with the following variables:

```
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
```

Replace the placeholder values with your actual configuration details.

## Running the Application

### Development Mode

To run the application in development mode:

```bash
npm run dev
```

This will start both the backend server and frontend development server.

If the project is separated into client and server:

```bash
# Start the backend server
cd server
npm run dev

# In a separate terminal, start the frontend
cd client
npm start
```

### Production Mode

To build and run the application for production:

```bash
# Build the frontend (if applicable)
cd client
npm run build
cd ..

# Start the server
npm start
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Create an account or log in
3. Set up your deal preferences
4. Browse available deals or set up alerts for specific products

## Project Structure

```
deal-hunter123/
├── client/             # Frontend code
│   ├── public/         # Static files
│   ├── src/            # React source code
│   └── package.json    # Frontend dependencies
├── server/             # Backend code
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   └── package.json    # Backend dependencies
├── .env                # Environment variables
├── .gitignore          # Git ignore file
├── package.json        # Main package.json
└── README.md           # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
