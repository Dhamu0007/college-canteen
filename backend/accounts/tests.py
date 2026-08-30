import io
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import User, CustomerProfile, AdminProfile

def create_test_image():
    file = io.BytesIO()
    image = Image.new('RGB', (100, 100), color='red')
    image.save(file, 'jpeg')
    file.seek(0)
    return SimpleUploadedFile('test_avatar.jpg', file.read(), content_type='image/jpeg')

class ProfileImageUploadTestCase(APITestCase):
    def setUp(self):
        self.customer_user = User.objects.create_user(
            username='testcustomer',
            email='customer@example.com',
            password='Password123!',
            user_type='customer'
        )
        self.customer_profile = CustomerProfile.objects.create(
            user=self.customer_user,
            full_name='Test Customer',
            email='customer@example.com'
        )

        self.admin_user = User.objects.create_user(
            username='testadmin',
            email='admin@example.com',
            password='Password123!',
            user_type='admin'
        )
        self.admin_profile = AdminProfile.objects.create(
            user=self.admin_user,
            full_name='Test Admin',
            email='admin@example.com'
        )

    def test_customer_profile_image_upload(self):
        self.client.force_authenticate(user=self.customer_user)
        url = reverse('customer_profile')
        image = create_test_image()

        response = self.client.put(url, {'full_name': 'Updated Customer', 'profile_picture': image}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.customer_profile.refresh_from_db()
        self.assertIsNotNone(self.customer_profile.profile_picture)
        self.assertTrue(self.customer_profile.profile_picture.name.startswith('customer_profiles/'))

    def test_admin_profile_image_upload(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin_profile')
        image = create_test_image()

        response = self.client.put(url, {'full_name': 'Updated Admin', 'profile_picture': image}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.admin_profile.refresh_from_db()
        self.assertIsNotNone(self.admin_profile.profile_picture)
        self.assertTrue(self.admin_profile.profile_picture.name.startswith('admin_profiles/'))
