"""
Script to crawl NSE website and get archives stock prices
"""

import datetime

import requests
from bs4 import BeautifulSoup

from django.core.management.base import BaseCommand

from tracker.models import Stock, Price


def date_to_string(date):
    return date.strftime('%d-%b-%Y')


def string_to_date(string):
    return datetime.strptime(string, '%d-%b-%Y').date()


class Command(BaseCommand):

    help = 'Import archives prices from NSE website'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.stocks = tuple(Stock.objects.all().values_list('symbol', flat=True))
        self.prices = self.preload_data()

    def preload_data(self):
        prices = Price.objects.all().values('date', 'stock_id')
        data = {}
        for price in prices:
            date = str(price['date'])
            try:
                data[date].append(price['stock_id'])
            except KeyError:
                data[date] = [price['stock_id']]
        for key in data:
            data[key] = set(data[key])
        return data

    def handle(self, *args, **options):
        """Handle script execution"""
        current_date = datetime.date.today()
        archive_date = datetime.date(2016, 6, 1)
        while archive_date < current_date:
            self.import_archive(archive_date)
            archive_date += datetime.timedelta(days=1)

    def import_archive(self, date):
        raw_date = str(date)
        data = []
        print('\nprocessing date', raw_date)
        counter = 0
        for row in self.get_data(date):
            counter += 1
            exists = False
            try:
                if row['symbol'] in self.prices[raw_date]:
                    exists = True
            except KeyError:
                exists = False
            if exists:
                continue
            if row['symbol'] not in self.stocks:
                stock = Stock(symbol=row['symbol'])
                stock.last_price = row['price']
                stock.save(modified_on=date)
            data.append(Price(stock_id=row['symbol'], date=date, price=row['price']))
        Price.objects.bulk_create(data)
        print('counter:', counter, 'added:', len(data))

    def get_data(self, date):
        url = self.get_csv_url(date)
        if not url:
            return
        contents = self.get_csv_contents(url)
        splitter = '\r\n' if contents.count('\r\n') > 100 else '\n'
        for row in contents.split(splitter):
            data = row.split(',')
            if len(data) < 3 or data[1] != 'EQ':
                continue
            stock = {'symbol': data[0], 'price': float(data[-1])}
            yield stock

    def get_csv_url(self, date):
        url = ('https://www.nseindia.com/ArchieveSearch?h_filetype=csqr&date='
               '{}&section=EQ'.format(date.strftime('%d-%m-%Y')))
        response = requests.get(url)
        if response.status_code != 200:
            print('failed for date', date)
            return
        soup = BeautifulSoup(response.content, 'html.parser')
        anchor = soup.find('a')
        if not anchor:
            print('no data for date')
            return
        return 'https://www.nseindia.com' + anchor['href']

    def get_csv_contents(self, url):
        response = requests.get(url)
        if response.status_code != 200:
            print('failed to read csv file at', url)
            return
        return response.text
