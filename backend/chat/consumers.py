import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Room, Message

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        await self.get_or_create_room(self.room_name)
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except (TypeError, json.JSONDecodeError):
            await self.send_error('Message must be valid JSON.')
            return

        if not isinstance(data, dict):
            await self.send_error('Message must be an object.')
            return

        username = data.get('username')
        message = data.get('message')
        if not isinstance(username, str) or not isinstance(message, str):
            await self.send_error('A name and message are required.')
            return

        username = username.strip()
        message = message.strip()
        if not username or len(username) > 80:
            await self.send_error('Your name must be between 1 and 80 characters.')
            return
        if not message or len(message) > 2000:
            await self.send_error('Messages must be between 1 and 2,000 characters.')
            return

        room = await self.get_room(self.room_name)
        created_message = await self.create_message(room, username, message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'id': created_message.id,
                'username': username,
                'message': message,
                'timestamp': created_message.timestamp.isoformat()
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'id': event['id'],
            'username': event['username'],
            'content': event['message'],
            'timestamp': event['timestamp'],
        }))

    async def send_error(self, message):
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message,
        }))

    @database_sync_to_async
    def get_or_create_room(self, room_name):
        return Room.objects.get_or_create(name=room_name)

    @database_sync_to_async
    def get_room(self, room_name):
        return Room.objects.get_or_create(name=room_name)[0]

    @database_sync_to_async
    def create_message(self, room, username, content):
        return Message.objects.create(room=room, username=username, content=content)