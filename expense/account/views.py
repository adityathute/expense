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
    user_id = request.user.get('sub')  # Get the `sub` identifier from the user data
    print(user_id)
    # Get the access token from cookies (if available)
    access_token = request.COOKIES.get('access_token')

    if not access_token:
        print("No access token found in cookies.")
        return redirect('index')  # If no token is found, just log out locally.

    # URL for the auth server logout endpoint
    auth_logout_url = settings.AUTH_SERVER_URL + '/auth/o/logout/'  # Replace with actual URL

    # Send POST request to the auth server to log out the user and invalidate the token
    try:
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.post(auth_logout_url, data={'user_id': user_id}, headers=headers)
        print('response', response)
        # Check if the request was successful
        if response.status_code == 200:
            print("Successfully logged out from auth server.")
        else:
            print(f"Error logging out from auth server: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with auth server: {e}")

    # Now, delete the access token cookie
    response = redirect('index')  # Or redirect to your desired page after logout
    response.delete_cookie('access_token')

    # Log out the user locally
    logout(request)

    return response