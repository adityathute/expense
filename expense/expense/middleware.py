# account/middleware.py

class TokenUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = request.session.get('user')
        if user:
            request.user = user
        else:
            request.user = None
        response = self.get_response(request)
        return response
