# Transformer架构实现

这个项目提供了Transformer架构的完整Python实现，基于PyTorch框架。Transformer是一种基于自注意力机制的神经网络架构，由论文《Attention Is All You Need》(Vaswani et al., 2017)首次提出，现已广泛应用于自然语言处理和其他序列任务。

## 项目结构

- `transformer_architecture.py`: 包含Transformer架构的完整实现

## 核心组件

1. **位置编码 (Positional Encoding)**
   - 为序列中的每个位置添加位置信息
   - 使用正弦和余弦函数的组合生成编码

2. **多头自注意力机制 (Multi-Head Attention)**
   - 将输入分割成多个头，每个头独立执行注意力计算
   - 允许模型关注来自不同表示子空间的信息

3. **前馈神经网络 (Feed Forward Network)**
   - 由两个线性变换组成，中间有ReLU激活函数

4. **编码器层 (Encoder Layer)**
   - 包含多头自注意力机制和前馈网络
   - 使用残差连接和层归一化

5. **解码器层 (Decoder Layer)**
   - 包含掩码多头自注意力、交叉注意力和前馈网络
   - 同样使用残差连接和层归一化

6. **完整的Transformer模型**
   - 结合编码器和解码器
   - 适用于序列到序列的任务

## 使用方法

```python
# 导入Transformer模型
from transformer_architecture import Transformer

# 创建模型实例
model = Transformer(
    src_vocab_size=5000,  # 源语言词汇表大小
    tgt_vocab_size=5000,  # 目标语言词汇表大小
    d_model=512,          # 模型维度
    n_heads=8,            # 注意力头数量
    d_ff=2048,            # 前馈网络维度
    n_layers=6,           # 编码器/解码器层数
    dropout=0.1,          # Dropout比率
    max_seq_len=100       # 最大序列长度
)

# 准备输入数据
import torch

batch_size = 2
src = torch.randint(1, 5000, (batch_size, 10))  # 源序列
tgt = torch.randint(1, 5000, (batch_size, 12))  # 目标序列

# 前向传播
output = model(src, tgt)  # 输出形状: [batch_size, tgt_len, tgt_vocab_size]
```

## 应用场景

Transformer架构适用于多种序列处理任务，包括但不限于：

- 机器翻译
- 文本摘要
- 文本生成
- 语音识别
- 时间序列预测
- 图像描述生成

## 注意事项

- 训练Transformer模型通常需要大量的数据和计算资源
- 对于较长序列，可能需要考虑注意力机制的计算复杂度问题
- 在实际应用中，可能需要根据具体任务调整模型参数