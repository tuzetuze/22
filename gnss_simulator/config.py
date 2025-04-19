#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
GNSS接收机仿真系统配置模块

该模块包含仿真系统的所有配置参数，包括卫星系统选择、信号参数、接收机参数等。
"""

import os
import numpy as np
from datetime import datetime


class SimConfig:
    """仿真系统配置类"""
    
    def __init__(self, config_file=None):
        """初始化配置参数
        
        Args:
            config_file: 配置文件路径，如果为None则使用默认配置
        """
        # 仿真基本参数
        self.sim_name = "GNSS接收机仿真系统"
        self.sim_time = datetime.now()
        self.duration = 60  # 仿真时长(秒)
        
        # 卫星系统配置
        self.constellation = {
            "GPS": True,      # 是否包含GPS卫星
            "BEIDOU": True,   # 是否包含北斗卫星
            "GLONASS": False, # 是否包含GLONASS卫星
            "GALILEO": False  # 是否包含Galileo卫星
        }
        
        # 接收机初始位置(ECEF坐标系，单位：米)
        self.receiver_position = np.array([-2267804.0, 5009342.0, 3220991.0])  # 默认位置：北京
        self.receiver_velocity = np.array([0.0, 0.0, 0.0])  # 默认静止
        
        # 接收机时钟参数
        self.clock_bias = 0.0      # 时钟偏差(秒)
        self.clock_drift = 1.0e-9  # 时钟漂移(秒/秒)
        
        # 信号参数
        self.sampling_freq = 16.0e6  # 采样频率(Hz)
        self.intermediate_freq = 4.0e6  # 中频(Hz)
        self.signal_length = 4.0e-3  # 信号长度(秒)
        
        # GPS信号参数
        self.gps_params = {
            "l1_freq": 1575.42e6,  # L1频率(Hz)
            "code_length": 1023,   # C/A码长度
            "code_freq": 1.023e6,  # C/A码频率(Hz)
            "data_freq": 50.0      # 导航电文频率(Hz)
        }
        
        # 北斗信号参数
        self.beidou_params = {
            "b1_freq": 1561.098e6,  # B1频率(Hz)
            "code_length": 2046,    # B1I码长度
            "code_freq": 2.046e6,   # B1I码频率(Hz)
            "data_freq": 50.0       # 导航电文频率(Hz)
        }
        
        # 信号处理参数
        self.acquisition_params = {
            "threshold": 2.5,        # 捕获阈值
            "doppler_range": 5000,   # 多普勒搜索范围(Hz)
            "doppler_step": 500     # 多普勒搜索步长(Hz)
        }
        
        self.tracking_params = {
            "dll_bandwidth": 2.0,    # DLL环路带宽(Hz)
            "pll_bandwidth": 15.0,   # PLL环路带宽(Hz)
            "integration_time": 1.0e-3  # 相干积分时间(秒)
        }
        
        # 导航解算参数
        self.navigation_params = {
            "elevation_mask": 10.0,  # 高度角掩码(度)
            "max_iterations": 10,    # 最大迭代次数
            "convergence_threshold": 1.0e-6  # 收敛阈值(米)
        }
        
        # 噪声和误差模型
        self.noise_params = {
            "cn0_db": 45.0,          # 载噪比(dB-Hz)
            "multipath": True,       # 是否模拟多径效应
            "ionosphere": True,      # 是否模拟电离层延迟
            "troposphere": True      # 是否模拟对流层延迟
        }
        
        # GUI配置
        self.gui_params = {
            "update_rate": 1.0,      # 界面更新频率(Hz)
            "plot_skyplot": True,    # 是否显示天空图
            "plot_cn0": True,        # 是否显示载噪比图
            "plot_position": True    # 是否显示位置图
        }
        
        # 如果提供了配置文件，则从文件加载配置
        if config_file and os.path.exists(config_file):
            self.load_from_file(config_file)
    
    def load_from_file(self, config_file):
        """从文件加载配置
        
        Args:
            config_file: 配置文件路径
        """
        # 这里可以实现从JSON、YAML等格式的配置文件加载参数
        pass
    
    def save_to_file(self, config_file):
        """保存配置到文件
        
        Args:
            config_file: 配置文件路径
        """
        # 这里可以实现将配置保存为JSON、YAML等格式的文件
        pass
    
    def __str__(self):
        """返回配置的字符串表示"""
        return f"{self.sim_name} - {self.sim_time}"


def main():
    """当直接运行配置模块时的入口函数"""
    config = SimConfig()
    print(f"\n{'-'*50}")
    print(f"配置信息: {config}")
    print(f"仿真时长: {config.duration} 秒")
    print(f"卫星系统: {', '.join([sys for sys, enabled in config.constellation.items() if enabled])}")
    print(f"接收机位置: {config.receiver_position} (ECEF坐标系)")
    print(f"采样频率: {config.sampling_freq/1e6} MHz")
    print(f"中频: {config.intermediate_freq/1e6} MHz")
    print(f"{'-'*50}\n")
    print("提示: 要启动完整的仿真系统，请运行 main.py")

if __name__ == "__main__":
    main()