
import torch
import torch.nn as nn
from transformers import RobertaModel

class InterviewScorer(nn.Module):
    def __init__(self, model_name="roberta-base", dropout=0.1):
        super().__init__()
        self.roberta = RobertaModel.from_pretrained(model_name)
        hidden = self.roberta.config.hidden_size
        def make_head():
            return nn.Sequential(
                nn.Linear(hidden, 256), nn.ReLU(),
                nn.Dropout(dropout), nn.Linear(256, 1), nn.Sigmoid()
            )
        self.technical     = make_head()
        self.communication = make_head()
        self.confidence    = make_head()
        self.logic         = make_head()
        self.traits        = make_head()
        self.dropout       = nn.Dropout(dropout)

    def forward(self, input_ids, attention_mask):
        out = self.roberta(input_ids=input_ids, attention_mask=attention_mask)
        cls = self.dropout(out.last_hidden_state[:, 0, :])
        return {
            "technical":     self.technical(cls).squeeze(-1),
            "communication": self.communication(cls).squeeze(-1),
            "confidence":    self.confidence(cls).squeeze(-1),
            "logic":         self.logic(cls).squeeze(-1),
            "traits":        self.traits(cls).squeeze(-1),
        }
