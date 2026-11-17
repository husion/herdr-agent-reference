#!/usr/bin/env python3
"""Install an independent Herdr mod. Does not replace shipped mods or switch layouts."""
import argparse,json,pathlib,shutil,socket,subprocess
p=argparse.ArgumentParser();p.add_argument('--home',type=pathlib.Path,default=pathlib.Path.home()/'.config/herdr-app');p.add_argument('--herdr',default='herdr-app');p.add_argument('--hc',default='hc');a=p.parse_args()
source=pathlib.Path(__file__).resolve().parents[1]/'mod';dest=a.home/'mods/agent-reference'
if dest.exists() and not (dest/'.agent-reference-managed').exists():raise SystemExit('Existing unmanaged mod; inspect it before installing.')
machines=json.loads(subprocess.check_output([a.hc,'machine','ls'],text=True))['machines']
hosts={m['name']:m['host'] for m in machines if m.get('name') and m.get('host')}
dest.mkdir(parents=True,exist_ok=True)
for f in source.iterdir():
 if f.is_file() and f.name!='config.js':shutil.copy2(f,dest/f.name)
(dest/'config.js').write_text('export const SOURCE_HOST = '+json.dumps(socket.gethostname())+';\nexport const MACHINE_HOSTS = '+json.dumps(hosts)+';\n',encoding='utf-8')
(dest/'.agent-reference-managed').write_text('herdr-agent-reference installer\n')
subprocess.run([a.herdr,'check',str(dest)],check=True)
print('Installed. Open with: herdr-app do mod.open --name agent-reference')
