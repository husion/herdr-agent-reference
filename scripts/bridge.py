"""Byte-transparent SSH transport for an explicitly configured hc --via connection.

No hc exec: that API buffers output and limits duration, so it cannot carry a Core stream.
Remote command arguments are quoted for the actual remote shell, never interpolated raw.
"""
import argparse, base64, os, shlex, subprocess

def remote_command(prefix, line, shell):
    args = [*prefix, line]
    if shell == 'powershell':
        # PowerShell 5 re-quotes native arguments lossy (embedded quotes in hc probes).
        # Let Python construct the Windows command line from the exact argv instead.
        import json
        payload = 'import subprocess;raise SystemExit(subprocess.call(' + repr(args) + '))'
        encoded = base64.b64encode(payload.encode()).decode('ascii')
        return 'py -3 -c "exec(__import__(\'base64\').b64decode(\'' + encoded + '\'))"'
    return shlex.join(args)

def main():
    import json
    p = argparse.ArgumentParser()
    p.add_argument('--host', required=True)
    p.add_argument('--shell', choices=['posix', 'powershell'], default='posix')
    p.add_argument('--prefix', required=True, help='JSON argv to execute on the SSH host')
    p.add_argument('line')
    a = p.parse_args()
    prefix = json.loads(a.prefix)
    if not isinstance(prefix, list) or not prefix or not all(isinstance(x, str) for x in prefix):
        p.error('prefix must be a nonempty string argv')
    command = ['ssh', '-T', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10', '-o', 'ServerAliveInterval=15', a.host,
               remote_command(prefix, a.line, a.shell)]
    # Inherit raw stdin/stdout: frames must not be decoded, buffered or decorated.
    if os.name == 'nt':
        raise SystemExit(subprocess.call(command))
    os.execvp(command[0], command)

if __name__ == '__main__':
    main()
