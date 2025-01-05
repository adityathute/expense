# account/views.py

# 📦 Import necessary modules, classes and functions
import requests
from django.shortcuts import redirect
from django.conf import settings
from django.http import HttpResponse
from django.contrib.auth import logout
from account.userinfo import get_userinfo

# View to redirect user to the OIDC authorization endpoint for login
def login_view(request):
    # Extract necessary data from settings
    authorization_url = settings.OIDC_PROVIDER['authorization_endpoint']
    client_id = settings.OIDC_PROVIDER['client_id']
    redirect_uri = settings.OIDC_PROVIDER['redirect_uri']
    scopes = settings.OIDC_PROVIDER['scopes']
    # Construct the authorization URL with required parameters
    auth_url = f"{authorization_url}?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}&scope={scopes}"
    return redirect(auth_url)

# View to handle OIDC authorization code and exchange it for access token
def authorize_view(request):
    # Get authorization code from the request
    code = request.GET.get('code')
    if not code:
        return HttpResponse('Missing authorization code', status=400)

    # Extract necessary data from settings
    token_url = settings.OIDC_PROVIDER['token_endpoint']
    client_id = settings.OIDC_PROVIDER['client_id']
    client_secret = settings.OIDC_PROVIDER['client_secret']
    redirect_uri = settings.OIDC_PROVIDER['redirect_uri']

    # Prepare token request data
    token_data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect_uri,
        'client_id': client_id,
        'client_secret': client_secret,
    }

    try:
        # Request access token from the token endpoint
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()  # Raise an exception for HTTP errors

        # Parse token response JSON
        token_json = token_response.json()
        access_token = token_json.get('access_token')
        if not access_token:
            return HttpResponse('Access token not found in the response', status=400)

        # Get user info and store access token in session
        if access_token:
            # Create a response object
            response = redirect('index')  # Redirect to homepage or protected page

            # Set the access token in the cookie
            response.set_cookie(
                'access_token',           # Cookie name
                access_token,             # Cookie value (the access token)
                max_age=3600,             # Expiry in seconds (e.g., 1 hour)
                httponly=True,            # Ensures the cookie is inaccessible to JavaScript (mitigates XSS)
                secure=True,              # Ensures the cookie is only sent over HTTPS (for production)
                samesite='Lax'            # Helps prevent CSRF attacks
            )

            return response
        return HttpResponse('Authentication failed', status=401)

    except requests.exceptions.HTTPError as http_err:
        return HttpResponse('Failed to fetch token: HTTP error', status=500)

    except requests.exceptions.JSONDecodeError as json_err:
        return HttpResponse('Failed to fetch token: Invalid response format', status=500)

    except Exception as e:
        return HttpResponse('An unexpected error occurred', status=500)

# View to handle user logout
def logout_view(request):
    # Delete the access token cookie
    response = redirect('index')  # Or redirect to login page

    # Delete the access token from the cookies
    response.delete_cookie('access_token')

    # Optionally, clear session data if used (not necessary if you only use cookies)
    # request.session.flush()

    # Perform Django's default logout functionality (if using sessions too)
    logout(request)

    return response