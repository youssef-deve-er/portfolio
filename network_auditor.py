import socket
import requests
from datetime import datetime
import os

try:
    from cryptography.fernet import Fernet
    HAS_CRYPTO = True
except ImportError:
    HAS_CRYPTO = False

def print_banner():
    print("=" * 60)
    print("      Network Security Audit Tool v2.0 - By Youssef")
    print("=" * 60)

def generate_or_load_key():
    """إنشاء أو تحميل مفتاح التشفير لحماية السجلات"""
    if not HAS_CRYPTO:
        return None
    if not os.path.exists("secret.key"):
        key = Fernet.generate_key()
        with open("secret.key", "wb") as key_file:
            key_file.write(key)
    else:
        with open("secret.key", "rb") as key_file:
            key = key_file.read()
    return key

def write_to_log(text_data):
    """كتابة البيانات في ملف سجل عادي، وحفظ نسخة مشفرة منفصلة لحماية الخصوصية"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_entry = f"[{timestamp}] {text_data}\n"
    
    with open("audit_report.log", "a", encoding="utf-8") as log_file:
        log_file.write(log_entry)
        
    if HAS_CRYPTO:
        key = generate_or_load_key()
        fernet = Fernet(key)
        encrypted_entry = fernet.encrypt(log_entry.encode())
        with open("audit_report.enc", "ab") as enc_file:
            enc_file.write(encrypted_entry + b"\n")

def get_target_info():
    """استخراج معلومات الـ IP والشبكة الحالية للهدف"""
    print("\n[+] جاري فحص معلومات الشبكة والاتصال...")
    write_to_log("بدء فحص معلومات الشبكة والاتصال")
    try:
        response = requests.get('https://ipapi.co/json/')
        data = response.json()
        
        ip_info = f"الـ IP الخارجي: {data.get('ip')} | الدولة: {data.get('country_name')} | مزود الخدمة: {data.get('org')}"
        print(f"    - الـ IP الخارجي: {data.get('ip')}")
        print(f"    - الدولة/المدينة: {data.get('country_name')} / {data.get('city')}")
        print(f"    - مزود الخدمة (ISP): {data.get('org')}")
        
        write_to_log(ip_info)
    except Exception as e:
        error_msg = f"تعذر جلب معلومات الـ IP الخارجي: {e}"
        print(f"[-] {error_msg}")
        write_to_log(error_msg)

def scan_ports(target_host):
    """فحص المنافذ الشائعة وتوثيق الثغرات المفتوحة"""
    common_ports = [21, 22, 80, 443, 8080]
    
    try:
        target_ip = socket.gethostbyname(target_host)
        start_msg = f"بدء فحص المنافذ على الهدف: {target_host} ({target_ip})"
        print(f"\n[+] {start_msg}")
        write_to_log(start_msg)
        print("-" * 60)
        
        for port in common_ports:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(1.0)
            result = s.connect_ex((target_ip, port))
            
            if result == 0:
                status = f"المنفذ {port}: مفتوح (OPEN) - ثغرة محتملة!"
                print(f"    [★] {status}")
                write_to_log(status)
            else:
                status = f"المنفذ {port}: مغلق (Closed)"
                print(f"    [-] {status}")
                write_to_log(status)
            s.close()
            
    except socket.gaierror:
        print("\n[-] تعذر الوصول للهدف. تأكد من الاسم.")
        write_to_log(f"خطأ: تعذر الوصول للهدف {target_host}")
    except Exception as e:
        print(f"\n[-] حدث خطأ: {e}")
        write_to_log(f"خطأ غير متوقع: {e}")

if __name__ == "__main__":
    print_banner()
    get_target_info()
    
    target = input("\n[?] أدخل النطاق أو الـ IP المراد فحص منافذه (مثال: localhost): ")
    scan_ports(target)
    
    if HAS_CRYPTO:
        print("\n[+] تم حفظ تقرير الفحص العادي وتشفير النسخة الأمنية بنجاح في المجلد الحلي!")
    else:
        print("\n[+] تم حفظ تقرير الفحص بنجاح! (لتفعيل التشفير الأمني المتقدم قم بتثبيت مكتبة cryptography)")
