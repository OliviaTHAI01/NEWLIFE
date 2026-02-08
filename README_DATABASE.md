# Database Setup Guide

## MySQL Database Configuration

### Environment Variables

เพิ่ม environment variables ต่อไปนี้ใน `.env.local` หรือ hosting platform:

```env
# Database Configuration
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USER=u970747117_test1
DB_PASSWORD=s9N>J&|Fz5?
DB_NAME=u970747117_test1
DB_SSL=false
```

หรือใช้ชื่ออื่น:
```env
MYSQL_HOST=your_mysql_host
MYSQL_PORT=3306
MYSQL_USER=u970747117_test1
MYSQL_PASSWORD=s9N>J&|Fz5?
MYSQL_DATABASE=u970747117_test1
```

### Initialize Database

หลังจากตั้งค่า environment variables แล้ว:

1. **เรียก API เพื่อ initialize database:**
   ```
   GET /api/db/init
   ```
   
   หรือเปิดเบราว์เซอร์ไปที่:
   ```
   http://localhost:3000/api/db/init
   ```

2. **ตรวจสอบว่า tables ถูกสร้างแล้ว:**
   - `factions` - เก็บข้อมูล Faction applications
   - `faction_files` - เก็บข้อมูลไฟล์ที่อัปโหลด

### Database Schema

#### Table: `factions`
- `id` - Primary key (AUTO_INCREMENT)
- `email` - Email ของผู้สมัคร
- `head_faction_name` - ชื่อ Head Faction
- `faction_name` - ชื่อ Faction
- `faction_story` - เรื่องราวความเป็นมา (TEXT)
- `members` - รายชื่อสมาชิก (TEXT)
- `hood_location` - ตำแหน่ง HOOD
- `status` - สถานะ (pending/approved/rejected)
- `notes` - หมายเหตุจาก admin
- `submitted_at` - วันที่ส่งคำขอ
- `updated_at` - วันที่อัปเดตล่าสุด

#### Table: `faction_files`
- `id` - Primary key (AUTO_INCREMENT)
- `faction_id` - Foreign key ไปยัง factions.id
- `file_type` - ประเภทไฟล์ (hood_image/clothing_file)
- `file_path` - path ของไฟล์
- `file_name` - ชื่อไฟล์
- `file_size` - ขนาดไฟล์ (bytes)
- `uploaded_at` - วันที่อัปโหลด

### Usage

1. **Submit Faction Application:**
   - POST `/api/lfm/apply`
   - ข้อมูลจะถูกบันทึกลง database

2. **Get All Applications (Admin only):**
   - GET `/api/admin/factions`
   - ดึงข้อมูลทั้งหมดจาก database

3. **Update Application Status (Admin only):**
   - POST `/api/admin/factions`
   - อัปเดตสถานะและหมายเหตุ

### Notes

- สำหรับ production, ควรใช้ remote MySQL server
- ตั้งค่า `DB_HOST` เป็น hostname ของ MySQL server
- ถ้า MySQL server ใช้ SSL, ตั้งค่า `DB_SSL=true`
- ไฟล์ที่อัปโหลดควรเก็บใน cloud storage (S3, etc.) และบันทึก path ลง database
