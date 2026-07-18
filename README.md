# Resilinet
##  Live Links
Frontend:https://resilinet-sooty.vercel.app/ ** [ResiliNet Triage App]
Backend:https://resilinet-1.onrender.com/health ** [Live API]

##  Tech Stack

### Frontend
*   **Framework:** [Next.js](https://nextjs.org/) (App Router, TypeScript)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Deployment:** [Vercel](https://vercel.com/)

### Backend (AI Service)
*   **Language:** [Python](https://www.python.org/)
*   **Framework:** [FastAPI](https://fastapi.tiangolo.com/) 
*   **Deployment:** [Render](https://render.com/)

### Package Management & Workspace
*   **Monorepo Tooling:** [pnpm Workspaces](https://pnpm.io/workspaces)

---

##  Getting Started & Setup

### Prerequisites
Make sure you have the following installed on your local machine:
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [pnpm](https://pnpm.io/installation) (`npm install -g pnpm`)
*   [Python 3.9+](https://www.python.org/downloads/)

### 1. Clone the Repository
```bash
git clone [https://github.com/bibhuti-parida/resilinet.git](https://github.com/bibhuti-parida/resilinet.git)
cd resilinet
2. Monorepo Dependency Installation
This project uses `pnpm` workspaces to manage dependencies for both the frontend and backend applications from the root directory.

```bash
Install all dependencies across the workspace
  pnpm install

3. Frontend Setup (frontend-nextjs)
Navigate to the frontend directory:
  cd frontend-nextjs
Create a .env.local file and add any required environment variables:
  NEXT_PUBLIC_API_URL=http://localhost:8000
Start the local development server:
  pnpm dev

4. Backend Setup (backend-ai)
Navigate to the backend directory:
  cd ../backend-ai
Create a virtual environment and activate it:
  # Windows
  python -m venv venv
  .\venv\Scripts\activate
   # macOS/Linux
  python3 -m venv venv
  source venv/bin/activate
Install the Python dependencies:
  pip install -r requirements.txt
Start the FastAPI backend server:
  uvicorn main:app --reload
