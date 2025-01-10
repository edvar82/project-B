from flask import Flask, request, jsonify
import cv2
import pickle
import os
import io
import json
from PIL import Image
import numpy as np
import extractTemplate as exG

campos_path = os.path.join(os.path.dirname(__file__), 'pkl', 'campos.pkl')
with open(campos_path, 'rb') as arquivo:
    campos = pickle.load(arquivo)

resp_path = os.path.join(os.path.dirname(__file__), 'pkl', 'resp.pkl')
with open(resp_path, 'rb') as arquivo:
    resp = pickle.load(arquivo)

app = Flask(__name__)

@app.route('/answer', methods=['POST'])
def predict():
    correct_answer = json.loads(request.form['correct_answer'])
    files = request.files.getlist('images')  

    respostas_imagens = []

    def tratar_respostas(respostas):
        questoes_dict = {str(i): 'F' for i in range(1, 11)}  
        for resposta in respostas:
            numero_questao = resposta.split('-')[0]  
            if questoes_dict[numero_questao] != 'F': 
                questoes_dict[numero_questao] = 'F'
            else:
                questoes_dict[numero_questao] = resposta.split('-')[1]  
        respostas_tratadas = [f"{num}-{resp}" for num, resp in sorted(questoes_dict.items(), key=lambda x: int(x[0]))]
        return respostas_tratadas

    for file in files:
        file_data = file.read()
        image = Image.open(io.BytesIO(file_data))
        image = image.convert('RGB')
        image_np = np.array(image)
        imagem = cv2.resize(image_np, (600, 700))

        gabarito, bbox = exG.extrairMaiorCtn(imagem)

        # Conversão para escala de cinza
        imgGray = cv2.cvtColor(gabarito, cv2.COLOR_BGR2GRAY)

        # Aplicação de desfoque para remover ruídos e sombras pequenas
        imgBlur = cv2.GaussianBlur(imgGray, (5, 5), 0)

        # Aplicação de Adaptive Threshold para lidar com variações de iluminação
        imgTh = cv2.adaptiveThreshold(imgBlur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, 
                                      cv2.THRESH_BINARY_INV, 11, 2)

        # Operação morfológica de fechamento para remover pequenos ruídos
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        imgTh = cv2.morphologyEx(imgTh, cv2.MORPH_CLOSE, kernel)


        respostas = []
        for id, vg in enumerate(campos):
            x = int(vg[0])
            y = int(vg[1])
            w = int(vg[2])
            h = int(vg[3])

            campo = imgTh[y:y + h, x:x + w]
            height, width = campo.shape[:2]
            tamanho = height * width
            pretos = cv2.countNonZero(campo)
            percentual = round((pretos / tamanho) * 100, 2)

            # Marcar o campo na imagem
            cv2.rectangle(gabarito, (x, y), (x + w, y + h), (0, 255, 0), 2)

            if percentual >= 45:
                respostas.append(resp[id])
        print("Respostas: ", respostas)
        respostas_tratadas = tratar_respostas(respostas)

        acertos = 0
        print("Respostas tratadas: ", respostas_tratadas)
        if len(respostas_tratadas) == len(correct_answer):
            for num, res in enumerate(respostas_tratadas):
                if res == correct_answer[num]:
                    acertos += 1

        respostas_imagens.append({'respostas': respostas, 'acertos': acertos})

    return jsonify({'resultados': respostas_imagens})

@app.route('/', methods=['GET'])
def index():
    return jsonify({'message': 'Hello, World!'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
