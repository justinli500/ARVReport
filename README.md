# ARVReport

This project contains a React + TypeScript frontend and a Flask backend.
The backend exposes an API endpoint for generating ARV reports.  It now
integrates a Selenium based script (see `backend/arv_script.py`) which logs in
to the Matrix MLS, gathers comparable listings and produces a PDF report with
listing photos.  The endpoint returns the estimated ARV and the name of the
generated PDF file.

## Prerequisites

- Node.js and npm
- Python 3.8+

## Installation

Install Node dependencies:

```bash
npm install
```

Install Python dependencies for the backend (which uses Selenium and other
libraries to automate a headless Chrome session):

```bash
cd backend
pip install -r requirements.txt
```

## Running the app

Start the Flask backend:

```bash
python backend/app.py
```

In another terminal, start the React development server:

```bash
npm run dev
```

The frontend expects the backend to run on `http://localhost:5000`. If you want
to change this, set the environment variable `VITE_API_URL` before running the
frontend:

```bash
VITE_API_URL=http://localhost:5000 npm run dev
```

## Building for production

```bash
npm run build
```

Then serve the built files from `dist/` with your preferred server.

