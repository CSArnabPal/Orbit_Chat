from rest_framework import serializers
from .models import Room, Message

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'name']

class MessageSerializer(serializers.ModelSerializer):
    room = serializers.PrimaryKeyRelatedField(read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)
    username = serializers.CharField(max_length=80)
    content = serializers.CharField(max_length=2000)

    class Meta:
        model = Message
        fields = ['id', 'room', 'username', 'content', 'timestamp', 'room_name']