"""Offline GLES3 proof: compiles the shipped shaders and renders the shipped indexed meshes.
No browser/network/window system is involved. This does not certify browser or Windows behavior.
"""
import ctypes as C
import json
import math
import pathlib
import sys
import numpy as np
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent.parent
OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / 'qa/polygon'
DATA = json.loads((OUT / 'runtime-polygons.json').read_text())
E = C.CDLL('libEGL.so.1')
E.eglGetProcAddress.argtypes = [C.c_char_p]
E.eglGetProcAddress.restype = C.c_void_p


def func(name, result, *args):
    p = E.eglGetProcAddress(name.encode())
    if not p:
        raise RuntimeError('Missing graphics function: ' + name)
    return C.CFUNCTYPE(result, *args)(p)


I, U, F, P = C.c_int, C.c_uint, C.c_float, C.c_void_p
display = func('eglGetPlatformDisplayEXT', P, U, P, C.POINTER(I))(0x31DD, None, None)
major, minor = I(), I()
assert func('eglInitialize', U, P, C.POINTER(I), C.POINTER(I))(display, C.byref(major), C.byref(minor))
assert func('eglBindAPI', U, U)(0x30A0)
attrs = (I * 15)(0x3033, 1, 0x3040, 0x0040, 0x3024, 8, 0x3023, 8, 0x3022, 8, 0x3021, 8, 0x3025, 24, 0x3038)
cfg, count = P(), I()
assert func('eglChooseConfig', U, P, C.POINTER(I), C.POINTER(P), I, C.POINTER(I))(display, attrs, C.byref(cfg), 1, C.byref(count)) and count.value
W, H = 1800, 1200
surface = func('eglCreatePbufferSurface', P, P, P, C.POINTER(I))(display, cfg, (I * 5)(0x3057, W, 0x3056, H, 0x3038))
context = func('eglCreateContext', P, P, P, P, C.POINTER(I))(display, cfg, None, (I * 3)(0x3098, 3, 0x3038))
assert surface and context
assert func('eglMakeCurrent', U, P, P, P, P)(display, surface, surface, context)

get_string = func('glGetString', C.c_char_p, U)
create_shader = func('glCreateShader', U, U)
shader_source = func('glShaderSource', None, U, I, C.POINTER(C.c_char_p), C.POINTER(I))
compile_shader = func('glCompileShader', None, U)
get_shader = func('glGetShaderiv', None, U, U, C.POINTER(I))
shader_log = func('glGetShaderInfoLog', None, U, I, C.POINTER(I), C.c_char_p)


def shader(kind, source):
    s = create_shader(kind)
    text = C.c_char_p(source.encode())
    shader_source(s, 1, C.byref(text), None)
    compile_shader(s)
    ok = I()
    get_shader(s, 0x8B81, C.byref(ok))
    if not ok.value:
        b = C.create_string_buffer(10000)
        shader_log(s, 10000, None, b)
        raise RuntimeError(b.value.decode())
    return s


program = func('glCreateProgram', U)()
attach = func('glAttachShader', None, U, U)
attach(program, shader(0x8B31, DATA['shaders']['vertex']))
attach(program, shader(0x8B30, DATA['shaders']['fragment']))
func('glLinkProgram', None, U)(program)
linked = I()
func('glGetProgramiv', None, U, U, C.POINTER(I))(program, 0x8B82, C.byref(linked))
if not linked.value:
    raise RuntimeError('Program link failed')
func('glUseProgram', None, U)(program)
loc = func('glGetUniformLocation', I, U, C.c_char_p)
uniforms = {k: loc(program, k.encode()) for k in ['uView', 'uLight', 'uDepth', 'uDay', 'uAtlas', 'uShadow', 'uLamps[0]', 'uLampCount']}
u1i = func('glUniform1i', None, I, I)
u1f = func('glUniform1f', None, I, F)
# Experimental material lab: only set on explicit proof fixtures. Baseline remains unchanged.
if 'lab' in DATA:
    lab = DATA['lab']
    u1i(loc(program, b'uLabEnabled'), int(bool(lab.get('enabled', False))))
    u1i(loc(program, b'uLabLighting'), 1 if lab.get('lighting') == 'moon' else 0)
    u1f(loc(program, b'uFilmStrength'), float(lab.get('strength', 0.0)))
    u1f(loc(program, b'uFilmThickness'), float(lab.get('thickness', 510.0)))
    u1f(loc(program, b'uFilmRoughness'), float(lab.get('roughness', .22)))
