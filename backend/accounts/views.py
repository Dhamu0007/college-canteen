from django.conf import settings
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, AdminProfile, CustomerProfile, OTPVerification
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer, TokenSerializer,
    AdminProfileSerializer, CustomerProfileSerializer,
    OTPRequestSerializer, OTPVerifySerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer
)
from .utils import create_otp, verify_otp, send_otp_email
import re

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Registration successful.',
                'user': UserSerializer(user, context={'request': request}).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        
        errors = []
        for field, error_list in serializer.errors.items():
            msg = ', '.join(error_list) if isinstance(error_list, list) else str(error_list)
            errors.append(f"{field}: {msg}")
        return Response({'error': ' | '.join(errors)}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user, context={'request': request}).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            })
        
        errors = []
        for field, error_list in serializer.errors.items():
            msg = ', '.join(error_list) if isinstance(error_list, list) else str(error_list)
            errors.append(f"{field}: {msg}")
        return Response({'error': ' | '.join(errors)}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class RefreshTokenView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token is required.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            refresh = RefreshToken(refresh_token)
            return Response({
                'access': str(refresh.access_token),
            })
        except Exception as e:
            return Response({'error': 'Invalid refresh token.'}, 
                          status=status.HTTP_401_UNAUTHORIZED)

class OTPRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data.get('phone_number')
            email = serializer.validated_data.get('email')
            otp_type = serializer.validated_data['otp_type']
            
            # Find user
            user = None
            if phone_number:
                user = User.objects.filter(phone_number=phone_number).first()
            elif email:
                user = User.objects.filter(email=email).first()
            
            # For reset_password or login, user must exist. For phone/email signup verification, user can be None.
            if not user and otp_type in ['login', 'reset_password']:
                return Response({'error': 'No account found with these details.'},
                              status=status.HTTP_404_NOT_FOUND)
            
            # Create and send OTP
            otp_obj = create_otp(user, otp_type, phone_number, email)
            
            response_data = {
                'message': f'OTP sent successfully to {phone_number or email}.',
                'expires_at': otp_obj.expires_at
            }
            
            # In development / when SMS provider is not configured, provide dev_otp for easy testing
            twilio_configured = getattr(settings, 'TWILIO_ACCOUNT_SID', '') and not getattr(settings, 'TWILIO_ACCOUNT_SID', '').startswith('your-')
            if settings.DEBUG or not twilio_configured:
                response_data['dev_otp'] = otp_obj.otp
                response_data['message'] = f'OTP generated! (Dev OTP: {otp_obj.otp})'

            return Response(response_data)
        
        errors = []
        for field, error_list in serializer.errors.items():
            msg = ', '.join(error_list) if isinstance(error_list, list) else str(error_list)
            errors.append(f"{field}: {msg}")
        return Response({'error': ' | '.join(errors)}, status=status.HTTP_400_BAD_REQUEST)

class OTPVerifyView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            phone_number = serializer.validated_data.get('phone_number')
            email = serializer.validated_data.get('email')
            otp = serializer.validated_data['otp']
            otp_type = serializer.validated_data['otp_type']
            
            # Find user if exists
            user = None
            if phone_number:
                user = User.objects.filter(phone_number=phone_number).first()
            elif email:
                user = User.objects.filter(email=email).first()
            
            # Verify OTP
            result = verify_otp(user, otp_type, otp, phone_number, email)
            
            if result['success']:
                return Response({'message': result['message']})
            else:
                return Response({'error': result['message']},
                              status=status.HTTP_400_BAD_REQUEST)
        
        errors = []
        for field, error_list in serializer.errors.items():
            msg = ', '.join(error_list) if isinstance(error_list, list) else str(error_list)
            errors.append(f"{field}: {msg}")
        return Response({'error': ' | '.join(errors)}, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)
            
            # Send OTP via email
            otp_obj = create_otp(user, 'reset_password', email=email)
            
            return Response({
                'message': 'OTP sent to your email for password reset.',
                'expires_at': otp_obj.expires_at
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            new_password = serializer.validated_data['new_password']
            
            try:
                user = User.objects.get(email=email)
                result = verify_otp(user, 'reset_password', otp, email=email)
                
                if result['success']:
                    user.set_password(new_password)
                    user.save()
                    return Response({'message': 'Password reset successfully.'})
                else:
                    return Response({'error': result['message']},
                                  status=status.HTTP_400_BAD_REQUEST)
                    
            except User.DoesNotExist:
                return Response({'error': 'User not found.'},
                              status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.user_type != 'admin' and not request.user.is_superuser:
            return Response({'error': 'Access denied.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        profile, _ = AdminProfile.objects.get_or_create(
            user=request.user,
            defaults={
                'full_name': request.user.username,
                'email': request.user.email,
                'phone_number': request.user.phone_number or ''
            }
        )
        serializer = AdminProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)
    
    def put(self, request):
        if request.user.user_type != 'admin' and not request.user.is_superuser:
            return Response({'error': 'Access denied.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        profile, _ = AdminProfile.objects.get_or_create(
            user=request.user,
            defaults={
                'full_name': request.user.username,
                'email': request.user.email,
                'phone_number': request.user.phone_number or ''
            }
        )
        
        data = request.data.dict() if hasattr(request.data, 'dict') else (request.data.copy() if hasattr(request.data, 'copy') else dict(request.data))
        if 'profile_picture' in request.FILES:
            data['profile_picture'] = request.FILES['profile_picture']

        # Check phone number uniqueness
        if 'phone_number' in data:
            phone_val = str(data['phone_number']).strip() if data['phone_number'] else ''
            if phone_val:
                existing_user = User.objects.exclude(pk=request.user.pk).filter(phone_number=phone_val).first()
                if existing_user:
                    return Response(
                        {'error': f'Mobile number "{phone_val}" is already registered to another account.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                data['phone_number'] = phone_val
            else:
                data['phone_number'] = ''

        # Check profile_picture handling
        if 'profile_picture' in data:
            pic_val = data['profile_picture']
            if not hasattr(pic_val, 'read'):
                if pic_val in ['', 'null', 'None', None]:
                    if profile.profile_picture:
                        profile.profile_picture.delete(save=False)
                        profile.profile_picture = None
                        profile.save()
                    if request.user.profile_picture:
                        request.user.profile_picture.delete(save=False)
                        request.user.profile_picture = None
                        request.user.save()
                del data['profile_picture']

        serializer = AdminProfileSerializer(profile, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            prof = serializer.save()
            user_updated = False
            if prof.profile_picture:
                request.user.profile_picture = prof.profile_picture.name
                user_updated = True
            if 'phone_number' in data:
                new_phone = data['phone_number'] or None
                if request.user.phone_number != new_phone:
                    request.user.phone_number = new_phone
                    user_updated = True
            if user_updated:
                request.user.save()
            return Response(AdminProfileSerializer(prof, context={'request': request}).data)
        
        errors = []
        for field, error_list in serializer.errors.items():
            msg = ', '.join([str(e) for e in error_list]) if isinstance(error_list, list) else str(error_list)
            errors.append(f"{field}: {msg}")
        return Response({'error': ' | '.join(errors)}, status=status.HTTP_400_BAD_REQUEST)

class CustomerProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.user_type != 'customer':
            return Response({'error': 'Access denied.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        profile, _ = CustomerProfile.objects.get_or_create(
            user=request.user,
            defaults={
                'full_name': request.user.username,
                'email': request.user.email,
                'phone_number': request.user.phone_number or '',
                'college_id': getattr(request.user, 'college_id', '') or ''
            }
        )
        serializer = CustomerProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)
    
    def put(self, request):
        if request.user.user_type != 'customer':
            return Response({'error': 'Access denied.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        profile, _ = CustomerProfile.objects.get_or_create(
            user=request.user,
            defaults={
                'full_name': request.user.username,
                'email': request.user.email,
                'phone_number': request.user.phone_number or '',
                'college_id': getattr(request.user, 'college_id', '') or ''
            }
        )

        data = request.data.dict() if hasattr(request.data, 'dict') else (request.data.copy() if hasattr(request.data, 'copy') else dict(request.data))
        if 'profile_picture' in request.FILES:
            data['profile_picture'] = request.FILES['profile_picture']

        # Check phone number uniqueness
        if 'phone_number' in data:
            phone_val = str(data['phone_number']).strip() if data['phone_number'] else ''
            if phone_val:
                existing_user = User.objects.exclude(pk=request.user.pk).filter(phone_number=phone_val).first()
                if existing_user:
                    return Response(
                        {'error': f'Mobile number "{phone_val}" is already registered to another account.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                data['phone_number'] = phone_val
            else:
                data['phone_number'] = ''

        # Check profile_picture handling
        if 'profile_picture' in data:
            pic_val = data['profile_picture']
            if not hasattr(pic_val, 'read'):
                if pic_val in ['', 'null', 'None', None]:
                    if profile.profile_picture:
                        profile.profile_picture.delete(save=False)
                        profile.profile_picture = None
                        profile.save()
                    if request.user.profile_picture:
                        request.user.profile_picture.delete(save=False)
                        request.user.profile_picture = None
                        request.user.save()
                del data['profile_picture']

        serializer = CustomerProfileSerializer(profile, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            prof = serializer.save()
            user_updated = False
            if prof.profile_picture:
                request.user.profile_picture = prof.profile_picture.name
                user_updated = True
            if 'college_id' in data:
                new_cid = data['college_id'] or ''
                if request.user.college_id != new_cid:
                    request.user.college_id = new_cid
                    user_updated = True
            if 'phone_number' in data:
                new_phone = data['phone_number'] or None
                if request.user.phone_number != new_phone:
                    request.user.phone_number = new_phone
                    user_updated = True
            if user_updated:
                request.user.save()
            return Response(CustomerProfileSerializer(prof, context={'request': request}).data)
        
        errors = []
        for field, error_list in serializer.errors.items():
            msg = ', '.join([str(e) for e in error_list]) if isinstance(error_list, list) else str(error_list)
            errors.append(f"{field}: {msg}")
        return Response({'error': ' | '.join(errors)}, status=status.HTTP_400_BAD_REQUEST)

class CustomerListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'admin' and not request.user.is_staff and not request.user.is_superuser:
            return Response({'error': 'Access denied.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        customers = CustomerProfile.objects.select_related('user').all().order_by('-created_at')
        serializer = CustomerProfileSerializer(customers, many=True)
        return Response(serializer.data)

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        
        if not old_password or not new_password or not confirm_password:
            return Response({'error': 'All fields are required.'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        if new_password != confirm_password:
            return Response({'error': 'Passwords do not match.'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        if not request.user.check_password(old_password):
            return Response({'error': 'Old password is incorrect.'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            validate_password(new_password, request.user)
        except ValidationError as e:
            return Response({'error': e.messages}, status=status.HTTP_400_BAD_REQUEST)
        
        request.user.set_password(new_password)
        request.user.save()
        
        return Response({'message': 'Password changed successfully.'})

class FirebaseVerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('firebase_id_token')
        phone_number = request.data.get('phone_number')

        if not token:
            return Response({'error': 'Firebase ID token is required.'},
                          status=status.HTTP_400_BAD_REQUEST)

        verified_phone = None
        try:
            import os
            import firebase_admin
            from firebase_admin import auth as firebase_auth, credentials
            from django.conf import settings

            if not firebase_admin._apps:
                cred_path = getattr(settings, 'FIREBASE_SERVICE_ACCOUNT_KEY', '')
                if cred_path and os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                else:
                    firebase_admin.initialize_app()

            decoded_token = firebase_auth.verify_id_token(token)
            verified_phone = decoded_token.get('phone_number')
        except Exception as e:
            from django.conf import settings
            if settings.DEBUG:
                verified_phone = phone_number
            else:
                return Response({'error': f'Firebase token verification failed: {str(e)}'},
                              status=status.HTTP_400_BAD_REQUEST)

        target_phone = verified_phone or phone_number
        if not target_phone:
            return Response({'error': 'Phone number could not be resolved.'},
                          status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(phone_number=target_phone).first()
        if user:
            user.is_verified = True
            user.save()
            if hasattr(user, 'customer_profile'):
                user.customer_profile.is_phone_verified = True
                user.customer_profile.save()

        return Response({
            'message': 'Firebase OTP verified successfully.',
            'phone_number': target_phone,
            'is_verified': True
        })