from django.urls import path
from . import views

urlpatterns = [
    path("teacher/login/", views.teacher_login, name="teacher_login"),
    path("teacher/logout/", views.teacher_logout, name="teacher_logout"),

    path("students/", views.student_list_create, name="student_list_create"),
    path("students/<int:student_pk>/", views.student_detail, name="student_detail"),

    path("predict/", views.predict_math_score, name="predict_math_score"),
    path("upload-csv/", views.upload_students_csv, name="upload_students_csv"),
    path("analytics/", views.class_analytics, name="class_analytics"),
]