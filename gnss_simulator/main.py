#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
GNSS接收机仿真系统主程序

该程序是GNSS接收机仿真系统的入口点，负责初始化和协调各个模块的工作。
"""

import os
import sys
import numpy as np
import matplotlib.pyplot as plt
from PyQt5.QtWidgets import QApplication

# 导入自定义模块
from config import SimConfig
from satellite.orbit import SatelliteConstellation
from signal.generator import SignalGenerator
from receiver.acquisition import SignalAcquisition
from receiver.tracking import SignalTracking
from receiver.navigation import NavigationSolution
from gui.main_window import MainWindow


def main():
    """主程序入口函数"""
    # 加载配置
    config = SimConfig()
    print(f"加载配置: {config.sim_name}")
    
    # 初始化卫星星座
    constellation = SatelliteConstellation(config)
    satellites = constellation.get_visible_satellites()
    print(f"可见卫星数量: {len(satellites)}")
    
    # 生成GNSS信号
    signal_gen = SignalGenerator(config, satellites)
    signals = signal_gen.generate()
    print(f"生成信号样本数: {len(signals)}")
    
    # 信号捕获
    acquisition = SignalAcquisition(config)
    acq_results = acquisition.process(signals)
    print(f"捕获到的卫星数量: {len(acq_results)}")
    
    # 信号跟踪
    tracking = SignalTracking(config)
    track_results = tracking.process(signals, acq_results)
    print(f"成功跟踪的卫星数量: {len(track_results)}")
    
    # 导航解算
    nav = NavigationSolution(config)
    position, velocity, time_bias = nav.compute(track_results, satellites)
    print(f"接收机位置: {position}")
    print(f"接收机速度: {velocity}")
    print(f"时钟偏差: {time_bias} ns")
    
    # 启动GUI界面
    app = QApplication(sys.argv)
    window = MainWindow(config, constellation, track_results, position, velocity)
    window.show()
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()