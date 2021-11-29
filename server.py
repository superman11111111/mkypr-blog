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
        self.threads = set()

    def add_uuid(self, uuid):
        return self.valid_uuids.add(uuid)

    def is_valid_uuid(self, uuid):
        return uuid in self.valid_uuids

    def is_correct_pass(self, password):
        if password == 'cool':
            return True
        return False

    def start_thread(self, thread):
        thread.start()
        self.threads.add(thread)


class Route:
    def __init__(self, path, type, file) -> None:
        self.path = path
        self.type = type 
        self.file = file

class HtmlRoute(Route):
    def __init__(self, path, file) -> None:
        super().__init__(path, 'text/html', file)
        
class CssRoute(Route):
    def __init__(self, path, file) -> None:
        super().__init__(path, 'text/css', file)

class ImgRoute(Route):
    def __init__(self, path, file) -> None:
        super().__init__(path, 'image/png', file)


class RequestHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs) -> None:
        self.dirs = {}
        self.dirs['base'] = os.path.dirname(os.path.realpath(__file__))
        self.dirs['html'] = os.path.join(self.dirs['base'], 'html')
        self.dirs['css'] = os.path.join(self.dirs['base'], 'css')
        self.dirs['img'] = os.path.join(self.dirs['base'], 'img')
        self.dirs['js'] = os.path.join(self.dirs['base'], 'js')

        super().__init__(*args, **kwargs)

    def valid_routes(self):
        return [
            HtmlRoute('/', 'index.html'),
            HtmlRoute('/login', 'login.html'),
            HtmlRoute('/substances', 'substances.html'),
            HtmlRoute('/art', 'art.html'),
            HtmlRoute('/trader', 'trader.html'),
            CssRoute('/css/index.css', 'index.css'),
            ImgRoute('/img/1.png', '1.png')]

    def valid_paths(self):
        dd = {}
        for r in self.valid_routes():
            dd[r.path] = r
        return dd

    def do_GET(self, *args):
        def send_file(file: str, type: str, code: int) -> None:
            content_length = os.path.getsize(file)
            self.send_response(code)
            self.send_header(
                'Content-Type', f'{type}; charset=utf-8')
            self.send_header('Content-Length', str(content_length))
            self.end_headers()
            self.flush_headers()
            shutil.copyfileobj(open(file, 'rb'), self.wfile)
            return None 

        def send_html(html_file: str, code: int) -> None:
            return send_file(html_file, 'text/html', code)


        valid_paths = self.valid_paths()
        if self.path in valid_paths:
            type_dict = {'text/html': 'html', 'text/css': 'css', 'image/png': 'img'}
            route = valid_paths[self.path]
            parent_dir = self.dirs[type_dict[route.type]]
            file_path = os.path.join(parent_dir, route.file)
            return send_file(file_path, route.type, 200)
        elif self.path.startswith('/dashboard'):
            path_split = self.path.split('/')
            print(path_split)
            if len(path_split) > 2:
                global BK
                if BK.is_valid_uuid(path_split[2]):
                    return send_html('html/dashboard.html', 200)
                return send_html('html/error403.html', 403)
        elif self.path.startswith('/js'):
            path_split = self.path.split('/')
            script_name = path_split[2]
            js_dir = self.dirs['js']
            for sn in os.listdir(js_dir):
                if script_name == sn:
                    file_path = os.path.join(js_dir, script_name)
                    return send_file(file_path, 'text/javascript', 200)
        return send_html('html/error404.html', 404)

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


def serve_proxies():
    pass


BK = Bookkeeper()
PORT = 8000
server = HTTPServer(('', PORT), RequestHandler)
print(f'http://localhost:{PORT}')
from threading import Thread
t = Thread(target=serve_proxies, args=( ))
BK.start_thread(t)
server.serve_forever()

