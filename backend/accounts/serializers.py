from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, AdminProfile, CustomerProfile, OTPVerification
import re

class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'college_id', 'user_type', 'is_verified', 'profile_picture', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_profile_picture(self, obj):
        pic = None
        if hasattr(obj, 'customer_profile') and obj.customer_profile and obj.customer_profile.profile_picture:
            pic = obj.customer_profile.profile_picture
        elif hasattr(obj, 'admin_profile') and obj.admin_profile and obj.admin_profile.profile_picture:
            pic = obj.admin_profile.profile_picture
        elif obj.profile_picture:
            pic = obj.profile_picture

        if not pic:
            return None

        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(pic.url)
        return pic.url

class AdminProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = AdminProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class CustomerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = CustomerProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'total_orders']

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=15, required=False, allow_blank=True, default='')
    college_id = serializers.CharField(max_length=50, required=False, allow_blank=True, default='')
    password = serializers.CharField(write_only=True, validators=[validate_password])
    full_name = serializers.CharField(max_length=255)
    user_type = serializers.CharField(max_length=20, default='customer')

    def validate_phone_number(self, value):
        if value and not re.match(r'^[6-9]\d{9}$', value):
            raise serializers.ValidationError("Enter a valid Indian mobile number (10 digits starting with 6-9)")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            phone_number=validated_data.get('phone_number') or None,
            college_id=validated_data.get('college_id') or '',
            password=validated_data['password'],
            user_type=validated_data.get('user_type', 'customer'),
            is_verified=True
        )
        
        if user.user_type == 'customer':
            CustomerProfile.objects.create(
                user=user,
                full_name=validated_data['full_name'],
                phone_number=validated_data.get('phone_number') or '',
                email=validated_data['email'],
                college_id=validated_data.get('college_id') or '',
                is_phone_verified=True,
                is_email_verified=True
            )
        elif user.user_type == 'admin':
            AdminProfile.objects.create(
                user=user,
                full_name=validated_data['full_name'],
                phone_number=validated_data.get('phone_number') or '',
                email=validated_data['email']
            )
        
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            # If user passed an email in the username field, lookup the associated username
            if '@' in username:
                user_obj = User.objects.filter(email=username).first()
                if user_obj:
                    username = user_obj.username

            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid username or password.")
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
        else:
            raise serializers.ValidationError("Must include 'username' and 'password'.")

        data['user'] = user
        return data

class TokenSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()

class OTPRequestSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15, required=False)
    email = serializers.EmailField(required=False)
    otp_type = serializers.ChoiceField(choices=OTPVerification.OTP_TYPES)

    def validate(self, data):
        if not data.get('phone_number') and not data.get('email'):
            raise serializers.ValidationError("Either phone_number or email is required.")
        
        if data.get('phone_number'):
            if not re.match(r'^[6-9]\d{9}$', data['phone_number']):
                raise serializers.ValidationError("Enter a valid Indian mobile number.")
        
        return data

class OTPVerifySerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15, required=False)
    email = serializers.EmailField(required=False)
    otp = serializers.CharField(max_length=6)
    otp_type = serializers.ChoiceField(choices=OTPVerification.OTP_TYPES)

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email.")
        return value

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data