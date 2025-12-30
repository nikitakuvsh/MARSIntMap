import subprocess
import sys

def main():
    print('Запускаем Карту, браузер откроется автоматически')
    try:
        subprocess.check_call("npm start", shell=True)
        input()
    except subprocess.CalledProcessError:
        print("❌ Ошибка при выполнении npm start")
        sys.exit(1)

if __name__ == "__main__":
    main()
