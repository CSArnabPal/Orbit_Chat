from django.shortcuts import render
from rest_framework import generics
from .models import Room, Message
from .serializers import RoomSerializer, MessageSerializer

class RoomList(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class MessageList(generics.ListCreateAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        room = self.get_room()
        return Message.objects.filter(room=room)

    def perform_create(self, serializer):
        serializer.save(room=self.get_room())

    def get_room(self):
        room_name = self.kwargs['room_name'].lower()
        room, _ = Room.objects.get_or_create(name=room_name)
        return room
