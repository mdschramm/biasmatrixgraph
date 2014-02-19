from django.conf import settings
from django.shortcuts import render
def biasmatrix(request):
    return render(request, "graph.html")

