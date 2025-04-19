import numpy as np
import matplotlib.pyplot as plt

def fourier_series_coeffs(f, T, N, num_points=1000):
    """
    计算周期函数f在区间[0, T]上的傅里叶级数前N项系数。
    f: 可调用函数，输入为x，输出为f(x)
    T: 周期
    N: 级数项数（正弦/余弦最大次数）
    num_points: 数值积分采样点数
    返回: a0, an, bn
    """
    x = np.linspace(0, T, num_points, endpoint=False)
    y = f(x)
    a0 = (2 / T) * np.trapz(y, x)
    an = []
    bn = []
    for n in range(1, N+1):
        an.append((2 / T) * np.trapz(y * np.cos(2 * np.pi * n * x / T), x))
        bn.append((2 / T) * np.trapz(y * np.sin(2 * np.pi * n * x / T), x))
    return a0/2, np.array(an), np.array(bn)

def fourier_series_approx(x, T, a0, an, bn):
    """
    根据傅里叶系数重建函数近似值。
    x: 采样点
    T: 周期
    a0, an, bn: 傅里叶系数
    """
    result = a0 * np.ones_like(x)
    for n in range(1, len(an)+1):
        result += an[n-1] * np.cos(2 * np.pi * n * x / T) + bn[n-1] * np.sin(2 * np.pi * n * x / T)
    return result

def demo():
    """
    示例：周期方波的傅里叶级数展开与可视化
    """
    T = 2 * np.pi
    N = 10
    f = lambda x: np.where((x % T) < np.pi, 1, -1)  # 方波
    x = np.linspace(0, T, 1000, endpoint=False)
    y = f(x)
    a0, an, bn = fourier_series_coeffs(f, T, N)
    y_approx = fourier_series_approx(x, T, a0, an, bn)
    plt.figure(figsize=(8,4))
    plt.plot(x, y, label="原函数 f(x)")
    plt.plot(x, y_approx, '--', label=f"傅里叶级数近似 (N={N})")
    plt.legend()
    plt.title("傅里叶级数展开示例：方波")
    plt.xlabel("x")
    plt.ylabel("f(x)")
    plt.grid(True)
    plt.tight_layout()
    plt.show()
    print("a0 =", a0)
    print("an =", an)
    print("bn =", bn)

if __name__ == "__main__":
    demo()