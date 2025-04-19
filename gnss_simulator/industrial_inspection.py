import cv2
import numpy as np

class IndustrialInspector:
    def __init__(self, image_path):
        self.image_path = image_path
        self.image = cv2.imread(image_path)
        if self.image is None:
            raise ValueError(f"无法加载图像: {image_path}")

    def detect_edges(self, low_threshold=50, high_threshold=150):
        gray = cv2.cvtColor(self.image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, low_threshold, high_threshold)
        return edges

    def find_contours(self, edges):
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        return contours

    def draw_contours(self, contours):
        output = self.image.copy()
        cv2.drawContours(output, contours, -1, (0,255,0), 2)
        return output

    def run_inspection(self, show_result=True):
        edges = self.detect_edges()
        contours = self.find_contours(edges)
        result_img = self.draw_contours(contours)
        if show_result:
            cv2.imshow('检测结果', result_img)
            cv2.waitKey(0)
            cv2.destroyAllWindows()
        return result_img, len(contours)

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("用法: python industrial_inspection.py <image_path>")
        sys.exit(1)
    inspector = IndustrialInspector(sys.argv[1])
    result_img, num = inspector.run_inspection()
    print(f"检测到轮廓数量: {num}")