Run cmd:

Terminal 1 : 

cd backend
.\venv\Scripts\activate
python -m uvicorn app.main:app --reload --port 8000

Terminal 2 : 
    cd frontend
    npm run dev
