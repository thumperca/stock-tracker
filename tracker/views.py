import json
from datetime import timedelta

from django.shortcuts import render
from django.views import View
from django.http import JsonResponse, HttpResponse

from tracker.models import Stock, Price
from tracker.utils import Signals, get_nearest_date, get_all_stocks, get_my_stocks


class BaseView(View):

    def dispatch(self, request, *args, **kwargs):
        if request.method == 'POST':
            request.jsondata = json.loads(request.body.decode('utf-8'))
        return super(BaseView, self).dispatch(request, *args, **kwargs)


def home(request):
    """Entry point for SPA"""
    return render(request, 'home.html')


def stocks(request):
    """Get list of all stocks"""
    data = get_all_stocks()
    return JsonResponse(data, safe=False)


class StockView(BaseView):
    """Details for a stock"""

    def dispatch(self, request, *args, **kwargs):
        try:
            request.stock = Stock.objects.get(pk=kwargs.get('symbol'))
        except Stock.DoesNotExist:
            return JsonResponse({'failed': True}, status=404)
        return super(StockView, self).dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        db_data = Price.objects.filter(stock=request.stock).order_by('-date')[:22]
        data = []
        for entry in db_data:
            data.append({
                'date': str(entry.date),
                'quantity': entry.format_qty,
                'delivery': entry.delivery,
                'price': float(entry.price),
            })
        response = {
            'symbol': request.stock.symbol,
            'purchased': request.stock.is_purchased,
            'watchlist': request.stock.is_watchlist,
            'data': data,
        }
        return JsonResponse(response)

    def post(self, request, *args, **kwargs):
        stock, data = request.stock, request.jsondata
        if 'watchlist' in data:
            stock.is_watchlist = data['watchlist']
        if 'purchased' in data:
            stock.is_purchased = data['purchased']
        stock.save()
        response = {
            'watchlist': stock.is_watchlist,
            'purchased': stock.is_purchased,
        }
        return JsonResponse(response)


def ema(request, symbol):
    """Exponential Moving Average for a stock"""
    try:
        stock = Stock.objects.get(pk=symbol)
    except Stock.DoesNotExist:
        return JsonResponse({'failed': True}, status=404)
    stats = stock.get_graph(period=request.GET.get('t'))
    return JsonResponse(stats)


def screener(request):
    """Stock screener based on moving averages"""
    ema = request.GET.get('q')
    if ema not in ('50', '100', '200'):
        return HttpResponse('Invalid request', status=400)
    stocks = Stock.objects.below_ema(days=int(ema))
    data = [stock.to_overview() for stock in stocks]
    return JsonResponse(data, safe=False)


def signals(request):
    """Detect buy signals based on moving averages"""
    signals = Signals()
    data = signals.find()
    return JsonResponse(data, safe=False)


def gains(request):
    """Get stocks with max gains in a period"""
    options = {'1D': 1, '2D': 2, '3D': 3, '1W': 7, '2W': 14, '1M': 30,
               '3M': 92, '6M': 182, '1Y': 365, '2Y': 730}
    days = options.get(request.GET.get('q'))
    if not days:
        return HttpResponse(status=400)

    last_trade_date = Price.objects.all().order_by('-id')[0].date
    initial_date = last_trade_date - timedelta(days=days)
    initial_date = get_nearest_date(initial_date)

    target_dates = (initial_date, last_trade_date)
    db_data = Price.objects.filter(date__in=target_dates).order_by('date')

    data = {}
    for entry in db_data:
        try:
            data[entry.stock_id].append(float(entry.price))
        except KeyError:
            data[entry.stock_id] = [float(entry.price)]

    gains = {}
    for stock in data:
        prices = data[stock]
        if len(prices) != 2:
            continue
        price_old, price_new = prices
        if price_old >= price_new:
            continue
        gain = round((price_new / price_old - 1) * 100, 2)
        gains[stock] = gain

    data = {k: gains[k]for k in sorted(gains, key=gains.get, reverse=True)}
    prices = Price.objects.filter(date=last_trade_date)
    prices_data = {entry.stock_id: entry for entry in prices}

    data, _data = [], data
    for symbol in _data:
        price = prices_data[symbol]
        data.append({'symbol': symbol, 'gain': _data[symbol],
                     'qty': price.format_qty, 'delivery': price.delivery})

    return JsonResponse(data, safe=False)


def mystocks(request):
    data = get_my_stocks()
    return JsonResponse(data, safe=False)
