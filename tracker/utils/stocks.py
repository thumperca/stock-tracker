"""
Return all stock with performance data
"""
from datetime import timedelta
from tracker.models import Stock, Price
from .date import get_nearest_date, get_last_trade_date


def calculate_difference(price_now, price_old):
    if not price_now or not price_old:
            return {'direction': None}
    if price_now > price_old:
        direction = 'up'
        difference = round((price_now / price_old - 1) * 100, 1)
    else:
        direction = 'down'
        difference = round((1 - price_now / price_old) * 100, 1)
    return {'direction': direction, 'difference': difference}


def get_all_stocks():
    last_trade_date = get_last_trade_date()
    three_months = get_nearest_date(last_trade_date - timedelta(days=92))
    six_months = get_nearest_date(last_trade_date - timedelta(days=182))
    year_ago = get_nearest_date(last_trade_date - timedelta(days=365))

    target_dates = (year_ago, six_months, three_months, last_trade_date)
    db_data = Price.objects.filter(date__in=target_dates).order_by('date')

    keys = {
        str(last_trade_date): 'now',
        str(three_months): '3m',
        str(six_months): '6m',
        str(year_ago): '12m',
    }

    raw_data = {}
    for entry in db_data:
        key = keys[str(entry.date)]
        _data = {key: float(entry.price)}
        if key == 'now':
            _data.update({'quantity': entry.quantity, 'delivery': float(entry.delivery)})
        try:
            raw_data[entry.stock_id].update(_data)
        except KeyError:
            raw_data[entry.stock_id] = _data

    data = []
    for key in sorted(raw_data.keys()):
        _data = raw_data[key]
        data.append({
            'symbol': key,
            'price': _data.get('now'),
            'quantity': _data.get('quantity', 0),
            'delivery': _data.get('delivery'),
            '3m': calculate_difference(_data.get('now'), _data.get('3m')),
            '6m': calculate_difference(_data.get('now'), _data.get('6m')),
            '12m': calculate_difference(_data.get('now'), _data.get('12m')),
        })
    from operator import itemgetter
    newlist = sorted(data, key=itemgetter('quantity'), reverse=True)

    return newlist
