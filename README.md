# Hira School Shamim Saeed Campus

Frontend aur API alag processes hain. Development ke liye dono ko alag terminal mein chalayein.

## Zaroori cheezein

- Node.js 20 ya us se naya version
- MongoDB local install/service, ya MongoDB Atlas account
- Cloudinary credentials website images, gallery/results uploads ke liye; Green-API credentials WhatsApp inquiry ke liye

## Backend code ki tarteeb

API routes aur request handling `backend/server.js` mein aik hi jagah par hain. MongoDB connection `backend/db.js`, Cloudinary setup/upload helpers `backend/cloudinary.js`, aur Mongoose schemas `backend/models/WebsiteSettings.js` aur `backend/models/ResultSheet.js` mein hain. Is tarteeb se route logic aik file mein rehti hai, jabke database aur media ki configuration alag se samajhna aur maintain karna asaan hai. Source code mein Roman Urdu comments important flows aur unke maqsad samjhate hain.

## Pehli martaba setup

### 1. Backend tayyar karein

```bash
cd backend
npm install
cp .env.example .env
```

`backend/.env` mein `ADMIN_TOKEN` ko apne secret se badlein. MongoDB local chala rahe hon to misaali URI pehle se maujood hai:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/hira-school
```

MongoDB Atlas ke liye `MONGODB_URI` ko apne cluster ke connection string se badlein:

```env
MONGODB_URI=mongodb+srv://DB_USER:DB_PASSWORD@cluster0.example.mongodb.net/hira-school?retryWrites=true&w=majority
```

`DB_USER`, `DB_PASSWORD`, aur cluster host ko Atlas ke asal values se badlein; database password ko source code ya Git mein commit na karein. Atlas Network Access mein apne development machine ka IP allow karna bhi zaroori hai.

Website ke preset images pehli config request par Cloudinary mein upload hoti hain, is liye site chalane aur image uploads ke liye `.env` mein Cloudinary ke teen credentials bharna zaroori hai. Inquiry form ko WhatsApp messages bhejne ke liye Green-API instance ID aur token bharain. Green-API ke baghair inquiry endpoint wazeh `503` error deta hai.

Result PDFs ko backend expiring signed Cloudinary links ke zariye serve karta hai, is liye parents ko PDF access ke liye Cloudinary account ACL badalne ki zaroorat nahi. Production mein `PUBLIC_API_URL` ko backend ke public HTTPS URL par set karein.

Website ke text, lists, links aur image URLs ko optional `WEBSITE_CONTENT_JSON` mein JSON object ke taur par set kar sakte hain; `WEBSITE_LOCATION` address aur `STUDENT_ACHIEVEMENT_IMAGE_URL` achievement photo ko alag override karte hain. JSON mein sirf badalne wale keys rakhain, aur image URLs Cloudinary ke secure URLs hon. Explicit `.env` values admin-saved values par priority rakhti hain; unset keys admin panel se badli ja sakti hain. `.env` edit karne ke baad backend restart karein. Frontend har page load par latest API configuration fetch karta hai.

Misal ke taur par, sirf homepage heading aur location badalne ke liye:

```env
WEBSITE_LOCATION="Sukkur Township, Sukkur"
WEBSITE_CONTENT_JSON={"heroLineOne":"Learning for a brighter future"}
```

`WEBSITE_CONTENT_JSON` mein kisi bhi CMS field ko set karein; lists/objects JSON format mein aur website images secure Cloudinary URLs mein hon.

### 2. Frontend tayyar karein

```bash
cd frontend
npm install
cp .env.example .env.local
```

`.env.local` mein API URL zaroorat par badlein:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Development mein chalana

Pehle terminal mein:

```bash
cd backend
npm run dev
```

Doosre terminal mein:

```bash
cd frontend
npm run dev
```

Public website `http://localhost:3000` par aur admin page `http://localhost:3000/admin` par kholain. Admin sign-in ke liye `backend/.env` wala `ADMIN_TOKEN` istemal hota hai. API aam tor par `http://localhost:5000` par chalti hai.

Pehli martaba public site kholne par API MongoDB settings record initialize karke preset website images ko Cloudinary mein rakhti hai. Admin dashboard ke har section ka apna route hai, masalan `/admin/hero`, `/admin/about`, `/admin/images`, aur `/admin/results`; ab lambi page par anchors ke zariye fields nahi dhoondne parte. Har content page apne section ke fields aur lists save karta hai, taa-ke aik section ki edit baqi content overwrite na kare. Har section image upload se Cloudinary asset replace hota hai; logo admission form par bhi istemal hota hai. Gallery uploads alag manage hote hain aur total 6 images ki limit server enforce karta hai.

Student Achievement, leadership, aur default gallery ka preset ab supplied achievement photo use karta hai. Gallery panel mein alag se upload ki gayi photos is default update se change nahi hoti.

## Production build

Frontend:

```bash
cd frontend
npm run build
npm start
```

Backend ko alag terminal ya process manager mein:

```bash
cd backend
npm start
```

Production mein `FRONTEND_ORIGIN`, `NEXT_PUBLIC_API_URL`, MongoDB, admin token, aur zaroorat ke mutabiq Cloudinary/Green-API values apne deployed domains ke mutabiq set karein. `.env` aur `.env.local` private rakhein; sirf `.env.example` share karein.
