import csv
import io
import json
import secrets
from datetime import timedelta
from pathlib import Path

import joblib
import pandas as pd
from django.conf import settings
from django.contrib.auth import authenticate
from django.db.models import Avg, Count
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from .models import (
    TeacherSession,
    Student,
    AcademicRecord,
    Prediction,
    TeacherActivity,
)

MODEL_PATH = Path(settings.BASE_DIR) / "ml_models" / "student_math_pipeline.joblib"
_math_pipeline = None


def get_math_pipeline():
    global _math_pipeline
    if _math_pipeline is None and MODEL_PATH.exists():
        _math_pipeline = joblib.load(MODEL_PATH)
    return _math_pipeline


def classify_support(avg_score):
    if avg_score < 40:
        return "Immediate Support Needed"
    if avg_score < 60:
        return "Needs Improvement"
    if avg_score < 80:
        return "Satisfactory"
    return "Strong Performance"


def run_math_prediction(features: dict) -> float:
    pipeline = get_math_pipeline()
    if pipeline is None:
        raise RuntimeError(f"ML model not found at {MODEL_PATH}")

    row = pd.DataFrame([{
        "gender": features["gender"],
        "race/ethnicity": features["race_ethnicity"],
        "parental level of education": features["parental_education"],
        "lunch": features["lunch"],
        "test preparation course": features["test_preparation"],
        "reading score": float(features["reading_score"]),
        "writing score": float(features["writing_score"]),
    }])
    pred = float(pipeline.predict(row)[0])
    return round(max(0.0, min(100.0, pred)), 2)


def get_teacher(request):
    """Validate the teacher's API token."""
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Token "):
        return None

    token = auth_header.split(" ", 1)[1].strip()

    try:
        session = TeacherSession.objects.select_related(
            "teacher"
        ).get(token=token)

        if session.expires_at <= timezone.now():
            session.delete()
            return None

        teacher = session.teacher

        if not (teacher.is_staff or hasattr(teacher, "teacher_profile")):
            return None

        return teacher

    except TeacherSession.DoesNotExist:
        return None


@csrf_exempt
def teacher_login(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    try:
        data = json.loads(request.body)

        username = data.get("username", "").strip()
        password = data.get("password", "")

        if not username or not password:
            return JsonResponse(
                {"error": "Username and password are required"},
                status=400
            )

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is None or not (
            user.is_staff or hasattr(user, "teacher_profile")
        ):
            return JsonResponse(
                {"error": "Invalid teacher credentials"},
                status=401
            )

        token = secrets.token_hex(32)

        TeacherSession.objects.create(
            teacher=user,
            token=token,
            expires_at=timezone.now() + timedelta(hours=12)
        )

        return JsonResponse({
            "message": "Teacher login successful",
            "token": token,
            "teacher": {
                "id": user.id,
                "username": user.username,
                "name": user.get_full_name() or user.username
            }
        })

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)


