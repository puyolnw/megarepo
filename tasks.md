# แผนการทำงานระบบ SerialNumba

## ภาพรวมระบบปัจจุบัน

### Database Structure (จาก app_db.sql)
- **users**: ข้อมูลผู้ใช้ (ADMIN, STAFF, STUDENT) - มีฟิลด์ program, enrollment_year
- **activities**: ข้อมูลกิจกรรม - มีฟิลด์ start_date, end_date, hours_awarded, status
- **serial_history**: ประวัติการสะสมชั่วโมง - มีฟิลด์ hours_earned, redeemed_at, is_reviewed
- **serials**: ซีเรียลโค้ด
- **activity_reviews**: รีวิวกิจกรรม
- **checkins**: การเช็คอินเข้าร่วมกิจกรรม
- **system_settings**: การตั้งค่าระบบ - มีฟิลด์ required_hours

### API Endpoints (จากโค้ดจริง)
- **Authentication**: `/auth/login`, `/auth/register`, `/auth/me`
- **Activities**: `/activities`, `/admin/activities`
- **Reports**: `/admin/reports/members`, `/admin/reports/activities`
- **Student**: `/student/progress`, `/student/serial-history`
- **Admin**: `/admin/dashboard-stats`, `/admin/users`, `/admin/settings`

### Frontend Pages (จากโค้ดจริง)
- **Admin**: AdminHome, ActivityManagement, CreateActivity, MemberReports
- **Student**: StudentHome, StudentProgress, StudentSerialHistory
- **Staff**: StaffDashboard, StaffActivities
- **Public**: AllActivities, MyActivities

---

## งานที่ต้องทำ (7 งาน)

### 1. เปลี่ยนชื่อแดชบอร์ดผู้ดูแลระบบเป็น "ผู้ดูแลระบบ"
**สถานะ**: ยังไม่ทำ

**Frontend ที่ต้องแก้**:
- `front/src/pages/AdminHome.jsx` บรรทัด 82: เปลี่ยน "แดชบอร์ดผู้ดูแลระบบ" เป็น "ผู้ดูแลระบบ"

**API ที่เกี่ยวข้อง**: ไม่ต้องแก้

**Database ที่เกี่ยวข้อง**: ไม่ต้องแก้

---

### 2. เพิ่มปีการศึกษาในระบบสร้างกิจกรรม
**สถานะ**: ยังไม่ทำ

**Database ที่ต้องแก้**:
- เพิ่มฟิลด์ `academic_year` ในตาราง `activities`

**API ที่ต้องแก้**:
- `back/routes/activities.js` - POST `/activities` (สร้างกิจกรรม) - เพิ่มฟิลด์ academic_year
- `back/routes/admin.js` - GET `/admin/activities` (ดึงกิจกรรมทั้งหมด) - เพิ่มฟิลด์ academic_year ใน response

**Frontend ที่ต้องแก้**:
- `front/src/pages/CreateActivity.jsx` - เพิ่มฟิลด์เลือกปีการศึกษา (บรรทัด 130: api.post('/activities'))
- `front/src/pages/ActivityManagement.jsx` - แสดงปีการศึกษาในตาราง (บรรทัด 59: api.get('/admin/activities'))
- `front/src/pages/StaffActivities.jsx` - แสดงปีการศึกษาในตาราง (บรรทัด 55: api.get('/admin/activities'))
- `front/src/pages/AllActivities.jsx` - แสดงปีการศึกษาในตาราง (บรรทัด 19: api.get('/admin/activities'))
- `front/src/pages/MyActivities.jsx` - แสดงปีการศึกษาในตาราง (บรรทัด 18: api.get('/activities/my'))
- `front/src/pages/AdminHome.jsx` - แสดงปีการศึกษาในกิจกรรมล่าสุด (บรรทัด 29: api.get('/activities'))

**⚠️ ข้อควรระวัง**: API `/activities` และ `/admin/activities` ถูกเรียกใช้โดยหลายหน้า ต้องเพิ่มฟิลด์ academic_year ใน response โดยไม่ทำลายโครงสร้างเดิม

---

### 3. เปลี่ยนรายงานสมาชิกเป็นรายงานนักศึกษา พร้อมเพิ่มกราฟปีการศึกษา
**สถานะ**: ยังไม่ทำ

