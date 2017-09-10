"""
Detect Buy and Sell signals in stocks based on price movements
"""
import datetime
from tracker.models import Price, Stock
from tracker.mixins import EMAOperations


class Signals(EMAOperations):

    def find(self):
        prices = self.__get_prices()

        data = {}
        for stock in prices:
            short_signal, long_signal = self.__inspect_stock(prices[stock])
            if not short_signal and not long_signal:
                continue
            data[stock] = {'short': short_signal, 'long': long_signal}
        if not data:
            return []

        data, _data = [], data
        stocks = Stock.objects.filter(pk__in=_data.keys())
        for stock in stocks:
            stock_data = stock.to_overview()
            stock_data['signals'] = _data[stock.pk]
            data.append(stock_data)
        return data

    def __get_prices(self):
        limit = datetime.date.today() - datetime.timedelta(days=365)
        prices = Price.objects.filter(date__gte=limit).order_by('date')
        data = {}
        for symbol, price in prices.values_list('stock_id', 'price'):
            try:
                data[symbol].append(float(price))
            except KeyError:
                data[symbol] = [float(price)]
        return data

    def __inspect_stock(self, prices):
        if not prices:
            return None, None
        ema_short = self._get_ema(prices, 10)[-10:]
        ema_mid = self._get_ema(prices, 50)[-10:]
        ema_long = self._get_ema(prices, 200)[-10:]
        signal_short = self.__find_intersection(ema_short, ema_mid)
        signal_long = self.__find_intersection(ema_mid, ema_long)
        return (signal_short, signal_long)

    def __find_intersection(self, shorter, longer):
        if not shorter or not longer:
            return None
        initial_trend = (shorter[0] > longer[0])
        signal = None
        for x, y in zip(shorter, longer):
            trend = x > y
            if trend == signal or trend == initial_trend:
                continue
            signal = trend
            break
        if not signal:
            return None
        if initial_trend:
            return 'sell'
        else:
            return 'buy'
