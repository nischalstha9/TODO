from django.shortcuts import render
from django.http import JsonResponse

from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
from rest_framework.response import Response
from .serializers import TaskSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import BasePermission
from rest_framework.generics import ListAPIView
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Task
# Create your views here.
class IsOwnerOrReadOnly(BasePermission):
    message = "You must be owner to edit."
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

@api_view(['GET'])
def apiOverview(request):
	api_urls = {
		'List':'/task-list/',
		'Detail View':'/task-detail/<str:pk>/',
		'Create':'/task-create/',
		'Update':'/task-update/<str:pk>/',
		'Delete':'/task-delete/<str:pk>/',
		}
	return Response(api_urls)

@api_view(['GET'])
def taskList(request, pk):
	tasks = Task.objects.filter(user=pk).order_by('-id')
	serializer = TaskSerializer(tasks, many=True)
	return Response(serializer.data)

@api_view(['GET'])
def taskDetail(request, pk):
	tasks = Task.objects.get(id=pk)
	serializer = TaskSerializer(tasks, many=False)
	return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def taskCreate(request):
	serializer = TaskSerializer(data=request.data)

	if serializer.is_valid():
		serializer.save()

	return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsOwnerOrReadOnly])
def taskUpdate(request, pk):
	task = Task.objects.get(id=pk)
	if task.user == request.user:
		serializer = TaskSerializer(instance=task, data=request.data)
		if serializer.is_valid():
			serializer.save()
		return Response(serializer.data)
	return Response('You dont have permission')
	


@api_view(['DELETE'])
@permission_classes([IsOwnerOrReadOnly])
def taskDelete(request, pk):
	task = Task.objects.get(id=pk)
	if task.user == request.user:
		task.delete()
		return Response('Item succsesfully deleted!')
	return Response('You dont have permission')


class TaskSearchAPIView(ListAPIView):
    serializer_class = TaskSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title']
    def get_queryset(self, *args, **kwargs):
        queryset_list = Task.objects.filter(user = self.request.user)
        return queryset_list
