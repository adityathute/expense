# account/middleware.py
from account.userinfo import get_userinfo

class TokenUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Get the token from the cookie
        access_token = request.COOKIES.get('access_token')

        if access_token:
            # Use the access token to fetch user info
            user = get_userinfo(access_token)  # Replace with your logic to get user info
            if user:
                request.user = user  # Assign the user to the request object
            else:
                request.user = None  # No valid user, so set to None
        else:
            request.user = None  # No token found, so set to None

        # Continue processing the request
        response = self.get_response(request)
        return response