**Frontend ที่ต้องแก้**:
- `front/src/pages/Reports/MemberReports.jsx` บรรทัด 163: เปลี่ยน "รายงานสมาชิก" เป็น "รายงานนักศึกษา"
- `front/src/pages/Reports/MemberReports.jsx` บรรทัด 165: เปลี่ยน "ข้อมูลการสะสมชั่วโมงและสถิติสมาชิก" เป็น "ข้อมูลการสะสมชั่วโมงและสถิตินักศึกษา"
- `front/src/pages/Reports/MemberReports.jsx` บรรทัด 273: เปลี่ยน "สมาชิกทั้งหมด" เป็น "นักศึกษาทั้งหมด"
- `front/src/pages/Reports/MemberReports.jsx` บรรทัด 307: เปลี่ยน "สมาชิกที่ใช้งาน" เป็น "นักศึกษาที่ใช้งาน"
- `front/src/pages/Reports/MemberReports.jsx` บรรทัด 412: เปลี่ยน "อันดับสมาชิกที่สะสมชั่วโมงสูงสุด" เป็น "อันดับนักศึกษาที่สะสมชั่วโมงสูงสุด"

**API ที่ต้องแก้**:
- `back/routes/reports.js` - GET `/admin/reports/members` - เพิ่มกราฟปีการศึกษา (บรรทัด 362: router.get('/members'))

**Frontend ที่เรียกใช้ API นี้**:
- `front/src/pages/Reports/MemberReports.jsx` บรรทัด 50: api.get('/admin/reports/members')

**Database ที่เกี่ยวข้อง**: ใช้ตาราง `users` (มีฟิลด์ `enrollment_year`) และ `serial_history`

**⚠️ ข้อควรระวัง**: API `/admin/reports/members` ถูกเรียกใช้โดย MemberReports.jsx เท่านั้น ไม่มีผลกระทบต่อหน้าอื่น

---

### 4. เพิ่มฟีเจอร์แก้ไข ลบ ยกเลิก และเลื่อนวันกิจกรรม
**สถานะ**: ยังไม่ทำ

**Database ที่ต้องแก้**:
- เพิ่มฟิลด์ `status` ในตาราง `activities` (มีอยู่แล้ว: OPEN, DRAFT, CANCELLED)
- เพิ่มฟิลด์ `rescheduled_date` ในตาราง `activities` (สำหรับเลื่อนวัน)

**API ที่ต้องสร้างใหม่**:
- `back/routes/activities.js` - PUT `/activities/:id` (แก้ไขกิจกรรม) - สร้างใหม่
- `back/routes/activities.js` - DELETE `/activities/:id` (ลบกิจกรรม) - สร้างใหม่
- `back/routes/activities.js` - PUT `/activities/:id/status` (เปลี่ยนสถานะ) - สร้างใหม่
- `back/routes/activities.js` - PUT `/activities/:id/reschedule` (เลื่อนวัน) - สร้างใหม่

**Frontend ที่ต้องแก้**:
- `front/src/pages/ActivityManagement.jsx` - เพิ่มปุ่มแก้ไข/ลบ/ยกเลิก/เลื่อนวัน (บรรทัด 59: api.get('/admin/activities'))
- `front/src/pages/StaffActivities.jsx` - เพิ่มปุ่มแก้ไข/ลบ/ยกเลิก/เลื่อนวัน (บรรทัด 55: api.get('/admin/activities'))

**⚠️ ข้อควรระวัง**: API ใหม่เหล่านี้จะไม่กระทบต่อ frontend เดิม เพราะเป็น API endpoints ใหม่ที่ยังไม่มีอยู่

---

### 5. เปลี่ยนชั่วโมงที่เสร็จสิ้นเป็นชั่วโมงที่สะสมได้ และแสดงตามปีการศึกษา
**สถานะ**: ยังไม่ทำ

**Frontend ที่ต้องแก้**:
- `front/src/pages/StudentProgress.jsx` บรรทัด 114: เปลี่ยน "ชั่วโมงที่สะสมได้" เป็น "ชั่วโมงที่สะสมได้"
- `front/src/pages/StudentProgress.jsx` บรรทัด 180: เปลี่ยน "ชั่วโมงที่เสร็จสิ้น" เป็น "ชั่วโมงที่สะสมได้"
- เพิ่มการแสดงชั่วโมงตามปีการศึกษา

