# -*- mode: python ; coding: utf-8 -*-
# PyInstaller spec for Elaina's Birthday
# Build command:  pyinstaller elaina.spec --clean --noconfirm

import os

block_cipher = None

# All static web assets + Jinja2 templates that Flask needs to serve
web_datas = [
    ('index.html',  '.'),
    ('style.css',   '.'),
    ('script.js',   '.'),
    ('assests',     'assests'),
    ('images',      'images'),
    ('music',       'music'),
    ('fonts',       'fonts'),
    ('templates',   'templates'),
    ('anni_1',      'anni_1'),
]

a = Analysis(
    ['app.py'],
    pathex=[],
    binaries=[],
    datas=web_datas,
    hiddenimports=[
        # PyQt6 WebEngine (not always auto-discovered)
        'PyQt6.QtWebEngineWidgets',
        'PyQt6.QtWebEngineCore',
        'PyQt6.QtWebChannel',
        'PyQt6.QtPrintSupport',
        'PyQt6.QtNetwork',
        # dotenv
        'dotenv',
        'dotenv.main',
        'dotenv.compat',
        # Flask + SocketIO
        'flask',
        'flask.templating',
        'flask_socketio',
        'simple_websocket',
        'engineio',
        'engineio.async_drivers.threading',
        'socketio',
        'socketio.exceptions',
        'werkzeug',
        'werkzeug.serving',
        'werkzeug.routing',
        'werkzeug.exceptions',
        'jinja2',
        'jinja2.ext',
        'click',
        'itsdangerous',
        'bidict',
        'pyngrok',
        'pyngrok.ngrok',
        # stdlib
        'http',
        'http.server',
        'http.client',
        'urllib',
        'urllib.parse',
        'mimetypes',
        'posixpath',
        'json',
        # email — required internally by http.server (line 92)
        'email',
        'email.utils',
        'email.message',
        'email.parser',
        'email.feedparser',
        'email.errors',
        'email.header',
        'email.charset',
        'email.encoders',
        'email.generator',
        'email.policy',
        'email._parseaddr',
        'email._header_value_parser',
        'email._encoded_words',
        'email.contentmanager',
        'email.iterators',
        'email.mime',
        'email.mime.base',
        'email.mime.text',
        'email.mime.multipart',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['tkinter', 'unittest', 'pydoc'],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,          # use COLLECT (onedir mode)
    name='App',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,                      # UPX can break Qt DLLs
    console=False,                  # no console window
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=os.path.join('assests', 'gwen_2.ico'),
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='App',
)
