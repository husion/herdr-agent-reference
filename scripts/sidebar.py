"""Add the reference context action to a user-owned clone of the current agent list."""
import json, pathlib, subprocess

def install(home, herdr):
    def command(action, **args):
        subprocess.run([herdr, 'do', action, json.dumps(args)], check=True)
    status=json.loads(subprocess.check_output([herdr,'status'],text=True))
    active=status['layout']
    name=active if active.endswith('-agent-reference') else active+'-agent-reference'
    layout=home/'layouts'/f'{active}.json'
    tree=json.loads(layout.read_text(encoding='utf-8'))
    mods=[]
    def scan(node):
        if isinstance(node,dict):
            if isinstance(node.get('mod'),str) and node['mod'].startswith('agents'):mods.append(node['mod'])
            for value in node.values():scan(value)
        elif isinstance(node,list):
            for value in node:scan(value)
    scan(tree)
    if len(set(mods)) != 1:raise SystemExit('Expected one agents mod in active layout; integrate manually.')
    original=mods[0];custom=original if original.endswith('-reference') else original+'-reference'
    dest=home/'mods'/custom
    marker=dest/'.agent-reference-sidebar-managed'
    if dest.exists() and not marker.exists():raise SystemExit('Existing unmanaged sidebar mod: '+str(dest))
    source=home/'mods'/original/'main.js'
    text=source.read_text(encoding='utf-8')
    anchor='.id(`ag-${a.address}`)'
    hook='.on_mouse_down("right", (_e, cx) => { cx.stop_propagation(); openOverlay({ mod: "agent-reference", kind: "popup", width: 140, props: { referenceTarget: a } }); })'
    if hook not in text and text.count(anchor)!=2:raise SystemExit('Agent row anchors changed; refusing unsafe patch.')
    if not dest.exists():command('mod.clone',name=original,**{'as':custom})
    text=(dest/'main.js').read_text(encoding='utf-8')
    if hook not in text:text=text.replace(anchor,anchor+'\n          '+hook)
    child_anchor='.id(`sub-${k.address}`)'
    child_hook=hook.replace('referenceTarget: a', 'referenceTarget: { ...k, title: k.title || k.name || k.address }')
    if child_hook not in text:
        if text.count(child_anchor)!=1:raise SystemExit('Sub-agent row anchor changed; refusing unsafe patch.')
        text=text.replace(child_anchor,child_anchor+'\n      '+child_hook)
    (dest/'main.js').write_text(text,encoding='utf-8');marker.write_text('Managed context-menu integration\n')
    subprocess.run([herdr,'check',str(dest)],check=True)
    output=home/'layouts'/f'{name}.json'
    if name!=active and output.exists():raise SystemExit('Target layout already exists; inspect before replacing.')
    if name!=active:command('layout.clone',name=active,**{'as':name})
    tree=json.loads(output.read_text(encoding='utf-8'))
    def patch(node):
        if isinstance(node,dict):
            if node.get('mod')==original:node['mod']=custom
            for value in node.values():patch(value)
        elif isinstance(node,list):
            for value in node:patch(value)
    patch(tree);output.write_text(json.dumps(tree,indent=2)+'\n',encoding='utf-8')
    command('layout.switch',name=name)
    print('Sidebar reference menu enabled; original layout: '+active)
