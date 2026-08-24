import os, re

base = os.path.dirname(__file__)
tex_path = os.path.join(base, "sap586.tex")

with open(tex_path) as f:
    tex = f.read()

matches = re.findall(r"\\textsc\{([^}]*)\}", tex)

if len(matches) >= 2:
    with open(os.path.join(base, "About.txt"), "w") as f:
        f.write(matches[0] + "\n" + matches[1])
    print("✅ Updated About.txt")
else:
    print("⚠️ Could not find two textsc lines")
