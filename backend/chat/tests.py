from django.test import TestCase

from .models import Message, Room


class MessageApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.room = Room.objects.create(name='test-room')
        cls.other_room = Room.objects.create(name='other-room')

    def post_message(self, **payload):
        return self.client.post(
            f'/api/rooms/{self.room.name}/messages/',
            payload,
            content_type='application/json',
        )

    def test_rejects_username_longer_than_80_characters(self):
        response = self.post_message(username='a' * 81, content='Hello')

        self.assertEqual(response.status_code, 400)
        self.assertIn('username', response.json())
        self.assertEqual(Message.objects.count(), 0)

    def test_rejects_message_longer_than_2000_characters(self):
        response = self.post_message(username='Alex', content='a' * 2001)

        self.assertEqual(response.status_code, 400)
        self.assertIn('content', response.json())
        self.assertEqual(Message.objects.count(), 0)

    def test_creates_message_in_the_room_from_the_url(self):
        response = self.post_message(
            room=self.other_room.id,
            username='Alex',
            content='Hello, room!',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['room'], self.room.id)
        self.assertEqual(response.json()['room_name'], self.room.name)
        self.assertEqual(Message.objects.get().room, self.room)
