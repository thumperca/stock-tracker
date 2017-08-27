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
        if not len(data):
            return {'days': days, 'direction': None}
        if len(data) < days:
            return {'days': days, 'direction': None}
        new = data[0]
        old = data[days - 1]
        print('price {} days ago was {}'.format(days, old))
        if new > old:
            direction = 'up'
            difference = round((new / old - 1) * 100, 1)
        else:
            direction = 'down'
            difference = round((1 - new / old) * 100, 1)
        return {'days': days, 'direction': direction, 'difference': difference}
