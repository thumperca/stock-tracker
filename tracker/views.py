from django.shortcuts import render
from django.http import JsonResponse

from tracker.models import Stock


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
