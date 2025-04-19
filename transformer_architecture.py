import torch  
import torch.nn as nn  
import torch.nn.functional as F  

class PositionalEncoding(nn.Module):  
    def __init__(self, d_model, dropout=0.1, max_len=5000):  
        super(PositionalEncoding, self).__init__()  
        self.dropout = nn.Dropout(p=dropout)  

        pe = torch.zeros(max_len, d_model)  
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)  
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * -(torch.log(torch.tensor(10000.0)) / d_model))  
        
        pe[:, 0::2] = torch.sin(position * div_term)  
        pe[:, 1::2] = torch.cos(position * div_term)  
        pe = pe.unsqueeze(0)  # Shape: (1, max_len, d_model)  
        self.register_buffer('pe', pe)  

    def forward(self, x):  
        x = x + self.pe[:, :x.size(1)]  
        return self.dropout(x)  

class MultiHeadAttention(nn.Module):  
    def __init__(self, d_model, num_heads):  
        super(MultiHeadAttention, self).__init__()  
        self.d_model = d_model  
        self.num_heads = num_heads  
        self.depth = d_model // num_heads  

        self.wq = nn.Linear(d_model, d_model)  
        self.wk = nn.Linear(d_model, d_model)  
        self.wv = nn.Linear(d_model, d_model)  
        self.dense = nn.Linear(d_model, d_model)  

    def split_heads(self, x):  
        batch_size = x.size(0)  
        x = x.view(batch_size, -1, self.num_heads, self.depth)  
        return x.transpose(1, 2)  # Shape: (batch_size, num_heads, seq_len, depth)  

    def forward(self, v, k, q, mask):  
        q = self.split_heads(self.wq(q))  # (batch_size, num_heads, seq_len, depth)  
        k = self.split_heads(self.wk(k))  # (batch_size, num_heads, seq_len, depth)  
        v = self.split_heads(self.wv(v))  # (batch_size, num_heads, seq_len, depth)  

        # Scaled dot-product attention  
        score = torch.matmul(q, k.transpose(-2, -1)) / (self.depth ** 0.5)  
        if mask is not None:  
            score += (mask * -1e9)  
        attention_weights = F.softmax(score, dim=-1)  

        output = torch.matmul(attention_weights, v)  # Shape: (batch_size, num_heads, seq_len, depth)  
        output = output.transpose(1, 2).contiguous()  # (batch_size, seq_len, num_heads, depth)  
        output = output.view(output.size(0), -1, self.d_model)  # (batch_size, seq_len, d_model)  

        return self.dense(output)  

class PositionwiseFeedForward(nn.Module):  
    def __init__(self, d_model, d_ff, dropout=0.1):  
        super(PositionwiseFeedForward, self).__init__()  
        self.linear1 = nn.Linear(d_model, d_ff)  
        self.dropout = nn.Dropout(dropout)  
        self.linear2 = nn.Linear(d_ff, d_model)  

    def forward(self, x):  
        return self.linear2(self.dropout(F.relu(self.linear1(x))))  

class EncoderLayer(nn.Module):  
    def __init__(self, d_model, num_heads, d_ff, dropout=0.1):  
        super(EncoderLayer, self).__init__()  
        self.mha = MultiHeadAttention(d_model, num_heads)  
        self.ffn = PositionwiseFeedForward(d_model, d_ff, dropout)  
        self.layernorm1 = nn.LayerNorm(d_model)  
        self.layernorm2 = nn.LayerNorm(d_model)  
        self.dropout1 = nn.Dropout(dropout)  
        self.dropout2 = nn.Dropout(dropout)  

    def forward(self, x, mask):  
        attn_output = self.mha(x, x, x, mask)  
        x = self.layernorm1(x + self.dropout1(attn_output))  
        ffn_output = self.ffn(x)  
        return self.layernorm2(x + self.dropout2(ffn_output))  

class Encoder(nn.Module):  
    def __init__(self, num_layers, d_model, num_heads, d_ff, input_vocab_size, max_seq_len, dropout=0.1):  
        super(Encoder, self).__init__()  
        self.d_model = d_model  
        self.num_layers = num_layers  
        self.embedding = nn.Embedding(input_vocab_size, d_model)  
        self.pos_encoding = PositionalEncoding(d_model, dropout, max_seq_len)  

        self.enc_layers = nn.ModuleList([  
            EncoderLayer(d_model, num_heads, d_ff, dropout) for _ in range(num_layers)  
        ])  
        self.dropout = nn.Dropout(dropout)  

    def forward(self, x, mask):  
        seq_len = x.size(1)  
        x = self.embedding(x)  # Shape: (batch_size, seq_len, d_model)  
        x = self.pos_encoding(x)  

        for i in range(self.num_layers):  
            x = self.enc_layers[i](x,mask)  

        return x  
        
