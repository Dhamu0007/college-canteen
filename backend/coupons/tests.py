from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from coupons.models import Coupon
from coupons.serializers import CouponSerializer
from accounts.models import User

class CouponModelTestCase(TestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            username='admin_test',
            email='admin@test.com',
            user_type='admin'
        )
        self.coupon = Coupon.objects.create(
            code='WELCOME10',
            name='10% Off First Order',
            discount_type='percentage',
            discount_value=10,
            min_order_value=100,
            valid_from=timezone.now() - timedelta(days=1),
            valid_to=timezone.now() + timedelta(days=30),
            is_active=True,
            created_by=self.admin_user
        )

    def test_coupon_validity(self):
        is_valid, msg = self.coupon.is_valid()
        self.assertTrue(is_valid)
        self.assertFalse(self.coupon.is_expired())

    def test_coupon_serializer(self):
        serializer = CouponSerializer(self.coupon)
        data = serializer.data
        self.assertEqual(data['code'], 'WELCOME10')
        self.assertTrue(data['is_valid'])

    def test_coupon_serializer_creation(self):
        form_data = {
            'code': 'SUMMER20',
            'name': 'Summer Sale',
            'discount_type': 'percentage',
            'discount_value': '20',
            'min_order_value': '50',
            'max_discount': '',
            'valid_from': timezone.now().isoformat(),
            'valid_to': (timezone.now() + timedelta(days=10)).isoformat(),
            'is_active': True
        }
        s = CouponSerializer(data=form_data)
        self.assertTrue(s.is_valid(), s.errors)
        obj = s.save(created_by=self.admin_user)
        self.assertEqual(obj.code, 'SUMMER20')
        self.assertEqual(s.data['code'], 'SUMMER20')
