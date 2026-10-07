# نظام إدارة الأكاديمية | Academy Student Management System

> **الإصدار 2** (تجاري، مغلق المصدر) يُطوَّر في مستودع خاص ويضيف: قفلًا وتشفيرًا للبيانات، أدوارًا، دورات ومجموعات وجداول، حضورًا، فواتير وإيصالات، تقارير، اختبارات وشهادات، حلقات قرآنية، استفسارات، مزامنة مشفّرة، وروابط تقارير لأولياء الأمور. التفاصيل في [`docs/FEATURES.md`](docs/FEATURES.md).
- **الإصدار القديم أدناه يبقى مجانيًا ومفتوح المصدر كما هو.**
- طلبات Pro تأتي عبر قناة التواصل أعلاه لا عبر Issues.

تطبيق ويب تقدمي (PWA) لإدارة أكاديمية أو مركز تعليمي — الطلاب، المدرسين، الحضور، والحسابات المالية — يعمل بالكامل بدون إنترنت وبدون خادم.

**🔗 التجربة المباشرة:** https://nasermaher.github.io/academy-student-management-pwa/

[العربية](#العربية) | [English](#english)

---

## العربية

### الهدف من البرنامج

أداة عملية لإدارة أكاديمية أو مركز دروس خصوصية، لتسجيل وتتبع:

- **الطلاب**: بياناتهم، المرحلة الدراسية، وتسجيلهم في مجموعات المواد.
- **المدرسين**: بياناتهم ونسبتهم من إيراد كل مجموعة.
- **الحضور اليومي** لكل مجموعة دراسية.
- **الحسابات المالية**: مستحقات كل طالب، المدفوع، المتأخرات، ومستحقات كل مدرس، مع سجل عمليات كامل.

### الاستخدامات الممكنة

- إدارة سنتر/أكاديمية تعليمية صغيرة أو متوسطة بدل الدفاتر الورقية أو ملفات إكسل المتفرقة.
- متابعة تحصيل الرسوم الشهرية أو بالحصة لكل طالب، ونسب المدرسين المستحقة.
- أرشيف قابل للنقل (ملف JSON واحد) للنسخ الاحتياطي أو النقل بين أجهزة مختلفة.

### المزايا الرئيسية

- **يعمل من ملف واحد** — يمكن فتح `mobile_index.html` مباشرة بدون خادم أو تثبيت، أو تشغيله كـ PWA كامل عبر الرابط أعلاه.
- **ثنائي اللغة** عربي/إنجليزي مع دعم كامل لاتجاه الكتابة (RTL/LTR) قابل للتبديل فوريًا.
- إدارة **المراحل الدراسية، المواد، والمجموعات** (نظام دفع شهري أو بالحصة مع حد أقصى للحصص).
- تسجيل **حضور يومي** لكل مجموعة مع تحديد الكل بضغطة واحدة.
- حسابات مالية كاملة: **مستحقات، مدفوعات، متأخرات** لكل طالب ولكل مدرس، مع تقارير عامة قابلة للتصفية والطباعة.
- نسخ احتياطي واستعادة كاملة للبيانات بصيغة JSON للنقل بين الأجهزة.
- كل البيانات تُخزَّن **محليًا فقط** داخل متصفحك — لا تُرسل لأي خادم.

### طريقة الاستخدام

1. افتح الرابط أعلاه على الموبايل، ثم من متصفح Chrome/Safari اختر **"إضافة إلى الشاشة الرئيسية"** لتثبيته كتطبيق مستقل — أو نزّل ملف [`mobile_index.html`](mobile_index.html) وافتحه مباشرة من أي جهاز بدون إنترنت.
2. من شاشة **"الإعدادات"**: أضف المراحل الدراسية، ثم المواد لكل مرحلة، ثم مجموعات كل مادة (مع تحديد المدرس والسعر ونظام الدفع).
3. من شاشة **"المدرسين"**: سجّل بيانات كل مدرس.
4. من شاشة **"الطلاب"**: سجّل كل طالب واربطه بمرحلته ومجموعاته.
5. من شاشة **"الغياب والحضور"**: سجّل حضور كل مجموعة يوميًا.
6. من شاشة **"المالية"**: سجّل المدفوعات وتابع المستحقات والمتأخرات، أو استخرج تقارير عامة.
7. من **"الإعدادات"**: صدّر نسخة احتياطية دورية لحفظ بياناتك.

### ملاحظة خصوصية

هذا مستودع عام على GitHub Pages لتشغيل الصفحة فقط — لا توجد قاعدة بيانات على الخادم، وكل بيانات الطلاب/المدرسين/الحسابات التي تُدخلها تبقى محفوظة داخل متصفح جهازك فقط (localStorage) ولا يراها أحد غيرك.

### الفكرة والتنفيذ

**مهندس/ محمود عبدالرحمن الأنصاري**

---

## English

### Purpose

A practical tool for running a small-to-medium academy or private tutoring center, recording and tracking:

- **Students**: their data, educational stage, and enrollment in subject groups.
- **Teachers**: their data and revenue share for each group.
- **Daily attendance** per group.
- **Finance**: what each student owes, has paid, and owes in arrears; teacher dues; and a full transaction log.

### Possible Uses

- Running a small/medium tutoring center or academy instead of paper notebooks or scattered spreadsheets.
- Tracking monthly or per-session fee collection per student, and each teacher's due share.
- A portable archive (single JSON file) for backups or moving data between devices.

### Key Features

- **Runs from a single file** — open [`mobile_index.html`](mobile_index.html) directly with no server or install, or use it as a full PWA via the link above.
- **Bilingual** Arabic/English with full RTL/LTR support, switchable instantly.
- Manage **educational stages, subjects, and groups** (monthly or per-session billing with a sessions cap).
- **Daily attendance** per group, with one-tap "mark all present".
- Full finance tracking: **dues, payments, arrears** per student and per teacher, plus filterable, printable general reports.
- Full JSON backup/restore to move data between devices.
- All data is stored **locally in your browser only** — nothing is sent to any server.

### How to Use

1. Open the link above on your phone, then from Chrome/Safari choose **"Add to Home Screen"** to install it as a standalone app — or download [`mobile_index.html`](mobile_index.html) and open it directly on any device, offline.
2. On the **Settings** screen: add educational stages, then subjects per stage, then groups per subject (with teacher, price, and billing type).
3. On the **Teachers** screen: register each teacher.
4. On the **Students** screen: register each student and link them to their stage and groups.
5. On the **Attendance** screen: record daily attendance per group.
6. On the **Finance** screen: record payments and track dues/arrears, or generate general reports.
7. From **Settings**: export a periodic backup to keep your data safe.

### Privacy Note

This is a public GitHub repository used only to host the static page via GitHub Pages — there is no server-side database. All student/teacher/finance data you enter stays inside your own browser's local storage and is never seen by anyone else.

### Idea & Implementation

**Eng\ Mahmoud Abdelrahman Al-Ansary**
