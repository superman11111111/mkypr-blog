from http.server import HTTPServer, BaseHTTPRequestHandler
from http.client import HTTPMessage
import shutil
import os
import random
import time
import hashlib


def get_uuid():
    alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
    seed = ''.join([random.choice(alphabet) for i in range(32)])
    m = hashlib.md5()
    m.update(seed.encode('utf-8'))
    uuid = f'{m.hexdigest()}{str(int(time.time()))[-8:]}'
    return uuid


class Bookkeeper:
    def __init__(self) -> None:
        self.valid_uuids = set()

    def add_uuid(self, uuid):
        return self.valid_uuids.add(uuid)

    def is_valid_uuid(self, uuid):
        return uuid in self.valid_uuids

    def is_correct_pass(self, password):
        if password == 'cool':
            return True
        return False


class RequestHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)

    def valid_paths(self):
        return {
            '/': ('text/html', 'html/index.html'),
            '/login': ('text/html', 'html/login.html'),
            '/substances': ('text/html', 'html/substances.html'),
            '/css/index.css': ('text/css', 'css/index.css')}

    def do_GET(self, *args):
        if self.path in self.valid_paths():
            content_length = os.path.getsize(self.valid_paths()[self.path][1])
            self.send_response(200)
            self.send_header(
                'Content-Type', f'{self.valid_paths()[self.path][0]}; charset=utf-8')
            self.send_header('Content-Length', str(content_length))
            self.end_headers()
            self.flush_headers()
            shutil.copyfileobj(
                open(self.valid_paths()[self.path][1], 'rb'), self.wfile)
        elif self.path.startswith('/dashboard'):
            global BK
            if BK.is_valid_uuid(self.path.split('/')[2]):
                content_length = os.path.getsize('html/dashboard.html')
                self.send_response(200)
                self.send_header(
                    'Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(content_length))
                self.end_headers()
                self.flush_headers()
                shutil.copyfileobj(
                    open('html/dashboard.html', 'rb'), self.wfile)
            else:
                content_length = os.path.getsize('html/error403.html')
                self.send_response(403)
                self.send_header(
                    'Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(content_length))
                self.end_headers()
                self.flush_headers()
                shutil.copyfileobj(
                    open('html/error403.html', 'rb'), self.wfile)
        else:
            content_length = os.path.getsize('html/error404.html')
            self.send_response(404)
            self.send_header(
                'Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(content_length))
            self.end_headers()
            self.flush_headers()
            shutil.copyfileobj(open('html/error404.html', 'rb'), self.wfile)

    def do_POST(self, *args):
        content_len = int(self.headers.get(('content-length')))
        body = self.rfile.read(content_len)
        key, password = body.decode('utf-8').split('=')
        if key != 'password':
            self.send_error(400, 'invalid post request data')
            return

        global BK
        if BK.is_correct_pass(password):
            uuid = get_uuid()
            BK.add_uuid(uuid)
            self.send_response(301)
            self.send_header('Location', f'/dashboard/{uuid}')
            self.end_headers()
            self.flush_headers()
            self.wfile.write(uuid.encode('utf-8'))
        else:
            self.send_error(401, 'wrong password')


BK = Bookkeeper()
PORT = 8000
server = HTTPServer(('', PORT), RequestHandler)
print(f'http://localhost:{PORT}')
server.serve_forever()
