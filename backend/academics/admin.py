
from django.contrib import admin
from .models import (
    TeacherProfile,
    Student,
    AcademicRecord,
    Prediction,
    TeacherActivity
)


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "department", "phone")


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = (
        "student_id",
        "name",
        "class_name",
        "section",
        "email"
    )
    search_fields = ("student_id", "name", "email")
    list_filter = ("class_name", "section", "gender")


@admin.register(AcademicRecord)
class AcademicRecordAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "math_score",
        "reading_score",
        "writing_score",
        "created_at"
    )
    search_fields = ("student__name", "student__student_id")


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "predicted_math_score",
        "model_name",
        "created_at"
    )


@admin.register(TeacherActivity)
class TeacherActivityAdmin(admin.ModelAdmin):
    list_display = ("teacher", "action", "created_at")
