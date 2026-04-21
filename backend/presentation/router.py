from fastapi import APIRouter, HTTPException, Query

from application.use_cases import RunBacktestUseCase
from domain.entities import Asset, BacktestConfig
from infrastructure.price_fetcher import YFinancePriceRepository
from infrastructure.ticker_search import YFinanceTickerSearchRepository
from presentation.schemas import BacktestRequest, BacktestResponse, TickerResult

router = APIRouter(prefix="/api/v1")


@router.post("/backtest", response_model=BacktestResponse)
async def run_backtest(request: BacktestRequest):
    config = BacktestConfig(
        assets=[Asset(ticker=a.ticker.upper(), weight=a.weight) for a in request.assets],
        initial_amount=request.initial_amount,
        start_date=request.start_date,
        end_date=request.end_date,
        rebalance_period=request.rebalance_period,
        reinvest_dividends=request.reinvest_dividends,
        benchmark=request.benchmark.upper(),
    )
    try:
        result = RunBacktestUseCase(YFinancePriceRepository()).execute(config)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return BacktestResponse(**result.__dict__)


@router.get("/search", response_model=list[TickerResult])
async def search_ticker(q: str = Query(min_length=1)):
    return YFinanceTickerSearchRepository().search(q)


@router.get("/health")
async def health():
    return {"status": "ok"}