**API ที่ต้องแก้**:
- `back/routes/student.js` - GET `/student/progress` - เพิ่มข้อมูลชั่วโมงตามปีการศึกษา (บรรทัด 8: router.get('/progress'))

**Frontend ที่เรียกใช้ API นี้**:
- `front/src/pages/StudentProgress.jsx` บรรทัด 18: api.get('/student/progress')

**Database ที่เกี่ยวข้อง**: ใช้ตาราง `serial_history` และ `activities` (ต้องเพิ่มฟิลด์ `academic_year`)

**⚠️ ข้อควรระวัง**: API `/student/progress` ถูกเรียกใช้โดย StudentProgress.jsx เท่านั้น ไม่มีผลกระทบต่อหน้าอื่น

---

### 6. เปลี่ยนความก้าวหน้าของฉันเป็นชั่วโมงกิจกรรม
**สถานะ**: ยังไม่ทำ

**Frontend ที่ต้องแก้**:
- `front/src/pages/StudentProgress.jsx` บรรทัด 91: เปลี่ยน "ความก้าวหน้าของฉัน" เป็น "ชั่วโมงกิจกรรม"
- `front/src/pages/StudentProgress.jsx` บรรทัด 94: เปลี่ยน "ความก้าวหน้าในการสะสมชั่วโมงกิจกรรมของคุณ" เป็น "ชั่วโมงกิจกรรมที่คุณสะสมได้"

**API ที่เกี่ยวข้อง**: ไม่ต้องแก้

**Database ที่เกี่ยวข้อง**: ไม่ต้องแก้

**⚠️ ข้อควรระวัง**: การแก้ไขนี้เป็นเพียงการเปลี่ยนข้อความใน Frontend เท่านั้น ไม่กระทบต่อ API หรือ Database

---

### 7. เพิ่มระบบจัดการปีการศึกษาในระบบ
**สถานะ**: ยังไม่ทำ

**Database ที่ต้องแก้**:
- สร้างตาราง `academic_years` ใหม่
- เพิ่มฟิลด์ `academic_year_id` ในตาราง `activities`

**API ที่ต้องสร้างใหม่**:
- `back/routes/admin.js` - GET/POST/PUT/DELETE `/admin/academic-years` (CRUD ปีการศึกษา) - สร้างใหม่

**Frontend ที่ต้องสร้างใหม่**:
- สร้างหน้า `front/src/pages/AcademicYearManagement.jsx` ใหม่
- เพิ่มเมนูจัดการปีการศึกษาใน Admin

**⚠️ ข้อควรระวัง**: API ใหม่เหล่านี้จะไม่กระทบต่อ frontend เดิม เพราะเป็น API endpoints ใหม่ที่ยังไม่มีอยู่

---

### 8. สร้างหน้าเทส API และ Frontend สำหรับทดสอบฟีเจอร์ใหม่
**สถานะ**: ยังไม่ทำ

**Backend Routes ที่ต้องสร้าง**:
- `back/routes/test.js` - สร้างไฟล์ใหม่สำหรับเทส API
- `back/server.js` - เพิ่ม routes test เข้าไป:
  ```javascript
  const testRoutes = require('./routes/test');
  app.use('/api/test', testRoutes);
  ```

**API Endpoints ที่ต้องสร้าง**:
- GET `/api/test/academic-years` - เทส API ปีการศึกษา
- GET `/api/test/activities-with-year` - เทส API กิจกรรมที่มีปีการศึกษา
- GET `/api/test/student-progress-by-year` - เทส API ความก้าวหน้าตามปีการศึกษา
- GET `/api/test/member-reports-by-year` - เทส API รายงานนักศึกษาตามปีการศึกษา

**Frontend Routes ที่ต้องสร้าง**:
- `front/src/pages/TestPage.jsx` - สร้างหน้าเทสใหม่
- `front/src/App.jsx` - เพิ่ม route สำหรับหน้าเทส:
  ```javascript
  <Route path="/test" element={<TestPage />} />
  ```

