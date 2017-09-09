"""
Daily updation of stock prices
This script should be run each day after market closes
ideally b/w 4pm to 8pm IST

"""
import json
from datetime import datetime
import requests
from django.core.management.base import BaseCommand
from tracker.models import Stock, Price


MAX_RETRIES = 3


class Command(BaseCommand):

    help = 'Daily updation of stock prices'

    def handle(self, *args, **options):
        """Handle script execution"""
        for stock in Stock.objects.all():
            self.process_stock(stock)

    def process_stock(self, stock):
        quote = self.get_stock_quote(stock.symbol)
        if not quote or not quote['price']:
            print('invalid quote')
            return
        self.update_stock(stock, quote)

    def update_stock(self, stock, quote):
        if quote['date'] == stock.modified_on and quote['price'] == float(stock.last_price):
            return
        stock.last_price = quote['price']
        stock.save(modified_on=quote['date'])
        Price.objects.create(stock=stock, date=quote['date'], price=quote['price'])

    def get_stock_quote(self, symbol, retry=0):
        if not retry:
            print('\nGetting updates for stock', symbol)
        elif retry > MAX_RETRIES:
            return
        url = ('https://www.nseindia.com/live_market/dynaContent/live_watch/'
               'get_quote/GetQuote.jsp?symbol={}'.format(symbol.replace('&', '%26')))
        response = requests.get(url)
        if response.status_code != 200:
            print('failed with response', response.status_code)
            return self.get_stock_quote(symbol=symbol, retry=(retry + 1))
        print('success')
        return self.get_quote(response)

    def get_quote(self, response):
        quote = self.parse_response(response)
        if not quote:
            return
        try:
            price = float(quote['data'][0]['closePrice'].replace(',', ''))
        except IndexError:
            return
        if not price:
            return
        date = datetime.strptime(quote['tradedDate'], '%d%b%Y').date()
        return {'date': date, 'price': price}

    def parse_response(self, response):
        for line in response.iter_lines():
            line = line.decode('ascii')
            if '{"futLink":"' not in line:
                continue
            data = json.loads(line)
            return data
