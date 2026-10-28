import json
from pathlib import Path
from docx import Document
from reportlab.pdfgen import canvas
p=Path('tests/fixtures');p.mkdir(parents=True,exist_ok=True)
text='Research question: How does social connection affect well-being?\nUse at least five peer-reviewed journal articles.\nSources must be published between 2020 and 2025.\nUse APA citation style.'
d=Document()
for line in text.splitlines():d.add_paragraph(line)
d.save(p/'rubric.docx')
c=canvas.Canvas(str(p/'rubric.pdf'))
for i,line in enumerate(text.splitlines()):c.drawString(40,800-i*24,line)
c.save()
(p/'invalid.pdf').write_text('not a pdf')
(p/'unsupported.txt').write_text(text)
