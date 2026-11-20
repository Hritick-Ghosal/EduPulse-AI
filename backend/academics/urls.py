from django.urls import path
from django.http import JsonResponse
from . import views


def api_root(request):
    return JsonResponse({
        "service": "EduPulse AI — Academics API",
        "status": "online",
        "endpoints": {
            "teacher_login":  "/api/academics/teacher/login/",
            "teacher_logout": "/api/academics/teacher/logout/",
            "students":       "/api/academics/students/",
            "predict":        "/api/academics/predict/",
            "upload_csv":     "/api/academics/upload-csv/",
            "analytics":      "/api/academics/analytics/",
        }
    })


urlpatterns = [
    path("", api_root, name="api_root"),

    path("teacher/login/", views.teacher_login, name="teacher_login"),
    path("teacher/logout/", views.teacher_logout, name="teacher_logout"),

    path("students/", views.student_list_create, name="student_list_create"),
    path("students/<int:student_pk>/", views.student_detail, name="student_detail"),

    path("predict/", views.predict_math_score, name="predict_math_score"),
    path("upload-csv/", views.upload_students_csv, name="upload_students_csv"),
    path("analytics/", views.class_analytics, name="class_analytics"),
]