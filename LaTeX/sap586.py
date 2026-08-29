#!/usr/bin/env python3
"""
XeLaTeX one-shot compiler (auto-detect matching .tex file)
Author: Sagar
"""

import subprocess
import os
import sys

# Path to XeLaTeX binary (from your TeX Live installation)
XELATEX_PATH = "/usr/local/texlive/2024/bin/universal-darwin/xelatex"

# === Core compile function ===
def compile_tex(tex_path):
    tex_path = os.path.abspath(tex_path)
    tex_dir = os.path.dirname(tex_path)
    tex_file = os.path.basename(tex_path)

    print(f"\n🔧 Compiling: {tex_file}\n")

    cmd = [XELATEX_PATH, "-interaction=nonstopmode", tex_file]
    result = subprocess.run(
        cmd,
        cwd=tex_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    print(result.stdout)
    print(result.stderr)

    pdf_path = os.path.splitext(tex_path)[0] + ".pdf"
    if result.returncode == 0 and os.path.exists(pdf_path):
        print("✅ PDF generated successfully.")
        clean_aux(tex_dir)
    else:
        print("❌ Compilation failed.")

# === Clean auxiliary files ===
def clean_aux(tex_dir):
    extensions = [".aux", ".log", ".out", ".toc"]
    for ext in extensions:
        for file in os.listdir(tex_dir):
            if file.endswith(ext):
                os.remove(os.path.join(tex_dir, file))
    print("🧹 Cleaned auxiliary files.\n")

# === Main entry ===
if __name__ == "__main__":
    # Determine script name
    script_name = os.path.splitext(os.path.basename(sys.argv[0]))[0]

    # Expected .tex file in same directory
    tex_file = os.path.join(os.getcwd(), f"{script_name}.tex")

    if os.path.exists(tex_file):
        compile_tex(tex_file)
        print("🏁 Task complete. Exiting now.\n")
        os._exit(0)
    else:
        print(f"⚠️ Expected file not found: {script_name}.tex")
        print("Exiting.")
        os._exit(0)
