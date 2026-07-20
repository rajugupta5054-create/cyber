import urllib.request, sys
sys.stdout.reconfigure(encoding='utf-8')
content = urllib.request.urlopen('http://127.0.0.1:5000/').read().decode('utf-8')
idx = content.find('section-dark')
print(content[idx:idx+80])
idx2 = content.find('id="phone"')
print('id=phone at position:', idx2, '| chars around:', content[idx2-30:idx2+40])
