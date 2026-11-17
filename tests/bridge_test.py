import importlib.util,pathlib,unittest,base64,ast,shlex
spec=importlib.util.spec_from_file_location('bridge',pathlib.Path(__file__).parents[1]/'scripts/bridge.py')
b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
class BridgeTests(unittest.TestCase):
 def test_posix_preserves_one_complex_line(self):
  line='printf "%s" "a b"; echo \'quoted\'; $HOME\nnext'
  self.assertEqual(shlex.split(b.remote_command(['ssh','-T','dev'],line,'posix')),['ssh','-T','dev',line])
 def test_windows_native_argv_preserves_quotes_and_unicode(self):
  line='sh -c \'printf "%s" "中文"\'\nexit 0'
  prefix=['wsl.exe','-d','Debian','-e','sh','-lc']
  cmd=b.remote_command(prefix,line,'powershell')
  encoded=cmd.split("b64decode('")[1].split("')")[0]
  payload=base64.b64decode(encoded).decode()
  call=ast.parse(payload).body[1].exc.args[0]
  self.assertEqual(ast.literal_eval(call.args[0]),prefix+[line])
if __name__=='__main__':unittest.main()
