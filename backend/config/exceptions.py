from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler for Django REST Framework to ensure uniform JSON responses.
    """
    response = exception_handler(exc, context)

    if response is not None:
        customized_response = {}
        customized_response['status_code'] = response.status_code
        
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                customized_response['error'] = response.data['detail']
            else:
                # Handle serializer field errors
                errors = []
                for field, error_list in response.data.items():
                    if isinstance(error_list, list):
                        errors.append(f"{field}: {', '.join(error_list)}")
                    else:
                        errors.append(f"{field}: {error_list}")
                customized_response['error'] = ' | '.join(errors)
                customized_response['details'] = response.data
        elif isinstance(response.data, list):
            customized_response['error'] = ' '.join(response.data)
        else:
            customized_response['error'] = str(response.data)
            
        response.data = customized_response
    else:
        logger.error(f"Unhandled exception in API view: {exc}", exc_info=True)
        from django.conf import settings
        err_msg = str(exc) if getattr(settings, 'DEBUG', False) else 'Internal server error occurred. Please try again later.'
        response = Response(
            {'status_code': 500, 'error': err_msg},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response
