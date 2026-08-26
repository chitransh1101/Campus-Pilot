"""
Seeds the database with a large, varied dataset — enough to demo every
screen and every state a screen can be in (paid/partial/overdue fees,
low/medium/high risk students, pending/approved/rejected subject requests,
open/in-review/resolved grievances in every category, a waitlisted library
book, placement applications at every stage, etc.) rather than just enough
rows to prove the API works.

The original 8 demo accounts (and their passwords) are preserved exactly as
documented on the frontend's login screen — this only ADDS more on top, it
never removes or renames the accounts you already know how to log in with.

Run once after the tables exist:
    python seed.py
Safe to re-run — it skips seeding if any users already exist. To regenerate
from scratch, delete campuspilot.db first.
"""
import random
from datetime import datetime, timedelta

from app.database.db import Base, engine, SessionLocal
from app.models.models import (
    User, Course, SubjectRequest, Fee, AttendanceSession, AttendanceRecord,
    GradeRecord, GradeEntry, Assignment, StudyMaterial, ClassNotice,
    LeaveRequest, Grievance, AuditLogEntry, Notification, Placement,
    PlacementApplication, LibraryBook, LibraryRequest,
)
from app.auth.auth import hash_password

random.seed(42)  # reproducible — re-running against a fresh DB gives the same dataset

Base.metadata.create_all(bind=engine)
db = SessionLocal()

STUDENT_GRIEVANCE_CATEGORIES = ["Academic", "Hostel", "Fees & Finance", "Ragging / Harassment", "Infrastructure", "Other"]
TEACHER_GRIEVANCE_CATEGORIES = ["Academic / Curriculum", "Timetable & Workload", "Payroll & HR", "Infrastructure & Labs", "Harassment / Workplace Conduct", "Administrative Support", "Other"]


def days_ago(n):
    return datetime.utcnow() - timedelta(days=n)


