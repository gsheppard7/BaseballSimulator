from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .scoring import score_lineup
from .simulate import run_simulation
from .models import LineupInput, ScoreResponse, SimulateInput, SimulateResponse

app = FastAPI(title="Lineup Sim Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/score", response_model=ScoreResponse)
def score(input: LineupInput):
    return score_lineup(input)


@app.post("/simulate", response_model=SimulateResponse)
def simulate(input: SimulateInput):
    return run_simulation(input)
