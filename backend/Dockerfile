# 1. Get a fresh, lightweight Linux computer with Python 3.13 installed
FROM python:3.13-slim

# 2. Tell Linux to install the exact C-library Prisma needs
RUN apt-get update && apt-get install -y libatomic1

# 3. Create a folder inside this new computer called /app
WORKDIR /app

# 4. Copy your requirements list into the /app folder
COPY requirements.txt .

# 5. Tell Python to install everything on that list (FastAPI, Uvicorn, Prisma)
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy ALL your other backend files (main.py, schema.prisma) into /app
COPY . .

# 7. Generate the Prisma Client (This will finally succeed!)
RUN prisma generate

# 8. Start the FastAPI server using Railway's dynamic port
CMD uvicorn main:app --host 0.0.0.0 --port $PORT