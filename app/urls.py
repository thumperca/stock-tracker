"""app URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from tracker import views

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^api/stocks/$', views.stocks),
    url(r'^api/my-stocks/$', views.mystocks),
    url(r'^api/stock/(?P<symbol>.*)/$', views.StockView.as_view()),
    url(r'^api/ema/(?P<symbol>.*)/$', views.ema),
    url(r'^api/screener$', views.screener),
    url(r'^api/signals$', views.signals),
    url(r'^api/gains$', views.gains),
    url(r'^', views.home),
]