@csrf_exempt
def teacher_logout(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Token "):
        return JsonResponse({"error": "Authentication required"}, status=401)

    token = auth_header.split(" ", 1)[1].strip()

    deleted, _ = TeacherSession.objects.filter(token=token).delete()

    if not deleted:
        return JsonResponse({"error": "Invalid session"}, status=401)

    return JsonResponse({"message": "Logged out successfully"})


@csrf_exempt
def student_list_create(request):
    teacher = get_teacher(request)

    if not teacher:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    if request.method == "GET":
        students = Student.objects.all().order_by("-created_at")

        results = [{
            "id": student.id,
            "student_id": student.student_id,
            "name": student.name,
            "email": student.email,
            "class_name": student.class_name,
            "section": student.section,
            "gender": student.gender,
            "race_ethnicity": student.race_ethnicity,
        } for student in students]

        return JsonResponse({"students": results})

    if request.method == "POST":
        try:
            data = json.loads(request.body)

            student_id = data.get("student_id", "").strip()
            name = data.get("name", "").strip()
            class_name = data.get("class_name", "").strip()

            if not student_id or not name or not class_name:
                return JsonResponse({
                    "error": "Student ID, name and class are required"
                }, status=400)

            if Student.objects.filter(student_id=student_id).exists():
                return JsonResponse({
                    "error": "Student ID already exists"
                }, status=409)

            student = Student.objects.create(
                student_id=student_id,
                name=name,
                email=data.get("email", "").strip(),
                class_name=class_name,
                section=data.get("section", "").strip(),
                gender=data.get("gender", "").strip(),
                race_ethnicity=data.get("race_ethnicity", "group C").strip() or "group C",
            )

            TeacherActivity.objects.create(
                teacher=teacher,
                action="Student created",
                details=f"Created student {student.student_id}"
            )

            return JsonResponse({
                "message": "Student created successfully",
                "student_id": student.student_id
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def student_detail(request, student_pk):
    teacher = get_teacher(request)

    if not teacher:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    try:
        student = Student.objects.get(pk=student_pk)
    except Student.DoesNotExist:
        return JsonResponse({"error": "Student not found"}, status=404)

    if request.method == "GET":
        return JsonResponse({
            "id": student.id,
            "student_id": student.student_id,
            "name": student.name,
            "email": student.email,
            "class_name": student.class_name,
            "section": student.section,
            "gender": student.gender,
            "race_ethnicity": student.race_ethnicity,
        })

    if request.method == "PUT":
        try:
            data = json.loads(request.body)

            student.name = data.get("name", student.name).strip()
            student.email = data.get("email", student.email).strip()
            student.class_name = data.get(
                "class_name", student.class_name
            ).strip()
            student.section = data.get(
                "section", student.section
            ).strip()
            student.gender = data.get(
                "gender", student.gender
            ).strip()
            student.race_ethnicity = data.get(
                "race_ethnicity", student.race_ethnicity
            ).strip()

            student.save()

            TeacherActivity.objects.create(
                teacher=teacher,
                action="Student updated",
                details=f"Updated student {student.student_id}"
            )

            return JsonResponse({"message": "Student updated successfully"})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    if request.method == "DELETE":
        student.delete()

        TeacherActivity.objects.create(
            teacher=teacher,
            action="Student deleted",
            details=f"Deleted student {student.student_id}"
        )

        return JsonResponse({"message": "Student deleted successfully"})

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def predict_math_score(request):
    teacher = get_teacher(request)
    if not teacher:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    try:
        data = json.loads(request.body)
        reading = float(data.get("reading_score"))
        writing = float(data.get("writing_score"))

        if not (0 <= reading <= 100 and 0 <= writing <= 100):
            return JsonResponse({"error": "Scores must be between 0 and 100"}, status=400)

        features = {
            "gender": data.get("gender", "female").strip().lower(),
            "race_ethnicity": data.get("race_ethnicity", "group C").strip(),
            "parental_education": data.get("parental_education", "some college").strip().lower(),
            "lunch": data.get("lunch", "standard").strip().lower(),
            "test_preparation": data.get("test_preparation", "none").strip().lower(),
            "reading_score": reading,
            "writing_score": writing,
        }

        predicted_math = run_math_prediction(features)
        avg_score = round((predicted_math + reading + writing) / 3.0, 2)
        support_category = classify_support(avg_score)

        student_id = data.get("student_id", "").strip()
        saved_prediction_id = None
        if student_id:
            student = Student.objects.filter(student_id=student_id).first()
            if student:
                pred_obj = Prediction.objects.create(
                    student=student,
                    predicted_math_score=predicted_math,
                    support_category=support_category,
                    input_data=features,
                )
                saved_prediction_id = pred_obj.id
                TeacherActivity.objects.create(
                    teacher=teacher,
                    action="Prediction generated",
                    details=f"Predicted Math {predicted_math} for {student.student_id}",
                )

        return JsonResponse({
            "predicted_math_score": predicted_math,
            "estimated_average": avg_score,
            "support_category": support_category,
            "prediction_id": saved_prediction_id,
            "disclaimer": "Advisory ML estimate only; use alongside teacher assessment.",
        })
    except (TypeError, ValueError):
        return JsonResponse({"error": "Invalid numeric scores provided"}, status=400)
    except Exception as exc:
        return JsonResponse({"error": str(exc)}, status=500)


import re

# ---------------------------------------------------------------------------
# Column-mapping helpers for dynamic CSV upload
# ---------------------------------------------------------------------------

def _clean_header(h: str) -> str:
    """Normalize header by lowercasing and stripping non-alphanumeric characters."""
    return re.sub(r"[^a-z0-9]", "", str(h).strip().lower())

# Canonical fields prioritized in matching order (specific multi-word fields first)
_CANONICAL_FIELD_KEYWORDS = [
    ("test_preparation", ["testpreparationcourse", "testpreparation", "testprep", "preparation", "prep"]),
    ("parental_education", ["parentallevelofeducation", "parentaleducation", "parenteducation", "education"]),
    ("race_ethnicity", ["raceethnicity", "ethnicity", "race", "socialgroup"]),
    ("reading_score", ["readingscore", "reading", "read", "readscore", "verbalscore", "englishscore"]),
    ("writing_score", ["writingscore", "writing", "write", "writescore", "essay", "languagescore"]),
    ("math_score", ["mathscore", "math", "maths", "mathematics", "mathsscore", "quant", "quantscore"]),
    ("student_id", ["studentid", "id", "roll", "rollno", "rollnumber", "enrollment", "regno", "registrationno"]),
    ("name", ["studentname", "fullname", "firstname", "candidatename", "name"]),
    ("class_name", ["classname", "class", "batch", "program", "grade", "standard", "dept", "department", "course"]),
    ("email", ["email", "emailid", "mail", "emailaddress"]),
    ("section", ["section", "sec", "div", "division", "groupsection"]),
    ("gender", ["gender", "sex"]),
    ("lunch", ["lunch", "lunchtype", "mealplan", "meal"]),
]

# Generic fallback score aliases if reading/writing aren't explicitly named
_GENERIC_SCORE_KEYWORDS = ["score", "marks", "total", "percentage", "points", "grade"]


def _build_column_map(csv_headers):
    """Return (field_map, detected, unmapped, auto_generated).
    * field_map      – dict[canonical_field] -> original CSV header string
    * detected       – same mapping, for the JSON response
    * unmapped       – list of CSV headers that did not match any field
    * auto_generated – list of canonical fields that have no CSV column
    """
    clean_to_orig = {}
    for h in csv_headers:
        cleaned = _clean_header(h)
        if cleaned:
            clean_to_orig[cleaned] = h

    field_map = {}
    detected = {}
    matched_cleaned = set()

    # Pass 1: Exact normalized matches first
    for canonical, keywords in _CANONICAL_FIELD_KEYWORDS:
        for kw in keywords:
            if kw in clean_to_orig and clean_to_orig[kw] not in field_map.values():
                orig_header = clean_to_orig[kw]
                field_map[canonical] = orig_header
                detected[canonical] = orig_header
                matched_cleaned.add(kw)
                break

    # Pass 2: Substring matches for remaining fields
    for canonical, keywords in _CANONICAL_FIELD_KEYWORDS:
        if canonical in field_map:
            continue
        for kw in keywords:
            for cleaned, orig_header in clean_to_orig.items():
                if cleaned not in matched_cleaned:
                    # Avoid false positive matching of 'course' inside 'testpreparationcourse'
                    if canonical == "class_name" and ("test" in cleaned or "prep" in cleaned):
                        continue
                    if len(kw) >= 4 and (kw in cleaned or cleaned in kw):
                        field_map[canonical] = orig_header
                        detected[canonical] = orig_header
                        matched_cleaned.add(cleaned)
                        break
            if canonical in field_map:
                break

    # If reading or writing scores not detected, search for generic score columns
    if "reading_score" not in field_map:
        for gen_kw in _GENERIC_SCORE_KEYWORDS:
            for cleaned, orig_header in clean_to_orig.items():
                if cleaned not in matched_cleaned and gen_kw in cleaned:
                    field_map["reading_score"] = orig_header
                    detected["reading_score"] = f"{orig_header} (inferred)"
                    matched_cleaned.add(cleaned)
                    break
            if "reading_score" in field_map:
                break

    if "writing_score" not in field_map:
        for gen_kw in _GENERIC_SCORE_KEYWORDS:
            for cleaned, orig_header in clean_to_orig.items():
                if cleaned not in matched_cleaned and gen_kw in cleaned:
                    field_map["writing_score"] = orig_header
                    detected["writing_score"] = f"{orig_header} (inferred)"
                    matched_cleaned.add(cleaned)
                    break
            if "writing_score" in field_map:
                break

    unmapped = [h for h in csv_headers if _clean_header(h) not in matched_cleaned]
    auto_generated = [f for f in ["student_id", "name", "class_name", "reading_score", "writing_score"] if f not in field_map]

    return field_map, detected, unmapped, auto_generated


def _safe_int_score(value, default=0):
    """Try to parse *value* as a numeric score; return *default* on failure."""
    if value is None or str(value).strip() == "":
        return default
    try:
        return int(float(value))
    except (ValueError, TypeError):
        return default


@csrf_exempt
def upload_students_csv(request):
    teacher = get_teacher(request)
    if not teacher:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)

    csv_file = request.FILES.get("file")
    if not csv_file:
        return JsonResponse({"error": "CSV file is required under field 'file'"}, status=400)

    try:
        decoded = csv_file.read().decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(decoded))

        if not reader.fieldnames:
            return JsonResponse({"error": "CSV file is empty or has no headers"}, status=400)

        # --- dynamic column mapping ---
        field_map, detected_columns, unmapped_columns, auto_generated = _build_column_map(
            reader.fieldnames
        )

        created_count = 0
        updated_count = 0
        errors = []

        for idx, raw_row in enumerate(reader, start=2):
            # Build a lookup by original header → value
            row_by_header = {k: (v or "").strip() for k, v in raw_row.items() if k}

            # Helper: get a value using the canonical field name
            def _val(field, default=""):
                hdr = field_map.get(field)
                if hdr is not None:
                    v = row_by_header.get(hdr, "").strip()
                    if v != "":
                        return v
                return default

            # --- student_id ---
            sid = _val("student_id", "")
            if not sid:
                sid = f"STU-{idx - 1:04d}"

            # --- name ---
            name = _val("name", "")
            if not name:
                name = f"Student {idx - 1}"

            # --- class_name ---
            class_name = _val("class_name", "Unassigned")

            # --- scores ---
            reading_raw = _val("reading_score", "")
            writing_raw = _val("writing_score", "")
            math_raw = _val("math_score", "")
            math_val = _safe_int_score(math_raw, None) if math_raw != "" else None

            # If reading/writing omitted, gracefully fallback to math_val or 50
            default_score = math_val if math_val is not None else 50
            reading = _safe_int_score(reading_raw, default_score) if reading_raw != "" else default_score
            writing = _safe_int_score(writing_raw, default_score) if writing_raw != "" else default_score

            # Clamp scores 0-100 (lenient – don't reject the row)
            for score in [s for s in (math_val, reading, writing) if s is not None]:
                if not (0 <= score <= 100):
                    errors.append(f"Row {idx} ({sid}): score out of 0-100 range, clamped")
                    break
            reading = max(0, min(100, reading))
            writing = max(0, min(100, writing))
            if math_val is not None:
                math_val = max(0, min(100, math_val))

            # --- other fields with defaults ---
            gender = (_val("gender", "female").lower()) or "female"
            race = _val("race_ethnicity", "group C") or "group C"
            parental = (_val("parental_education", "some college").lower()) or "some college"
            lunch = (_val("lunch", "standard").lower()) or "standard"
            prep = (_val("test_preparation", "none").lower()) or "none"
            email = _val("email", "")
            section = _val("section", "")

            student, created = Student.objects.update_or_create(
                student_id=sid,
                defaults={
                    "name": name,
                    "email": email,
                    "class_name": class_name,
                    "section": section,
                    "gender": gender,
                    "race_ethnicity": race,
                },
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

            record = AcademicRecord.objects.create(
                student=student,
                math_score=math_val,
                reading_score=reading,
                writing_score=writing,
                parental_education=parental,
                lunch=lunch,
                test_preparation=prep,
                recorded_by=teacher,
            )

            pred_math = run_math_prediction({
                "gender": gender,
                "race_ethnicity": race,
                "parental_education": parental,
                "lunch": lunch,
                "test_preparation": prep,
                "reading_score": reading,
                "writing_score": writing,
            })
            effective_math = math_val if math_val is not None else pred_math
            avg_score = round((effective_math + reading + writing) / 3.0, 2)

            Prediction.objects.create(
                student=student,
                academic_record=record,
                predicted_math_score=pred_math,
                support_category=classify_support(avg_score),
                input_data={
                    "gender": gender,
                    "race_ethnicity": race,
                    "parental_education": parental,
                    "lunch": lunch,
                    "test_preparation": prep,
                    "reading_score": reading,
                    "writing_score": writing,
                },
            )

        TeacherActivity.objects.create(
            teacher=teacher,
            action="CSV Bulk Upload",
            details=f"Created {created_count}, updated {updated_count}, errors {len(errors)}",
        )

        return JsonResponse({
            "message": "CSV processed",
            "created": created_count,
            "updated": updated_count,
            "errors": errors,
            "detected_columns": detected_columns,
            "unmapped_columns": unmapped_columns,
            "auto_generated": auto_generated,
        })
    except Exception as exc:
        return JsonResponse({"error": f"Failed to parse CSV: {exc}"}, status=400)


@csrf_exempt
def class_analytics(request):
    teacher = get_teacher(request)
    if not teacher:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    total_students = Student.objects.count()
    agg = AcademicRecord.objects.aggregate(
        avg_math=Avg("math_score"),
        avg_reading=Avg("reading_score"),
        avg_writing=Avg("writing_score"),
    )

    bands = {
        "Immediate Support Needed": 0,
        "Needs Improvement": 0,
        "Satisfactory": 0,
        "Strong Performance": 0,
    }
    at_risk_students = []
    all_students = []

    for student in Student.objects.all().order_by("student_id"):
        latest_rec = student.academic_records.order_by("-created_at").first()
        latest_pred = student.predictions.order_by("-created_at").first()

        reading = latest_rec.reading_score if latest_rec else (latest_pred.input_data.get("reading_score", None) if latest_pred else None)
        writing = latest_rec.writing_score if latest_rec else (latest_pred.input_data.get("writing_score", None) if latest_pred else None)
        math_actual = latest_rec.math_score if latest_rec else None
        math_pred = latest_pred.predicted_math_score if latest_pred else None
        effective_math = math_actual if math_actual is not None else math_pred

        has_scores = any(s is not None for s in (effective_math, reading, writing))

        if has_scores:
            calc_m = effective_math if effective_math is not None else 0
            calc_r = reading if reading is not None else 0
            calc_w = writing if writing is not None else 0
            avg_score = round((calc_m + calc_r + calc_w) / 3.0, 2)
            band = classify_support(avg_score)
            bands[band] = bands.get(band, 0) + 1
        else:
            avg_score = 0.0
            band = "Unassessed"

        # Upgrade recommendation analysis
        if band == "Immediate Support Needed":
            next_tier = "Needs Improvement"
            target_score = 40.0
            gap = round(max(0.0, 40.0 - avg_score), 1)
            action = "1-on-1 Math coaching & remedial reading support"
        elif band == "Needs Improvement":
            next_tier = "Satisfactory"
            target_score = 60.0
            gap = round(max(0.0, 60.0 - avg_score), 1)
            action = "Targeted practice worksheets & weekly mock quizzes"
        elif band == "Satisfactory":
            next_tier = "Strong Performance"
            target_score = 80.0
            gap = round(max(0.0, 80.0 - avg_score), 1)
            action = "Advanced problem sets & project-based enrichment"
        elif band == "Strong Performance":
            next_tier = "Honors Tier"
            target_score = 100.0
            gap = round(max(0.0, 100.0 - avg_score), 1)
            action = "Peer mentoring & competitive academic projects"
        else:
            next_tier = "Assessment Pending"
            target_score = 60.0
            gap = 0.0
            action = "Upload assessment or run prediction"

        student_entry = {
            "id": student.id,
            "student_id": student.student_id,
            "name": student.name,
            "email": student.email,
            "class_name": student.class_name,
            "section": student.section,
            "gender": student.gender,
            "race_ethnicity": student.race_ethnicity,
            "math_score": math_actual,
            "predicted_math_score": math_pred,
            "reading_score": reading,
            "writing_score": writing,
            "average_score": avg_score,
            "support_category": band,
            "upgrade": {
                "next_tier": next_tier,
                "target_score": target_score,
                "score_gap": gap,
                "action": action,
            },
        }

        all_students.append(student_entry)

        if has_scores and avg_score < 60:
            at_risk_students.append(student_entry)

    # --- gender distribution ---
    gender_qs = (
        Student.objects.values("gender")
        .annotate(count=Count("id"))
    )
    gender_distribution = {"male": 0, "female": 0, "other": 0}
    for entry in gender_qs:
        g = (entry["gender"] or "").strip().lower()
        if g == "male":
            gender_distribution["male"] += entry["count"]
        elif g == "female":
            gender_distribution["female"] += entry["count"]
        else:
            gender_distribution["other"] += entry["count"]

    # --- class distribution ---
    class_qs = (
        Student.objects.values("class_name")
        .annotate(count=Count("id"))
    )
    class_distribution = {entry["class_name"]: entry["count"] for entry in class_qs}

    # --- total predictions ---
    total_predictions = Prediction.objects.count()

    recent_activities = list(
        TeacherActivity.objects.order_by("-created_at")[:10].values(
            "id", "action", "details", "created_at"
        )
    )

    return JsonResponse({
        "total_students": total_students,
        "averages": {
            "math": round(agg["avg_math"] or 0, 2),
            "reading": round(agg["avg_reading"] or 0, 2),
            "writing": round(agg["avg_writing"] or 0, 2),
        },
        "performance_bands": bands,
        "at_risk_students": at_risk_students,
        "all_students": all_students,
        "gender_distribution": gender_distribution,
        "class_distribution": class_distribution,
        "total_predictions": total_predictions,
        "recent_activities": recent_activities,
    })
