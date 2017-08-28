from datetime import date, timedelta
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

    def get_graph(self, period=None):
        """Returns data to populate detailed EMA graph for a stock"""
        orm = tracker.models.Price.objects
        data = orm.filter(stock=self).order_by('date').values('date', 'price')
        prices = [float(entry['price']) for entry in data]
        ema_short = self._get_ema(prices, 10)
        ema_mid = self._get_ema(prices, 50)
        ema_long = self._get_ema(prices, 200)
        # labels = [entry['date'].strftime('%d-%m-%Y') for entry in data]
        response = {
            # 'labels': labels,
            'prices': prices,
            'short': ema_short,
            'mid': ema_mid,
            'long': ema_long,
        }
        return self._limit_to_days(data=data, response=response, period=period)

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
        # if len(ema) > 200:
        #     extra = len(ema) - 200
        #     ema = ema[extra:]
        return ema

    def _limit_to_days(self, data, response, period):
        """Limit response data to certain timeperiod"""
        offset_date = self._get_offset_date(period)
        if offset_date:
            data = data.filter(date__gte=offset_date)
        return self._balance_data(data, response)

    def _get_offset_date(self, period):
        #   validate period
        valid_periods = ['1w', '1m', '3m', '6m', '1y', '2y', 'max']
        period = str(period).lower()
        if period not in valid_periods:
            period = 'max'
        #   return date
        today = date.today()
        if period == '1w':
            return today - timedelta(days=7)
        elif period == '1m':
            return today - timedelta(days=30)
        elif period == '3m':
            return today - timedelta(days=90)
        elif period == '6m':
            return today - timedelta(days=178)
        elif period == '1y':
            return today - timedelta(days=356)
        elif period == '2y':
            return today - timedelta(days=712)
        else:
            return None

    def _balance_data(self, data, response):
        labels = [entry['date'].strftime('%d-%m-%Y') for entry in data]
        size = len(labels)

        def correct_size(data, size):
            length = len(data)
            #   more data available then needed
            #   trim data down to optimal size
            if length > size:
                extra = length - size
                data = data[extra:]
            #   some data is missing
            #   extra padding is needed to align graph properly
            elif length < size:
                data.reverse()
                for i in range(size - length):
                    data.append(None)
                data.reverse()
            return data

        response['prices'] = correct_size(response['prices'], size)
        response['long'] = correct_size(response['long'], size)
        response['mid'] = correct_size(response['mid'], size)
        response['short'] = correct_size(response['short'], size)

        response['labels'] = labels
        return response
