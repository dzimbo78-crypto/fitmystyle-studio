"""Optional AI editorial-preview backend; NO real generative provider is configured.
Cannot claim photorealistic generation until a model provider is enabled and tested.
"""
from fastapi import FastAPI,HTTPException
from pydantic import BaseModel,Field
import os
app=FastAPI(title='FitMyStyle FamilyLook Optional AI',version='2.0')
class Preview(BaseModel):
  people:int=Field(ge=1,le=12)
  outfit_description:str=Field(min_length=5,max_length=400)
  palette:str=Field(max_length=80)
@app.get('/health')
def health():return {'status':'ok','ai_enabled':False}
@app.post('/api/visualize')
def visualize(req:Preview):
  # Safe deterministic fallback belongs in front-end (SVG mockups).
  raise HTTPException(status_code=503,detail='Fotorealistyczny dostawca AI nie jest włączony. Użyj podglądu bazowych szablonów.')