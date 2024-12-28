# www-backend/account/views.py

import requests
from decouple import config

def get_userinfo(access_token):
    userinfo_url = f"{config('AUTH_SERVER_URL')}/openid/userinfo"
    headers = {'Authorization': f'Bearer {access_token}'}
    response = requests.get(userinfo_url, headers=headers)
    if response.status_code == 200:
        return response.json()
    return None