**Frontend Features ที่ต้องสร้าง**:
- แสดงผลข้อมูลจาก API ทั้งหมดที่สร้างใหม่
- แสดงตารางข้อมูลกิจกรรมที่มีปีการศึกษา
- แสดงกราฟข้อมูลรายงานนักศึกษาตามปีการศึกษา
- แสดงข้อมูลความก้าวหน้าตามปีการศึกษา
- เพิ่มปุ่มสำหรับเรียกใช้ API แต่ละตัว
- แสดงผลลัพธ์ในรูปแบบ JSON และตาราง

**Database ที่เกี่ยวข้อง**: ใช้ตารางที่มีอยู่แล้ว (activities, users, serial_history)

**⚠️ ข้อควรระวัง**: API ใหม่เหล่านี้จะไม่กระทบต่อ frontend เดิม เพราะเป็น API endpoints ใหม่ที่ยังไม่มีอยู่

---

## สรุปการเปลี่ยนแปลง

### หน้าที่ต้องแก้ทั้งหมด (9 หน้า)
1. **AdminHome.jsx** - เปลี่ยนชื่อ + แสดงปีการศึกษา
2. **CreateActivity.jsx** - เพิ่มฟิลด์ปีการศึกษา
3. **ActivityManagement.jsx** - แสดงปีการศึกษา + เพิ่มฟีเจอร์จัดการ
4. **StaffActivities.jsx** - แสดงปีการศึกษา + เพิ่มฟีเจอร์จัดการ
5. **AllActivities.jsx** - แสดงปีการศึกษา
6. **MyActivities.jsx** - แสดงปีการศึกษา
7. **MemberReports.jsx** - เปลี่ยนชื่อ + เพิ่มกราฟปีการศึกษา
8. **StudentProgress.jsx** - เปลี่ยนชื่อ + แสดงชั่วโมงตามปีการศึกษา
9. **TestPage.jsx** - สร้างหน้าเทสใหม่

### หน้าที่ใช้ API ที่ต้องแก้ไข (ตรวจสอบจาก grep)

**API `/activities` (GET)** - ใช้โดย:
- `front/src/pages/Activities.jsx` (บรรทัด 19)
- `front/src/pages/AdminHome.jsx` (บรรทัด 29)
- `front/src/pages/StaffHome.jsx` (บรรทัด 23)
- `front/src/pages/StaffDashboard.jsx` (บรรทัด 22)
- `front/src/pages/StudentHome.jsx` (บรรทัด 28)

**API `/activities` (POST)** - ใช้โดย:
- `front/src/pages/CreateActivity.jsx` (บรรทัด 130)

**API `/activities` (DELETE)** - ใช้โดย:
- `front/src/pages/Activities.jsx` (บรรทัด 39)

**API `/activities/my` (GET)** - ใช้โดย:
- `front/src/pages/MyActivities.jsx` (บรรทัด 18)

**API `/admin/activities` (GET)** - ใช้โดย:
- `front/src/pages/ActivityManagement.jsx` (บรรทัด 59)
- `front/src/pages/AllActivities.jsx` (บรรทัด 19)
- `front/src/pages/QRCodeGenerator.jsx` (บรรทัด 27)
- `front/src/pages/SerialSending.jsx` (บรรทัด 21)
- `front/src/pages/SerialManagement.jsx` (บรรทัด 22)
- `front/src/pages/StaffActivities.jsx` (บรรทัด 55)
- `front/src/pages/StaffSerialSending.jsx` (บรรทัด 21)

**API `/admin/activities/:id/participants` (GET)** - ใช้โดย:
- `front/src/pages/ActivityManagement.jsx` (บรรทัด 91)
- `front/src/pages/SerialSending.jsx` (บรรทัด 31)
- `front/src/pages/StaffActivities.jsx` (บรรทัด 93)
- `front/src/pages/StaffSerialSending.jsx` (บรรทัด 31)

**API `/activities/:id` (GET)** - ใช้โดย:
- `front/src/pages/ActivityManagement.jsx` (บรรทัด 84)
- `front/src/pages/StaffActivities.jsx` (บรรทัด 86)

**API `/activities/:id` (PUT)** - ใช้โดย:
- `front/src/pages/ActivityManagement.jsx` (บรรทัด 122)

