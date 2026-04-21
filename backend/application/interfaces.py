from abc import ABC, abstractmethod
import pandas as pd


class PriceRepository(ABC):
    @abstractmethod
    def fetch_prices(self, tickers: list[str], start: str, end: str) -> pd.DataFrame:
        """Returns DataFrame indexed by date with one column per ticker (adjusted close)."""
        ...


class TickerSearchRepository(ABC):
    @abstractmethod
    def search(self, query: str) -> list[dict]:
        """Returns list of {"ticker": str, "name": str} dicts."""
        ...
