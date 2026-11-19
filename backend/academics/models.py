from django.db import models
from django.contrib.auth.models import User


class TeacherProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="teacher_profile"
    )
    department = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return self.user.username


class Student(models.Model):
    student_id = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=150)
    email = models.EmailField(blank=True)
    class_name = models.CharField(max_length=50)
    section = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    race_ethnicity = models.CharField(max_length=50, default="group C", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student_id} - {self.name}"


class AcademicRecord(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="academic_records"
    )

    math_score = models.PositiveSmallIntegerField(null=True, blank=True)
    reading_score = models.PositiveSmallIntegerField()
    writing_score = models.PositiveSmallIntegerField()

    parental_education = models.CharField(max_length=100, blank=True)
    lunch = models.CharField(max_length=50, blank=True)
    test_preparation = models.CharField(max_length=50, blank=True)

    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.name} - {self.created_at.date()}"


class Prediction(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="predictions"
    )

    academic_record = models.ForeignKey(
        AcademicRecord,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    predicted_math_score = models.FloatField()
    support_category = models.CharField(max_length=50, blank=True)
    model_name = models.CharField(max_length=100, default="Student Math Pipeline")
    input_data = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.name} - {self.predicted_math_score}"


class TeacherActivity(models.Model):
    teacher = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    action = models.CharField(max_length=200)
    details = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.action


class TeacherSession(models.Model):
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="academic_sessions"
    )
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return self.teacher.username