u4f = func('glUniform4f', None, I, F, F, F, F)
matrix = func('glUniformMatrix4fv', None, I, I, U, P)
lm = np.array(DATA['light'], dtype='f4')
matrix(uniforms['uLight'], 1, 0, lm.ctypes.data)
gen_buffers = func('glGenBuffers', None, I, C.POINTER(U))
bind_buffer = func('glBindBuffer', None, U, U)
buffer_data = func('glBufferData', None, U, C.c_ssize_t, P, U)
gen_vao = func('glGenVertexArrays', None, I, C.POINTER(U))
bind_vao = func('glBindVertexArray', None, U)
attrib = func('glVertexAttribPointer', None, U, I, U, U, I, P)
enable_attrib = func('glEnableVertexAttribArray', None, U)
divisor = func('glVertexAttribDivisor', None, U, U)
draw = func('glDrawElementsInstanced', None, U, I, U, P, I)
active_texture = func('glActiveTexture', None, U)
gen_texture = func('glGenTextures', None, I, C.POINTER(U))
bind_texture = func('glBindTexture', None, U, U)
tex_image = func('glTexImage2D', None, U, I, I, I, I, I, U, U, P)
tex_parameter = func('glTexParameteri', None, U, U, I)
gen_fbo = func('glGenFramebuffers', None, I, C.POINTER(U))
bind_fbo = func('glBindFramebuffer', None, U, U)
viewport = func('glViewport', None, I, I, I, I)
clear = func('glClear', None, U)
get_error = func('glGetError', U)


def texture():
    t = U()
    gen_texture(1, C.byref(t))
    bind_texture(0x0DE1, t)
    return t


active_texture(0x84C0)
atlas = texture()
pixels = np.zeros((512, 1024, 4), dtype='u1')
seed = 73421
for yy in range(512):
    for xx in range(1024):
        seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF
        noise = seed / 4294967296 - .5
        k, u, v = xx // 256 + 4 * (yy // 256), xx % 256, yy % 256
        value = .69 + noise * .055
        if k == 1:
            value += math.sin(v * .18 + math.sin(u * .025) * 2.7) * .055 + math.sin(v * .05 + math.sin(u * .05)) * .04
        if k == 2:
            value += (.045 if (u % 4 < 2) == (v % 4 < 2) else -.04) + noise * .04
        if k == 3:
            value += math.sin(u * .18 + v * .09) * math.sin(v * .21) * .025 + noise * .07
        if k == 5:
            value += noise * .15 + math.sin(u * .04 + v * .07) * .035
        pixels[yy, xx] = [round(max(.2, min(1, value)) * 255)] * 3 + [255]
tex_image(0x0DE1, 0, 0x1908, 1024, 512, 0, 0x1908, 0x1401, pixels.ctypes.data)
func('glGenerateMipmap', None, U)(0x0DE1)
tex_parameter(0x0DE1, 0x2801, 0x2703)
tex_parameter(0x0DE1, 0x2800, 0x2601)
active_texture(0x84C1)
shadow = texture()
tex_image(0x0DE1, 0, 0x81A6, 2048, 2048, 0, 0x1902, 0x1405, None)
for name, value in [(0x2801, 0x2600), (0x2800, 0x2600), (0x2802, 0x812F), (0x2803, 0x812F)]:
    tex_parameter(0x0DE1, name, value)
