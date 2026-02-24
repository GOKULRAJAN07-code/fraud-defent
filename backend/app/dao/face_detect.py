import cv2
import numpy as np

def detect_and_compare_faces(image1_bytes: bytes, image2_bytes: bytes) -> dict:
    """
    1. Loads two images from bytes.
    2. Detects faces using OpenCV Haar Cascades.
    3. Crops to the faces.
    4. Computes a similarity score (using a simple histogram comparison for the demo).
    Returns {"match": bool, "score": float, "error": str}
    """
    
    # Load Haar cascade
    # This cascade file comes with opencv-python
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    face_cascade = cv2.CascadeClassifier(cascade_path)
    
    # helper func
    def get_face_roi(img_bytes):
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return None, "Failed to decode image"
            
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        if len(faces) == 0:
            return None, "No face detected"
            
        # grab the largest face
        faces = sorted(faces, key=lambda x: x[2]*x[3], reverse=True)
        x, y, w, h = faces[0]
        
        # crop and resize to standard
        roi = img[y:y+h, x:x+w]
        roi = cv2.resize(roi, (200, 200))
        return roi, None
        
    face1, err1 = get_face_roi(image1_bytes)
    if err1: return {"match": False, "score": 0.0, "error": f"Image 1: {err1}"}
    
    face2, err2 = get_face_roi(image2_bytes)
    if err2: return {"match": False, "score": 0.0, "error": f"Image 2: {err2}"}
    
    # For a hackathon demo without loading massive deep learning models, 
    # we compute color histograms of the faces and compare them using Bhattacharyya distance or Correlation.
    # In production, use deepface, dlib, or an external API.
    
    # Convert to HSV
    hsv1 = cv2.cvtColor(face1, cv2.COLOR_BGR2HSV)
    hsv2 = cv2.cvtColor(face2, cv2.COLOR_BGR2HSV)
    
    # Calculate histograms
    hist1 = cv2.calcHist([hsv1], [0, 1], None, [50, 60], [0, 180, 0, 256])
    cv2.normalize(hist1, hist1, 0, 1, cv2.NORM_MINMAX)
    
    hist2 = cv2.calcHist([hsv2], [0, 1], None, [50, 60], [0, 180, 0, 256])
    cv2.normalize(hist2, hist2, 0, 1, cv2.NORM_MINMAX)
    
    # Compare
    # CORREL: 1 is perfect match, 0 is no match, -1 is completely mismatched
    score = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
    
    # Threshold for "match"
    is_match = bool(score > 0.6)
    
    return {
        "match": is_match,
        "score": round(float(score), 4),
        "error": None
    }
