# Video Interview Practice App

## Overview
A comprehensive application for practicing video interviews with AI-powered feedback.
- **Frontend**: React, Vite, TailwindCSS (in `frontend/`)
- **Backend**: FastAPI, OpenAI, Supabase (in `backend/`)

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Supabase Account
- OpenAI API Key

### Installation

1.  **Backend**
    ```bash
    cd backend
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    cp .env.example .env
    ```

2.  **Frontend**
    ```bash
    cd frontend
    npm install
    ```

## Development

Run `start.sh` in the root directory to start both services:
```bash
./start.sh
```

## Structure
- `backend/`: API services and business logic.
- `frontend/`: UI and user interaction logic.
