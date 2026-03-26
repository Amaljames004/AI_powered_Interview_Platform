# SkillHire Scorer — Usage

## Load the model:
```python
from model import InterviewScorer
from transformers import RobertaTokenizer
import torch

tokenizer = RobertaTokenizer.from_pretrained("roberta-base")
model = InterviewScorer()
model.load_state_dict(torch.load("weights.pt", map_location="cpu"))
model.eval()

def score(question, answer):
    text = f"Question: {question} Answer: {answer}"
    inputs = tokenizer(text, return_tensors="pt", max_length=256, truncation=True, padding=True)
    with torch.no_grad():
        preds = model(**inputs)
    return {k: round(v.item() * 9 + 1, 1) for k, v in preds.items()}
```
