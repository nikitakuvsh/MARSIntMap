import subprocess
import sys

def main():
    print('Установка Карты')
    try:
        subprocess.check_call("npm install", shell=True)
        print("✅ Установка прошла успешно")
        input('Нажмите Enter, чтобы выйти из установщика')
    except subprocess.CalledProcessError:
        print("❌ Ошибка при выполнении npm install \nПопробуйте запустить от имени администратора")
        input('Нажмите Enter, чтобы выйти из установщика')
        sys.exit(1)

if __name__ == "__main__":
    main()