class DecoderLayer(nn.Module):
    def __init__(self, d_model, num_heads, d_ff, dropout=0.1):
        super(DecoderLayer, self).__init__()
        self.mha1 = MultiHeadAttention(d_model, num_heads)
        self.mha2 = MultiHeadAttention(d_model, num_heads)
        self.ffn = PositionwiseFeedForward(d_model, d_ff, dropout)
        self.layernorm1 = nn.LayerNorm(d_model)
        self.layernorm2 = nn.LayerNorm(d_model)
        self.layernorm3 = nn.LayerNorm(d_model)
        self.dropout1 = nn.Dropout(dropout)
        self.dropout2 = nn.Dropout(dropout)
        self.dropout3 = nn.Dropout(dropout)

    def forward(self, x, enc_output, look_ahead_mask, padding_mask):
        attn1 = self.mha1(x, x, x, look_ahead_mask)
        out1 = self.layernorm1(x + self.dropout1(attn1))
        attn2 = self.mha2(enc_output, enc_output, out1, padding_mask)
        out2 = self.layernorm2(out1 + self.dropout2(attn2))
        ffn_output = self.ffn(out2)
        return self.layernorm3(out2 + self.dropout3(ffn_output))

class Decoder(nn.Module):
    def __init__(self, num_layers, d_model, num_heads, d_ff, target_vocab_size, max_seq_len, dropout=0.1):
        super(Decoder, self).__init__()
        self.d_model = d_model
        self.num_layers = num_layers
        self.embedding = nn.Embedding(target_vocab_size, d_model)
        self.pos_encoding = PositionalEncoding(d_model, dropout, max_seq_len)
        self.dec_layers = nn.ModuleList([
            DecoderLayer(d_model, num_heads, d_ff, dropout) for _ in range(num_layers)
        ])
        self.dropout = nn.Dropout(dropout)

    def forward(self, x, enc_output, look_ahead_mask, padding_mask):
        seq_len = x.size(1)
        x = self.embedding(x)
        x = self.pos_encoding(x)

        for i in range(self.num_layers):
            x = self.dec_layers[i](x, enc_output, look_ahead_mask, padding_mask)
        return x

class Transformer(nn.Module):
    def __init__(self, num_layers, d_model, num_heads, d_ff, input_vocab_size, target_vocab_size, max_seq_len, dropout=0.1):
        super(Transformer, self).__init__()
        self.encoder = Encoder(num_layers, d_model, num_heads, d_ff, input_vocab_size, max_seq_len, dropout)
        self.decoder = Decoder(num_layers, d_model, num_heads, d_ff, target_vocab_size, max_seq_len, dropout)
        self.final_layer = nn.Linear(d_model, target_vocab_size)

    def forward(self, inp, tar, enc_mask, look_ahead_mask, dec_mask):
        enc_output = self.encoder(inp, enc_mask)
        dec_output = self.decoder(tar, enc_output, look_ahead_mask, dec_mask)
        final_output = self.final_layer(dec_output)
        return final_output

    def generate(self, start_token, max_length, temperature=1.0, top_k=None):
        self.eval()
        tokens = [start_token]
        for _ in range(max_length):
            inp = torch.tensor([tokens], dtype=torch.long)
            with torch.no_grad():
                logits = self.forward(inp, inp, None, None, None)[0, -1, :]
                logits = logits / temperature
                if top_k is not None:
                    v, _ = torch.topk(logits, top_k)
                    logits[logits < v[-1]] = -float('Inf')
                probs = F.softmax(logits, dim=-1)
                next_token = torch.multinomial(probs, num_samples=1).item()
                tokens.append(next_token)
        return tokens  

# Example usage  
if __name__ == "__main__":  
    sample_input = torch.randint(0, 100, (64, 10))  # Batch of 64, sequence length of 10  
    transformer = Transformer(num_layers=4, d_model=128, num_heads=8, d_ff=512, input_vocab_size=100, output_vocab_size=100, max_seq_len=10)  
    
    output = transformer(sample_input, None)  # Forward pass, no mask  
    print(output.shape)  # Should output: (64, 10, 100)