from django.shortcuts import render
from django.http import JsonResponse, HttpResponse

from tracker.models import Stock
from tracker.utils import Signals


def home(request):
    return render(request, 'home.html')


def stocks(request):
    stocks = Stock.objects.all()
    #   Todo: enable under after making changes to DB
    # if request.GET.get('q', '').lower() == 'portfolio':
    #     stocks = stocks.filter(purchased=True)
    stocks = stocks.order_by('symbol')
    data = [stock.to_overview() for stock in stocks]
    return JsonResponse(data, safe=False)


def stock(request, symbol):
    try:
        stock = Stock.objects.get(pk=symbol)
    except Stock.DoesNotExist:
        return JsonResponse({'failed': True}, status=404)
    stats = stock.get_graph(period=request.GET.get('t'))
    return JsonResponse(stats)


def screener(request):
    ema = request.GET.get('q')
    if ema not in ('50', '100', '200'):
        return HttpResponse('Invalid request', status=400)
    stocks = Stock.objects.below_ema(days=int(ema))
    data = [stock.to_overview() for stock in stocks]
    return JsonResponse(data, safe=False)


def signals(request):
    signals = Signals()
    data = signals.find()
    return JsonResponse(data, safe=False)
