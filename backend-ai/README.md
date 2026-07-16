# ResiliNet AI Backend

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The first startup trains and writes `disaster_triage_model.pkl` beside `main.py`.
The local API is available at `http://127.0.0.1:8000/api/triage`.

## Project structure

```text
main.py                 FastAPI application setup and lifecycle
api/triage.py           Health and triage HTTP endpoints
models/schemas.py       Request validation and API response mapping
services/classifier.py  Model training, loading, and inference
services/deduplication.py  Geographic duplicate detection
services/signal_store.py   In-memory signals and metrics
data/training.py        Labelled examples for the classifier
core/config.py          Shared paths, thresholds, and category constants
```