**API `/admin/reports/members` (GET)** - ใช้โดย:
- `front/src/pages/Reports/MemberReports.jsx` (บรรทัด 50)

**API `/student/progress` (GET)** - ใช้โดย:
- `front/src/pages/StudentProgress.jsx` (บรรทัด 18)

### การตรวจสอบการเรียกใช้ API ในแต่ละหน้า

**หน้า Activities.jsx**:
- เรียกใช้ `api.get('/activities')` บรรทัด 19 - รับ `response.data.data.activities`
- เรียกใช้ `api.delete('/activities/${id}')` บรรทัด 39 - ลบกิจกรรม

**หน้า AdminHome.jsx**:
- เรียกใช้ `api.get('/activities')` บรรทัด 29 - รับ `response.data.data.activities`

**หน้า StaffHome.jsx**:
- เรียกใช้ `api.get('/activities?limit=100')` บรรทัด 23 - รับ `response.data.activities`

**หน้า StaffDashboard.jsx**:
- เรียกใช้ `api.get('/activities')` บรรทัด 22 - รับ `response.data.data.activities`

**หน้า StudentHome.jsx**:
- เรียกใช้ `api.get('/activities')` บรรทัด 28 - รับ `response.data.data.activities`

**หน้า CreateActivity.jsx**:
- เรียกใช้ `api.post('/activities', submitData)` บรรทัด 130 - ส่งข้อมูลสร้างกิจกรรม

**หน้า MyActivities.jsx**:
- เรียกใช้ `api.get('/activities/my')` บรรทัด 18 - รับ `response.data.data.activities`

**หน้า ActivityManagement.jsx**:
- เรียกใช้ `api.get('/admin/activities')` บรรทัด 59 - รับ `response.data.data.activities`
- เรียกใช้ `api.get('/activities/${activityId}')` บรรทัด 84 - รับข้อมูลกิจกรรม
- เรียกใช้ `api.get('/admin/activities/${activityId}/participants')` บรรทัด 91 - รับข้อมูลผู้เข้าร่วม
- เรียกใช้ `api.put('/activities/${activityId}', { status: newStatus })` บรรทัด 122 - เปลี่ยนสถานะ

**หน้า AllActivities.jsx**:
- เรียกใช้ `api.get('/admin/activities')` บรรทัด 19 - รับ `response.data.data.activities`

**หน้า StaffActivities.jsx**:
- เรียกใช้ `api.get('/admin/activities')` บรรทัด 55 - รับ `response.data.data.activities`
- เรียกใช้ `api.get('/activities/${activityId}')` บรรทัด 86 - รับข้อมูลกิจกรรม
- เรียกใช้ `api.get('/admin/activities/${activityId}/participants')` บรรทัด 93 - รับข้อมูลผู้เข้าร่วม

**หน้า MemberReports.jsx**:
- เรียกใช้ `api.get('/admin/reports/members', { params: filters })` บรรทัด 50 - รับ `response.data.data`

**หน้า StudentProgress.jsx**:
- เรียกใช้ `api.get('/student/progress')` บรรทัด 18 - รับ `response.data.data`

### API ที่ต้องแก้ทั้งหมด (12 endpoints)

**API ที่มีอยู่แล้วและต้องแก้ไข (8 endpoints)**:

1. **POST /activities** - เพิ่มฟิลด์ academic_year
   - ใช้โดย: CreateActivity.jsx (บรรทัด 130)
   - ต้องเพิ่ม: academic_year ใน submitData

2. **GET /activities** - เพิ่มฟิลด์ academic_year ใน response
   - ใช้โดย: Activities.jsx (บรรทัด 19), AdminHome.jsx (บรรทัด 29), StaffDashboard.jsx (บรรทัด 22), StudentHome.jsx (บรรทัด 28)
   - ⚠️ StaffHome.jsx (บรรทัด 23) ใช้ response.data.activities (ไม่ใช่ response.data.data.activities)
   - ต้องเพิ่ม: academic_year ใน response.data.data.activities

3. **GET /activities/my** - เพิ่มฟิลด์ academic_year ใน response
   - ใช้โดย: MyActivities.jsx (บรรทัด 18)
   - ต้องเพิ่ม: academic_year ใน response.data.data.activities

