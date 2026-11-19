
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # Existing student, chatbot and quiz APIs
    path("api/auth/", include("authentication.urls")),

    # New teacher and academic APIs
    path("api/academics/", include("academics.urls")),
]