fbo = U()
gen_fbo(1, C.byref(fbo))
bind_fbo(0x8D40, fbo)
func('glFramebufferTexture2D', None, U, U, U, U, I)(0x8D40, 0x8D00, 0x0DE1, shadow, 0)
func('glDrawBuffers', None, I, C.POINTER(U))(1, (U * 1)(0))
func('glReadBuffer', None, U)(0)
assert func('glCheckFramebufferStatus', U, U)(0x8D40) == 0x8CD5
func('glEnable', None, U)(0x0B71)
func('glDepthFunc', None, U)(0x0203)
u1i(uniforms['uAtlas'], 0)
u1i(uniforms['uShadow'], 1)
u1f(uniforms['uDay'], .96)
scale, tx, ty = .88, W / 2 - 128 * .88, H / 2 - 410 * .88
u4f(uniforms['uView'], 2 * scale / W, -2 * scale / H, 2 * tx / W - 1, 1 - 2 * ty / H)
results = []
for zone, groups in DATA['scenes'].items():
    if zone in DATA.get('views', {}):
        v = DATA['views'][zone]
        sc = v['scale']
        px, py = v['center']
        u4f(uniforms['uView'], 2*sc/W, -2*sc/H, -2*px*sc/W, 2*py*sc/H)
    lamps = DATA.get('lamps', {}).get(zone, [])
    values = np.zeros((4, 4), dtype='f4')
    for ii, lamp in enumerate(lamps[:4]):
        values[ii] = lamp
    func('glUniform4fv', None, I, I, P)(uniforms['uLamps[0]'], 4, values.ctypes.data)
    u1i(uniforms['uLampCount'], len(lamps))
    u1f(uniforms['uDay'], 1 if zone == 'courtyard' else .96)
    nodes = [n for group in groups for n in group['nodes'] if not n.get('blind')]
    batches = []
    for key, geom in DATA['geometry'].items():
        parts = [n for n in nodes if n.get('g', 'round') == key]
        if not parts:
            continue
        vao = U()
        gen_vao(1, C.byref(vao))
        bind_vao(vao)
        buf = (U * 3)()
        gen_buffers(3, buf)
        verts = np.array(geom['vertices'], dtype='f4')
        ids = np.array(geom['indices'], dtype='u2')
        inst = np.array([n['p'] + n['s'] + n.get('r', [0, 0, 0]) + n['c'] + [n.get('m', 0), n.get('e', 0)] for n in parts], dtype='f4')
        bind_buffer(0x8892, buf[0])
        buffer_data(0x8892, verts.nbytes, verts.ctypes.data, 0x88E4)
        for at, offset in [(0, 0), (1, 12)]:
            enable_attrib(at)
            attrib(at, 3, 0x1406, 0, 24, offset)
        bind_buffer(0x8893, buf[1])
        buffer_data(0x8893, ids.nbytes, ids.ctypes.data, 0x88E4)
        bind_buffer(0x8892, buf[2])
        buffer_data(0x8892, inst.nbytes, inst.ctypes.data, 0x88E4)
        for at, size, offset in [(2, 3, 0), (3, 3, 3), (4, 3, 6), (5, 3, 9), (6, 2, 12)]:
            enable_attrib(at)
            attrib(at, size, 0x1406, 0, 56, offset * 4)
            divisor(at, 1)
        batches.append((vao, len(ids), len(parts), buf))
    active_texture(0x84C1)
    bind_texture(0x0DE1, atlas)
    bind_fbo(0x8D40, fbo)
    viewport(0, 0, 2048, 2048)
    clear(0x0100)
    u1i(uniforms['uDepth'], 1)
    for vao, count, instances, _ in batches:
        bind_vao(vao)
        draw(4, count, 0x1403, None, instances)
    bind_fbo(0x8D40, 0)
    bind_texture(0x0DE1, shadow)
    u1i(uniforms['uDepth'], 0)
    viewport(0, 0, W, H)
    func('glClearColor', None, F, F, F, F)(0, 0, 0, 0)
    clear(0x4000 | 0x0100)
    for vao, count, instances, _ in batches:
        bind_vao(vao)
        draw(4, count, 0x1403, None, instances)
    image = np.zeros((H, W, 4), dtype='u1')
    func('glReadPixels', None, I, I, I, I, U, U, P)(0, 0, W, H, 0x1908, 0x1401, image.ctypes.data)
    pic = Image.fromarray(np.flipud(image), 'RGBA')
    if zone in DATA.get('views', {}):
        pic.save(OUT / (zone + '-alpha.png'))
    yy, xx = np.mgrid[0:H, 0:W]
    t = np.clip(np.sqrt(((xx - W / 2) / W) ** 2 + ((yy - H * .45) / H) ** 2), 0, 1)[..., None]
    bg = np.concatenate([((1 - t) * np.array([194, 198, 176]) + t * np.array([105, 129, 108])).astype('u1'), np.full((H, W, 1), 255, dtype='u1')], axis=2)
    Image.alpha_composite(Image.fromarray(bg, 'RGBA'), pic).convert('RGB').save(OUT / (zone + '-polygon-proof.png'))
    error = get_error()
    results.append({'zone': zone, 'nodes': len(nodes), 'triangles': sum(count // 3 * instances for _, count, instances, _ in batches), 'drawCalls': len(batches) * 2, 'glError': error, 'nonemptyPixels': int(np.count_nonzero(image[:, :, 3]))})
    assert error == 0 and results[-1]['nonemptyPixels'] > 10000
    for vao, _, _, bufs in batches:
        func('glDeleteBuffers', None, I, C.POINTER(U))(3, bufs)
        func('glDeleteVertexArrays', None, I, C.POINTER(U))(1, C.byref(vao))
report = {'graphics': get_string(0x1F02).decode(), 'device': get_string(0x1F01).decode(), 'shaders': 'compiled and linked', 'scenes': results, 'browser': 'NOT VERIFIED: browser launch blocked by process socket restriction'}
(OUT / 'graphics-results.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
