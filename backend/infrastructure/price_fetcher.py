import pandas as pd
import yfinance as yf

from application.interfaces import PriceRepository


class YFinancePriceRepository(PriceRepository):
    def fetch_prices(self, tickers: list[str], start: str, end: str) -> pd.DataFrame:
        data = yf.download(tickers, start=start, end=end, auto_adjust=True, progress=False)

        if isinstance(data.columns, pd.MultiIndex):
            # Multiple tickers: columns are (field, ticker)
            return data["Close"]

        # Single ticker: columns are flat field names
        return data[["Close"]].rename(columns={"Close": tickers[0]})
