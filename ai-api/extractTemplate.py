import cv2
import numpy as np

def extrairMaiorCtn(img):
    imgGray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    imgBlur = cv2.GaussianBlur(imgGray, (5, 5), 0)
    imgTh = cv2.adaptiveThreshold(imgBlur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 12)
    kernel = np.ones((2, 2), np.uint8)
    imgDil = cv2.dilate(imgTh, kernel)
    contours, _ = cv2.findContours(imgDil, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    filtered_contours = [cnt for cnt in contours if cv2.contourArea(cnt) > 1000]
    
    maiorCtn = max(filtered_contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(maiorCtn)
    bbox = [x, y, w, h]
    recorte = img[y:y+h, x:x+w]
    recorte = cv2.resize(recorte, (400, 500))
    
    return recorte, bbox