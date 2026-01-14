#!/usr/bin/env python3
import json
import os

root = os.path.dirname(os.path.dirname(__file__))
input_path = os.path.join(root, 'data', 'inventory.json')
backup_path = input_path + '.bak'

# backup
with open(input_path, 'r', encoding='utf-8') as f:
    original = f.read()
with open(backup_path, 'w', encoding='utf-8') as f:
    f.write(original)

# load and reformat
with open(input_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

lines = []
for obj in data:
    # compact each object to a single line, keep readable spacing after commas
    lines.append(json.dumps(obj, ensure_ascii=False, separators=(', ', ': ')))

out = '[\n' + ',\n'.join('  ' + line for line in lines) + '\n]\n'

with open(input_path, 'w', encoding='utf-8') as f:
    f.write(out)

print(f'Reformatted {input_path}, backup saved to {backup_path}')