try:
    if db.query(User).count() > 0:
        print("Database already has users — skipping seed. Delete campuspilot.db to reseed from scratch.")
    else:
        # ------------------------------------------------------------ Users
        admins = [
            User(name="Meera Iyer", email="admin@campuspilot.edu", password_hash=hash_password("admin123"),
                 role="admin", id_label="ADM-001", status="active"),
            User(name="Rakesh Verma", email="rakesh@campuspilot.edu", password_hash=hash_password("admin123"),
                 role="admin", id_label="ADM-002", status="active"),
        ]

        teachers = [
            User(name="Dr. Priya Sharma", email="priya@campuspilot.edu", password_hash=hash_password("teach123"),
                 role="teacher", id_label="STF-114", status="active", phone="+91 98200 11234",
                 department="Computer Science", designation="Associate Professor",
                 qualification="Ph.D. in Computer Science, IIT Delhi", joined="12 Jul 2018", office="Block B, Room 214",
                 bio="Teaches data structures & algorithms; research interests in graph theory and competitive programming pedagogy."),
            User(name="Prof. Arjun Kapoor", email="arjun@campuspilot.edu", password_hash=hash_password("teach123"),
                 role="teacher", id_label="STF-092", status="active", phone="+91 98450 88213",
                 department="Computer Science", designation="Assistant Professor",
                 qualification="M.Tech in Database Systems, IIT Bombay", joined="3 Jan 2021", office="Block B, Room 118",
                 bio="Handles database systems and networks labs; maintains the department's applied-DB research group."),
            User(name="Dr. Ritu Nair", email="ritu@campuspilot.edu", password_hash=hash_password("teach123"),
                 role="teacher", id_label="STF-058", status="active", phone="+91 99870 44521",
                 department="Mathematics", designation="Professor",
                 qualification="Ph.D. in Applied Mathematics, ISI Kolkata", joined="14 Aug 2012", office="Block A, Room 301",
                 bio="Teaches discrete mathematics, linear algebra and numerical methods across CS and Math cohorts."),
            User(name="Dr. Aditya Menon", email="aditya@campuspilot.edu", password_hash=hash_password("teach123"),
                 role="teacher", id_label="STF-133", status="active", phone="+91 97410 22890",
                 department="Computer Science", designation="Assistant Professor",
                 qualification="Ph.D. in Systems, IIT Madras", joined="21 Jun 2022", office="Block B, Room 220",
                 bio="Teaches operating systems; research interests in distributed systems and OS scheduling."),
            User(name="Dr. Vikram Rao", email="vikram@campuspilot.edu", password_hash=hash_password("teach123"),
                 role="teacher", id_label="STF-076", status="active", phone="+91 96540 77102",
                 department="Electronics & Communication", designation="Associate Professor",
                 qualification="Ph.D. in VLSI Design, IISc Bangalore", joined="9 Feb 2016", office="Block C, Room 112",
                 bio="Teaches digital electronics and signals & systems; runs the department's embedded systems lab."),
            User(name="Prof. Sneha Joshi", email="sneha@campuspilot.edu", password_hash=hash_password("teach123"),
                 role="teacher", id_label="STF-101", status="active", phone="+91 98110 33456",
                 department="Physics", designation="Assistant Professor",
                 qualification="M.Sc. in Physics, Delhi University; Ph.D. ongoing", joined="5 Jul 2023", office="Block A, Room 205",
                 bio="Teaches engineering physics for first-year students across all departments."),
        ]

        # (name, email, id_label, department, year, section)
        student_specs = [
            ("Rohan Mehta", "rohan@campuspilot.edu", "CS21B045", "Computer Science", 3, "A"),
            ("Ananya Rao", "ananya@campuspilot.edu", "CS21B012", "Computer Science", 3, "A"),
            ("Kabir Singh", "kabir@campuspilot.edu", "CS21B078", "Computer Science", 3, "B"),
            ("Diya Nair", "diya@campuspilot.edu", "CS21B033", "Computer Science", 3, "A"),
            ("Zoya Khan", "zoya@campuspilot.edu", "CS21B061", "Computer Science", 3, "B"),
            ("Arnav Gupta", "arnav@campuspilot.edu", "CS22B019", "Computer Science", 2, "A"),
            ("Ishita Verma", "ishita@campuspilot.edu", "CS22B027", "Computer Science", 2, "A"),
            ("Vivaan Joshi", "vivaan@campuspilot.edu", "CS22B054", "Computer Science", 2, "B"),
            ("Myra Kapoor", "myra@campuspilot.edu", "CS20B008", "Computer Science", 4, "A"),
            ("Aarav Malhotra", "aarav@campuspilot.edu", "CS20B071", "Computer Science", 4, "B"),
            ("Saanvi Reddy", "saanvi@campuspilot.edu", "CS23B003", "Computer Science", 1, "A"),
            ("Reyansh Iyer", "reyansh@campuspilot.edu", "CS23B041", "Computer Science", 1, "B"),
            ("Ananya Pillai", "apillai@campuspilot.edu", "MA21B014", "Mathematics", 3, "A"),
            ("Krishna Bhat", "krishna@campuspilot.edu", "MA22B022", "Mathematics", 2, "A"),
            ("Advika Menon", "advika@campuspilot.edu", "MA20B009", "Mathematics", 4, "A"),
            ("Vihaan Chatterjee", "vihaan@campuspilot.edu", "MA23B017", "Mathematics", 1, "A"),
            ("Riya Desai", "riya@campuspilot.edu", "EC21B028", "Electronics & Communication", 3, "A"),
            ("Aryan Kulkarni", "aryan@campuspilot.edu", "EC22B036", "Electronics & Communication", 2, "A"),
            ("Navya Sharma", "navya@campuspilot.edu", "EC20B015", "Electronics & Communication", 4, "A"),
            ("Dhruv Agarwal", "dhruv@campuspilot.edu", "EC23B052", "Electronics & Communication", 1, "A"),
            ("Kiara Bose", "kiara@campuspilot.edu", "PH21B006", "Physics", 3, "A"),
            ("Yuvraj Sinha", "yuvraj@campuspilot.edu", "PH22B011", "Physics", 2, "A"),
            ("Anika Trivedi", "anika@campuspilot.edu", "PH20B004", "Physics", 4, "A"),
            ("Rudra Nambiar", "rudra@campuspilot.edu", "PH23B009", "Physics", 1, "A"),
        ]
        students = [
            User(name=n, email=e, password_hash=hash_password("student123"), role="student",
                 id_label=idl, status="active")
            for (n, e, idl, dept, yr, sec) in student_specs
        ]
        # Deactivate one account on purpose, to demo the admin "reactivate" flow.
        students[-1].status = "inactive"

        db.add_all(admins + teachers + students)
        db.commit()
        for u in admins + teachers + students:
            db.refresh(u)

        teacher_by_name = {t.name: t for t in teachers}
        student_by_name = {s.name: s for s in students}
        student_dept = {n: dept for (n, e, idl, dept, yr, sec) in student_specs}

        # ---------------------------------------------------------- Courses
        course_specs = [
            ("CS301", "Data Structures", "Computer Science", "Dr. Priya Sharma"),
            ("CS315", "Database Systems", "Computer Science", "Prof. Arjun Kapoor"),
            ("CS410", "Operating Systems", "Computer Science", "Dr. Aditya Menon"),
            ("CS420", "Computer Networks", "Computer Science", "Prof. Arjun Kapoor"),
            ("MA201", "Discrete Mathematics", "Mathematics", "Dr. Ritu Nair"),
            ("MA305", "Linear Algebra", "Mathematics", "Dr. Ritu Nair"),
            ("MA410", "Numerical Methods", "Mathematics", "Dr. Ritu Nair"),
            ("EC220", "Digital Electronics", "Electronics & Communication", "Dr. Vikram Rao"),
            ("EC330", "Signals & Systems", "Electronics & Communication", "Dr. Vikram Rao"),
            ("PH101", "Engineering Physics", "Physics", "Prof. Sneha Joshi"),
        ]
        courses = [Course(code=c, name=n, dept=d, faculty=f, students=0) for (c, n, d, f) in course_specs]
        db.add_all(courses)
        db.commit()
        for c in courses:
            db.refresh(c)
        course_by_code = {c.code: c for c in courses}

        # ------------------------------------------------- Subject requests
        subject_requests = [
            SubjectRequest(teacher_name="Dr. Aditya Menon", code="CS450", name="Distributed Systems",
                            dept="Computer Science", notes="Elective for 4th-years, builds on CS410.",
                            status="pending", ts=days_ago(2)),
            SubjectRequest(teacher_name="Dr. Vikram Rao", code="EC440", name="VLSI Design",
                            dept="Electronics & Communication", notes="Requires EC220 as prerequisite.",
                            status="pending", ts=days_ago(1)),
            SubjectRequest(teacher_name="Prof. Sneha Joshi", code="PH210", name="Quantum Mechanics I",
                            dept="Physics", notes="", status="rejected",
                            reject_reason="Insufficient enrollment projected for this semester — resubmit for next term.",
                            ts=days_ago(10)),
            SubjectRequest(teacher_name="Dr. Ritu Nair", code="MA150", name="Basic Statistics",
                            dept="Mathematics", notes="Service course for non-Math majors.", status="rejected",
                            reject_reason="Overlaps significantly with existing MA201 content.", ts=days_ago(15)),
            SubjectRequest(teacher_name="Dr. Priya Sharma", code="CS410", name="Operating Systems",
                            dept="Computer Science", notes="Approved and now live.", status="approved", ts=days_ago(60)),
        ]
        db.add_all(subject_requests)

        # ------------------------------------------------------------- Fees
        fee_status_cycle = ["paid", "paid", "partial", "overdue", "paid", "partial"]
        fees = []
        for i, (n, e, idl, dept, yr, sec) in enumerate(student_specs):
            total = 85000 if dept != "Physics" else 78000
            status = fee_status_cycle[i % len(fee_status_cycle)]
            paid = total if status == "paid" else (round(total * random.uniform(0.35, 0.65) / 500) * 500 if status == "partial" else 0)
            fees.append(Fee(student=n, total=total, paid=paid, status=status))
        db.add_all(fees)
        db.commit()

        # ---------------------------------------- Attendance & grades data
        # Each student gets a fixed "tendency" so their numbers stay
        # internally consistent across every course/session instead of
        # being pure noise — this is what makes the Risk Insights screen
        # show a believable spread of low/medium/high risk students.
        tendency = {}
        for n, e, idl, dept, yr, sec in student_specs:
            tendency[n] = {
                "attendance": random.uniform(0.55, 0.98),
                "score": random.uniform(38, 96),
            }

        assessment_names = ["Quiz 1", "Midterm", "Assignment 1", "Quiz 2", "Final"]
        for course in courses:
            n_sessions = random.randint(8, 12)
            teacher_name = course.faculty
            for s in range(n_sessions):
                session = AttendanceSession(
                    course_id=course.to_dict()["id"], course_label=f"{course.code} — {course.name}",
                    date=(days_ago(n_sessions - s) ).date().isoformat(), marked_by=teacher_name,
                    ts=days_ago(n_sessions - s),
                )
                db.add(session)
                db.flush()
                for n, e, idl, dept, yr, sec in student_specs:
                    present = random.random() < tendency[n]["attendance"]
                    db.add(AttendanceRecord(session_id=session.id, student_id=student_by_name[n].id,
                                             present=present, confidence=round(random.uniform(82, 99), 1)))

            n_assessments = random.randint(2, 3)
            for a in range(n_assessments):
                grade = GradeRecord(course_id=course.to_dict()["id"], course_label=f"{course.code} — {course.name}",
                                     assessment=assessment_names[a % len(assessment_names)],
                                     published_by=teacher_name, ts=days_ago(n_sessions - a * 2))
                db.add(grade)
                db.flush()
                for n, e, idl, dept, yr, sec in student_specs:
                    score = max(0, min(100, round(tendency[n]["score"] + random.uniform(-12, 12))))
                    db.add(GradeEntry(grade_id=grade.id, student_id=student_by_name[n].id, score=score))
        db.commit()

        # ---------------------------------------------------------- Assignments
        assignments = []
        due_dates = ["28 Aug", "2 Sep", "5 Sep", "10 Sep", "15 Sep"]
        titles_by_subject = {
            "Data Structures": ["Binary Trees — Problem Set 4", "Heap Implementation Lab", "Graph Traversal Report"],
            "Database Systems": ["Normalization Exercise", "ER-Diagram Assignment", "SQL Query Optimization Lab"],
            "Operating Systems": ["Process Scheduling Simulator", "Memory Management Report"],
            "Computer Networks": ["Socket Programming Lab", "Routing Protocol Comparison"],
            "Discrete Mathematics": ["Counting & Recurrences Sheet", "Graph Theory Problem Set"],
            "Linear Algebra": ["Eigenvalue Computation Lab", "Vector Space Proofs"],
            "Numerical Methods": ["Root-Finding Algorithms Report"],
            "Digital Electronics": ["Logic Gate Design Lab", "Flip-Flop Circuit Report"],
            "Signals & Systems": ["Fourier Transform Problem Set"],
            "Engineering Physics": ["Wave Mechanics Lab Report"],
        }
        n_active_students = len([s for s in students if s.status == "active"])
        for course in courses:
            for title in titles_by_subject.get(course.name, [f"{course.name} Assignment"]):
                status = random.choice(["pending", "pending", "submitted"])
                submitted = n_active_students if status == "submitted" else random.randint(0, n_active_students - 1)
                assignments.append(Assignment(title=title, course=course.name, due=random.choice(due_dates),
                                               status=status, submitted_count=submitted, total_students=n_active_students))
        db.add_all(assignments)

        # ------------------------------------------------------- Study material
        materials = []
        for course in courses:
            materials.append(StudyMaterial(title=f"Unit 1 — {course.name} full notes", course=course.name,
                                            type="PDF", uploaded_by=course.faculty, size="2.1 MB", ts=days_ago(random.randint(3, 20))))
            materials.append(StudyMaterial(title=f"{course.name} — practice problem bank", course=course.name,
                                            type="PDF", uploaded_by=course.faculty, size="850 KB", ts=days_ago(random.randint(1, 10))))
        db.add_all(materials)

        # ------------------------------------------------------- Class notices
        notices = []
        for course in courses[:6]:
            notices.append(ClassNotice(title=f"Practical exam schedule for {course.code} has been posted",
                                        course=course.name, sent_by=course.faculty, ts=days_ago(random.randint(1, 8))))
        db.add_all(notices)

        # ------------------------------------------------------------- Leave
        leave_types = ["Sick", "Casual", "Conference", "Medical"]
        leaves = []
        for t in teachers:
            for _ in range(random.randint(1, 3)):
                start = days_ago(random.randint(-20, 40))
                status = random.choice(["pending", "approved", "approved", "rejected"])
                leaves.append(LeaveRequest(
                    applicant=t.name, role="teacher", type=random.choice(leave_types),
                    from_date=start.date().isoformat(), to_date=(start + timedelta(days=random.randint(1, 3))).date().isoformat(),
                    reason="Presenting at a departmental conference." if "Conference" else "Personal leave.",
                    status=status, ts=days_ago(random.randint(1, 45)),
                ))
        db.add_all(leaves)

        # -------------------------------------------------------- Grievances
        student_grievance_texts = [
            ("Infrastructure", "Wi-Fi has been down in Block B library for three days, can't access online course material."),
            ("Academic", "My CS315 lab attendance for 14 Aug was marked absent even though I attended — please recheck."),
            ("Fees & Finance", "Paid the partial fee installment on 10 Aug but the portal still shows it as overdue."),
            ("Hostel", "Room heater has been broken for a week, warden hasn't responded to two requests."),
            ("Academic", "Requesting a re-evaluation of my Midterm score for Discrete Mathematics."),
            ("Infrastructure", "Projector in Lab 3 hasn't worked for two weeks, affecting practical sessions."),
            ("Other", "Requesting an extension on the Database Systems assignment due to a family emergency."),
            ("Ragging / Harassment", "A senior student has been making uncomfortable comments in the hostel common room."),
        ]
        teacher_grievance_texts = [
            ("Timetable & Workload", "Back-to-back sections with no gap between EC220 and EC330 this semester, requesting a review."),
            ("Payroll & HR", "October payslip shows an incorrect deduction, please investigate."),
            ("Infrastructure & Labs", "Staffroom AC in Block C has not been working since last month."),
        ]
        grievances = []
        gr_statuses = ["open", "in-review", "resolved"]
        for i, (cat, desc) in enumerate(student_grievance_texts):
            raiser = students[i % len(students)]
            status = gr_statuses[i % len(gr_statuses)]
            grievances.append(Grievance(raised_by=raiser.name, role="student", category=cat, description=desc,
                                         status=status, assigned_to=("Meera Iyer" if status != "open" else None),
                                         ts=days_ago(random.randint(1, 30))))
        for i, (cat, desc) in enumerate(teacher_grievance_texts):
            raiser = teachers[i % len(teachers)]
            status = gr_statuses[i % len(gr_statuses)]
            grievances.append(Grievance(raised_by=raiser.name, role="teacher", category=cat, description=desc,
                                         status=status, assigned_to=("Rakesh Verma" if status != "open" else None),
                                         ts=days_ago(random.randint(1, 20))))
        db.add_all(grievances)

        # ---------------------------------------------------------- Placements
        placement_specs = [
            ("Nexora Systems", "Software Engineer Intern", "₹8 LPA", "Bengaluru", 7.5, 75, "5 Sep", "open"),
            ("Vantage Analytics", "Data Analyst", "₹6.5 LPA", "Pune", 7.0, 70, "10 Sep", "open"),
            ("Orbit Cloud", "Backend Developer", "₹9.2 LPA", "Hyderabad", 8.0, 80, "1 Sep", "open"),
            ("Fintrail Labs", "Frontend Engineer", "₹7.8 LPA", "Gurugram", 7.2, 72, "12 Sep", "open"),
            ("Bluepeak Semiconductors", "VLSI Design Intern", "₹6 LPA", "Noida", 7.0, 70, "8 Sep", "open"),
            ("Quanta Networks", "Network Engineer", "₹7 LPA", "Chennai", 7.0, 75, "20 Aug", "closed"),
            ("Meridian Analytics", "Data Scientist", "₹11 LPA", "Bengaluru", 8.5, 80, "18 Aug", "closed"),
            ("Sundew Robotics", "Embedded Systems Intern", "₹6.8 LPA", "Pune", 7.0, 70, "15 Sep", "open"),
        ]
        placements = [Placement(company=c, role=r, package=p, location=l, min_cgpa=mc, min_attendance=ma,
                                 deadline=d, posted_by="Meera Iyer", status=st, ts=days_ago(random.randint(1, 25)))
                      for (c, r, p, l, mc, ma, d, st) in placement_specs]
        db.add_all(placements)
        db.commit()
        for p in placements:
            db.refresh(p)

        app_statuses = ["applied", "shortlisted", "selected", "rejected"]
        applications = []
        for p in placements:
            applicants = random.sample(students[:12], k=random.randint(2, 5))
            for s in applicants:
                applications.append(PlacementApplication(
                    placement_id=p.to_dict()["id"], student_id=f"u_{s.id}", student_name=s.name,
                    id_label=s.id_label, status=random.choice(app_statuses), ts=days_ago(random.randint(1, 15)),
                ))
        db.add_all(applications)

        # -------------------------------------------------------------- Library
        books = [
            LibraryBook(title="Introduction to Algorithms", author="Cormen, Leiserson, Rivest, Stein", category="Computer Science", copies=4),
            LibraryBook(title="Database System Concepts", author="Silberschatz, Korth, Sudarshan", category="Computer Science", copies=2),
            LibraryBook(title="Discrete Mathematics and Its Applications", author="Kenneth Rosen", category="Mathematics", copies=3),
            LibraryBook(title="Operating System Concepts", author="Silberschatz, Galvin, Gagne", category="Computer Science", copies=1),
            LibraryBook(title="Computer Networking: A Top-Down Approach", author="Kurose, Ross", category="Computer Science", copies=0),
            LibraryBook(title="Linear Algebra and Its Applications", author="Gilbert Strang", category="Mathematics", copies=5),
            LibraryBook(title="Digital Design", author="M. Morris Mano", category="Electronics & Communication", copies=2),
            LibraryBook(title="Signals and Systems", author="Oppenheim, Willsky", category="Electronics & Communication", copies=0),
            LibraryBook(title="University Physics", author="Young, Freedman", category="Physics", copies=3),
            LibraryBook(title="Numerical Methods for Engineers", author="Chapra, Canale", category="Mathematics", copies=2),
            LibraryBook(title="Computer Organization and Design", author="Patterson, Hennessy", category="Computer Science", copies=1),
            LibraryBook(title="Probability and Statistics for Engineers", author="Walpole et al.", category="Mathematics", copies=4),
        ]
        db.add_all(books)
        db.commit()
        for b in books:
            db.refresh(b)

        lib_status_cycle = ["pending", "ready-for-pickup", "waitlisted"]
        lib_requests = []
        for i, s in enumerate(students[:10]):
            book = books[i % len(books)]
            status = "waitlisted" if book.copies == 0 else lib_status_cycle[i % len(lib_status_cycle)]
            lib_requests.append(LibraryRequest(student_name=s.name, book_id=book.to_dict()["id"], title=book.title,
                                                status=status, ts=days_ago(random.randint(1, 10))))
        db.add_all(lib_requests)

        # -------------------------------------------------------- Notifications
        notifications = [
            Notification(to_role="student", title="Practical exam schedule posted", body="CS301 practical exam schedule is now live — check your timetable.", ts=days_ago(2)),
            Notification(to_role="student", title="New placement drive", body="Nexora Systems is hiring for Software Engineer Intern.", ts=days_ago(3)),
            Notification(to_role="teacher", title="New subject request submitted", body="Dr. Aditya Menon requested to add CS450 — Distributed Systems.", ts=days_ago(2)),
            Notification(to_role="admin", title="New grievance submitted", body="A high-priority grievance was just raised.", ts=days_ago(1)),
            Notification(to_role="student", title="Book ready for pickup", body="Introduction to Algorithms — collect it from the circulation desk.", ts=days_ago(1)),
        ]
        db.add_all(notifications)

        # -------------------------------------------------------------- Audit log
        audit_entries = [
            AuditLogEntry(actor="Meera Iyer", actor_role="admin", action="Fee marked paid", detail="Rohan Mehta", ts=days_ago(5)),
            AuditLogEntry(actor="Dr. Priya Sharma", actor_role="teacher", action="Attendance published", detail="CS301 — Data Structures", ts=days_ago(3)),
            AuditLogEntry(actor="Prof. Arjun Kapoor", actor_role="teacher", action="Grades published", detail="CS315 — Midterm", ts=days_ago(4)),
            AuditLogEntry(actor="Meera Iyer", actor_role="admin", action="Subject request approved", detail="CS410 — Operating Systems → Dr. Priya Sharma", ts=days_ago(60)),
            AuditLogEntry(actor="Rakesh Verma", actor_role="admin", action="Grievance resolved", detail="Fees & Finance", ts=days_ago(6)),
        ]
        db.add_all(audit_entries)

        db.commit()

        n_courses_with_material = len(materials)
        print(f"Seeded: {len(admins)} admins, {len(teachers)} teachers, {len(students)} students, "
              f"{len(courses)} courses, {len(subject_requests)} subject requests, {len(fees)} fee records, "
              f"attendance across {len(courses)} courses, grades across {len(courses)} courses, "
              f"{len(assignments)} assignments, {n_courses_with_material} study materials, {len(notices)} class notices, "
              f"{len(leaves)} leave requests, {len(grievances)} grievances, {len(placements)} placements, "
              f"{len(applications)} placement applications, {len(books)} library books, {len(lib_requests)} library requests, "
              f"{len(notifications)} notifications, {len(audit_entries)} audit log entries.")
        print()
        print("Demo logins:")
        print("  Student : rohan@campuspilot.edu / student123   (try any of the other student emails too, all use student123)")
        print("  Faculty : priya@campuspilot.edu / teach123     (also arjun@, ritu@, aditya@, vikram@, sneha@ — all teach123)")
        print("  Admin   : admin@campuspilot.edu / admin123     (also rakesh@campuspilot.edu / admin123)")
        print()
        print("One student account (Rudra Nambiar) was seeded as 'inactive' — use it to demo the admin")
        print("reactivate flow in Users & Roles, and to confirm a deactivated account can't log in.")
finally:
    db.close()
