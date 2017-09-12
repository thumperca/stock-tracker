"""
Script to crawl NSE website and get historic prices for last two years
"""
import sys
from datetime import datetime

import requests
from bs4 import BeautifulSoup

from django.core.management.base import BaseCommand

from tracker.models import Stock, Price


def date_to_string(date):
    return date.strftime('%d-%b-%Y')


def string_to_date(string):
    return datetime.strptime(string, '%d-%b-%Y').date()


class Command(BaseCommand):

    help = 'Import historic prices from NSE website'

    def add_arguments(self, parser):
        parser.add_argument('symbol', nargs='+', type=str)

    def handle(self, *args, **options):
        """Handle script execution"""
        symbol = options['symbol'][0].upper()
        data = self.get_data(symbol)
        self.import_data(symbol, data)

    def get_data(self, symbol):
        #   crawl the website
        precheck = self.precheck(symbol.lower())
        if not precheck:
            sys.exit('precheck failed')

        url = ('https://www.nseindia.com/products/dynaContent/common/productsSymbolMapping.jsp?'
               'symbol={}&segmentLink=3&symbolCount=1&series=ALL&dateRange=24month&'
               'fromDate=&toDate=&dataType=PRICEVOLUME').format(symbol.lower().replace('&', '%26'))
        response = requests.get(url)
        if response.status_code != 200:
            print('Crawling failed with error', response.status_code)
        requests.get('https://www.nseindia.com/images/loading_trades.gif')
        soup = BeautifulSoup(response.content, 'html.parser')
        try:
            data = soup.find('div', {'id': 'csvContentDiv'}).get_text()
        except AttributeError:
            print(url)
            sys.exit(response.content)
        return data

    def precheck(self, symbol):
        url = "https://www.nseindia.com/marketinfo/sym_map/symbolCount.jsp?symbol="
        url += symbol
        response = requests.get(url)
        if response.status_code != 200:
            return
        if response.text.strip() != '1':
            return
        return True

    def import_data(self, symbol, data):
        stock = self.get_stock(symbol)
        dates = Price.objects.filter(stock=stock).values_list('date', flat=True)
        dates = (date_to_string(date) for date in dates)
        _data = []
        for row in self.get_row(symbol, data):
            if row['raw_date'] in dates:
                continue
            _data.append(Price(stock=stock, date=row['date'], price=row['price']))
        Price.objects.bulk_create(_data)

    def get_stock(self, symbol):
        try:
            return Stock.objects.get(pk=symbol)
        except Stock.DoesNotExist:
            return Stock.objects.create(symbol=symbol)

    def get_row(self, symbol, data):
        for row in data.split(':'):
            stock = row.split(',')
            try:
                data = {'symbol': stock[0], 'date': stock[2], 'price': stock[8]}
            except IndexError:
                continue

            for key in data:
                value = data[key]
                value = value.replace('"', '').strip()
                data[key] = value

            if data['symbol'] != symbol:
                continue

            data.update({
                'price': float(data['price']),
                'raw_date': data['date'],
                'date': string_to_date(data['date'])
            })

            yield data