4. **GET /admin/activities** - เพิ่มฟิลด์ academic_year ใน response
   - ใช้โดย: ActivityManagement.jsx (บรรทัด 59), AllActivities.jsx (บรรทัด 19), StaffActivities.jsx (บรรทัด 55)
   - ต้องเพิ่ม: academic_year ใน response.data.data.activities

5. **GET /activities/:id** - เพิ่มฟิลด์ academic_year ใน response
   - ใช้โดย: ActivityManagement.jsx (บรรทัด 84), StaffActivities.jsx (บรรทัด 86)
   - ต้องเพิ่ม: academic_year ใน response

6. **PUT /activities/:id** - เพิ่มฟิลด์ academic_year
   - ใช้โดย: ActivityManagement.jsx (บรรทัด 122)
   - ต้องเพิ่ม: academic_year ใน request body

7. **GET /admin/reports/members** - เพิ่มกราฟปีการศึกษา
   - ใช้โดย: MemberReports.jsx (บรรทัด 50)
   - ต้องเพิ่ม: ข้อมูลกราฟปีการศึกษาใน response.data.data

8. **GET /student/progress** - เพิ่มข้อมูลชั่วโมงตามปีการศึกษา
   - ใช้โดย: StudentProgress.jsx (บรรทัด 18)
   - ต้องเพิ่ม: ข้อมูลชั่วโมงตามปีการศึกษาใน response.data.data

**API ที่ต้องสร้างใหม่ (7 endpoints)**:

9. **DELETE /activities/:id** - ลบกิจกรรม (สร้างใหม่)
   - ใช้โดย: Activities.jsx (บรรทัด 39) - มีอยู่แล้วแต่ต้องตรวจสอบว่า API มีอยู่หรือไม่

10. **PUT /activities/:id/status** - เปลี่ยนสถานะ (สร้างใหม่)
    - ใช้โดย: ActivityManagement.jsx (บรรทัด 122) - มีอยู่แล้วแต่ต้องตรวจสอบว่า API มีอยู่หรือไม่

11. **PUT /activities/:id/reschedule** - เลื่อนวัน (สร้างใหม่)
    - ใช้โดย: ยังไม่มี frontend เรียกใช้

12. **GET /api/test/academic-years** - เทส API ปีการศึกษา (สร้างใหม่)
    - ใช้โดย: TestPage.jsx (จะสร้างใหม่)

13. **GET /api/test/activities-with-year** - เทส API กิจกรรมที่มีปีการศึกษา (สร้างใหม่)
    - ใช้โดย: TestPage.jsx (จะสร้างใหม่)

14. **GET /api/test/student-progress-by-year** - เทส API ความก้าวหน้าตามปีการศึกษา (สร้างใหม่)
    - ใช้โดย: TestPage.jsx (จะสร้างใหม่)

15. **GET /api/test/member-reports-by-year** - เทส API รายงานนักศึกษาตามปีการศึกษา (สร้างใหม่)
    - ใช้โดย: TestPage.jsx (จะสร้างใหม่)

### ⚠️ ข้อควรระวังสำคัญ

**API Response Structure ที่แตกต่างกัน**:
- **StaffHome.jsx** ใช้ `response.data.activities` (ไม่ใช่ `response.data.data.activities`)
- **หน้าอื่นๆ** ใช้ `response.data.data.activities`

**API ที่อาจมีอยู่แล้ว**:
- **DELETE /activities/:id** - Activities.jsx เรียกใช้แล้ว ต้องตรวจสอบว่า API มีอยู่หรือไม่
- **PUT /activities/:id** - ActivityManagement.jsx เรียกใช้แล้ว ต้องตรวจสอบว่า API มีอยู่หรือไม่

### Routes ที่ต้องสร้าง/แก้ไขทั้งหมด (4 ไฟล์)
1. **back/routes/test.js** - สร้างไฟล์ใหม่
2. **back/server.js** - เพิ่ม test routes
3. **front/src/pages/TestPage.jsx** - สร้างไฟล์ใหม่
4. **front/src/App.jsx** - เพิ่ม test route

### Database ที่ต้องแก้ทั้งหมด (2 ตาราง)
1. **activities** - เพิ่มฟิลด์ `academic_year`, `rescheduled_date`
2. **academic_years** - สร้างตารางใหม่