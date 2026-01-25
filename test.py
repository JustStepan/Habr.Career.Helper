from tqdm import tqdm
import time

# Было:
# for i in range(100):

# Стало:
for i in tqdm(range(100), desc="Обработка файлов"):
    time.sleep(0.1)  # Имитация работы