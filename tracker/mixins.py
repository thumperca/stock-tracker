import datetime
import tracker.models


class StockMixin(object):

    def to_overview(self):
        """Basic performance overview of a stock"""
        orm = tracker.models.Price.objects
        data = orm.filter(stock=self).order_by('-date').values_list('price', flat=True)[:200]
        return {
            'symbol': self.symbol,
            'stats': [
                self._get_difference(data=data, days=10),
                self._get_difference(data=data, days=50),
                self._get_difference(data=data, days=200),
            ]
        }

    def _get_difference(self, data, days):
        """Returns stocks difference details between current price and historic price"""
        if not len(data):
            return {'days': days, 'direction': None}
        if len(data) < days:
            return {'days': days, 'direction': None}
        new = data[0]
        old = data[days - 1]
        if new > old:
            direction = 'up'
            difference = round((new / old - 1) * 100, 1)
        else:
            direction = 'down'
            difference = round((1 - new / old) * 100, 1)
        return {'days': days, 'direction': direction, 'difference': difference}

    def get_graph(self):
        """Returns data to populate detailed EMA graph for a stock"""
        orm = tracker.models.Price.objects
        data = orm.filter(stock=self).order_by('date').values('date', 'price')[:400]
        prices = [float(entry['price']) for entry in data]
        ema_short = self._get_ema(prices, 10)
        ema_mid = self._get_ema(prices, 50)
        ema_long = self._get_ema(prices, 200)
        labels = [entry['date'].strftime('%d-%m-%Y') for entry in data[200:]]
        return {
            'labels': labels,
            'prices': prices[200:],
            'short': ema_short,
            'mid': ema_mid,
            'long': ema_long,
        }

    def _get_ema(self, data, period):
        """
        Get Exponential Moving Average for series data

        Args:
            data: list of equity prices from oldest to latest
            period: integer specifying period for exponential moving average

        Returns:
            list of Exponential Moving Average for a given period

        """
        ema = []
        j = 1
        sma = sum(data[:period]) / period
        multiplier = 2 / float(1 + period)
        ema.append(sma)
        ema.append(((data[period] - sma) * multiplier) + sma)
        for i in data[period + 1:]:
            tmp = ((i - ema[j]) * multiplier) + ema[j]
            j += 1
            ema.append(tmp)
        if len(ema) > 200:
            extra = len(ema) - 200
            ema = ema[extra:]
        return ema
