import cv2
import numpy as np

def extrairMaiorCtn(img):
    imgGray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    imgBlur = cv2.GaussianBlur(imgGray, (7, 7), 0)
    
    imgCanny = cv2.Canny(imgBlur, 50, 150)
    
    kernel = np.ones((5,5), np.uint8)
    imgDil = cv2.dilate(imgCanny, kernel, iterations=2)
    
    contours, _ = cv2.findContours(imgDil, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    maxArea = 0
    screenCnt = None
    
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > 5000:
            peri = cv2.arcLength(cnt, True)
            approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)
            
            if len(approx) == 4 and area > maxArea:
                screenCnt = approx
                maxArea = area
    
    if screenCnt is None:
        return img, [0,0,img.shape[1],img.shape[0]]
    
    pts = screenCnt.reshape(4, 2)
    rect = np.zeros((4, 2), dtype="float32")
    
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    
    width, height = 400, 500
    dst = np.array([
        [0, 0],
        [width - 1, 0],
        [width - 1, height - 1],
        [0, height - 1]], dtype="float32")
    
    M = cv2.getPerspectiveTransform(rect, dst)
    recorte = cv2.warpPerspective(img, M, (width, height))
    
    return recorte, [0, 0, width, height]