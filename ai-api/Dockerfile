FROM python:3.10

WORKDIR /usr/src/app

# Instalar a biblioteca libgl1-mesa-glx
RUN apt-get update && apt-get install -y libgl1-mesa-glx

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .

CMD [ "python3","./app.py" ]