from django.shortcuts import render, reverse
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
# Create your views here.
def land(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect(reverse('list'))
    return HttpResponseRedirect(reverse('account_login'))

@login_required
def home(request):
    return render(request,'frontend/home.html')
