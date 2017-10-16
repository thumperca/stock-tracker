"""
Helper functions for dates periods
"""
from datetime import timedelta
from tracker.models import Price

TEST_STOCK = 'INFY'


def get_nearest_date(date, retry=0):
    if retry > 100:
        raise Exception('The retry exceeds limit')
    try:
        price = Price.objects.get(stock_id=TEST_STOCK, date=date)
    except Price.DoesNotExist:
        date += timedelta(days=1)
        return get_nearest_date(date, retry + 1)
    else:
        return price.date
