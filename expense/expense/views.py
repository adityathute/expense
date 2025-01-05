# 📁 Import necessary modules
from django.shortcuts import render
from account.userinfo import get_userinfo

def index(request):
    # Initialize default values
    full_name = "User"
    email = 'N/A'
    username = ''

    # Get user data from session
    user_data = request.session.get('user', {})
    # access_token = user_data.get('access_token')
    access_token = request.COOKIES.get('access_token')

    # Get all session data
    session_data = request.session.items()
        
    if access_token:
        userinfo = get_userinfo(access_token)
        if userinfo:
            # Extract user details
            first_name = userinfo.get('given_name', '')
            last_name = userinfo.get('family_name', '')
            username = userinfo.get('nickname', '')
            full_name = userinfo.get('name', '') or first_name or username or last_name

            # Optionally update email if available
            email = userinfo.get('email', 'N/A')

    # Pass user information to the template
    context = {
        'full_name': full_name,
        'email': email,
        'username': username,
    }
    
    return render(request, 'index.html', context)
