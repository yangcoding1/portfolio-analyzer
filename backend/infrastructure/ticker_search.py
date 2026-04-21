import yfinance as yf

from application.interfaces import TickerSearchRepository


class YFinanceTickerSearchRepository(TickerSearchRepository):
    def search(self, query: str) -> list[dict]:
        try:
            results = yf.Search(query, max_results=5)
            return [
                {"ticker": r["symbol"], "name": r.get("longname") or r["symbol"]}
                for r in results.quotes
                if "symbol" in r
            ]
        except Exception:
            return []
