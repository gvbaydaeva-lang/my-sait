/* LiquidEther — vanilla JS port for hero background (react-bits) */
(function (global) {
  'use strict';

  const face_vert = `
  attribute vec3 position;
  uniform vec2 px;
  uniform vec2 boundarySpace;
  varying vec2 uv;
  precision highp float;
  void main(){
    vec3 pos = position;
    vec2 scale = 1.0 - boundarySpace * 2.0;
    pos.xy = pos.xy * scale;
    uv = vec2(0.5)+(pos.xy)*0.5;
    gl_Position = vec4(pos, 1.0);
  }`;

  const line_vert = `
  attribute vec3 position;
  uniform vec2 px;
  precision highp float;
  varying vec2 uv;
  void main(){
    vec3 pos = position;
    uv = 0.5 + pos.xy * 0.5;
    vec2 n = sign(pos.xy);
    pos.xy = abs(pos.xy) - px * 1.0;
    pos.xy *= n;
    gl_Position = vec4(pos, 1.0);
  }`;

  const mouse_vert = `
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  uniform vec2 center;
  uniform vec2 scale;
  uniform vec2 px;
  varying vec2 vUv;
  void main(){
    vec2 pos = position.xy * scale * 2.0 * px + center;
    vUv = uv;
    gl_Position = vec4(pos, 0.0, 1.0);
  }`;

  const advection_frag = `
  precision highp float;
  uniform sampler2D velocity;
  uniform float dt;
  uniform bool isBFECC;
  uniform vec2 fboSize;
  uniform vec2 px;
  varying vec2 uv;
  void main(){
    vec2 ratio = max(fboSize.x, fboSize.y) / fboSize;
    if(isBFECC == false){
      vec2 vel = texture2D(velocity, uv).xy;
      vec2 uv2 = uv - vel * dt * ratio;
      vec2 newVel = texture2D(velocity, uv2).xy;
      gl_FragColor = vec4(newVel, 0.0, 0.0);
    } else {
      vec2 spot_new = uv;
      vec2 vel_old = texture2D(velocity, uv).xy;
      vec2 spot_old = spot_new - vel_old * dt * ratio;
      vec2 vel_new1 = texture2D(velocity, spot_old).xy;
      vec2 spot_new2 = spot_old + vel_new1 * dt * ratio;
      vec2 error = spot_new2 - spot_new;
      vec2 spot_new3 = spot_new - error / 2.0;
      vec2 vel_2 = texture2D(velocity, spot_new3).xy;
      vec2 spot_old2 = spot_new3 - vel_2 * dt * ratio;
      vec2 newVel2 = texture2D(velocity, spot_old2).xy;
      gl_FragColor = vec4(newVel2, 0.0, 0.0);
    }
  }`;

  const color_frag = `
  precision highp float;
  uniform sampler2D velocity;
  uniform sampler2D palette;
  uniform vec4 bgColor;
  varying vec2 uv;
  void main(){
    vec2 vel = texture2D(velocity, uv).xy;
    float lenv = clamp(length(vel), 0.0, 1.0);
    vec3 c = texture2D(palette, vec2(lenv, 0.5)).rgb;
    vec3 outRGB = mix(bgColor.rgb, c, lenv);
    float outA = mix(bgColor.a, 1.0, lenv);
    gl_FragColor = vec4(outRGB, outA);
  }`;

  const divergence_frag = `
  precision highp float;
  uniform sampler2D velocity;
  uniform float dt;
  uniform vec2 px;
  varying vec2 uv;
  void main(){
    float x0 = texture2D(velocity, uv-vec2(px.x, 0.0)).x;
    float x1 = texture2D(velocity, uv+vec2(px.x, 0.0)).x;
    float y0 = texture2D(velocity, uv-vec2(0.0, px.y)).y;
    float y1 = texture2D(velocity, uv+vec2(0.0, px.y)).y;
    float divergence = (x1 - x0 + y1 - y0) / 2.0;
    gl_FragColor = vec4(divergence / dt);
  }`;

  const externalForce_frag = `
  precision highp float;
  uniform vec2 force;
  uniform vec2 center;
  uniform vec2 scale;
  uniform vec2 px;
  varying vec2 vUv;
  void main(){
    vec2 circle = (vUv - 0.5) * 2.0;
    float d = 1.0 - min(length(circle), 1.0);
    d *= d;
    gl_FragColor = vec4(force * d, 0.0, 1.0);
  }`;

  const poisson_frag = `
  precision highp float;
  uniform sampler2D pressure;
  uniform sampler2D divergence;
  uniform vec2 px;
  varying vec2 uv;
  void main(){
    float p0 = texture2D(pressure, uv + vec2(px.x * 2.0, 0.0)).r;
    float p1 = texture2D(pressure, uv - vec2(px.x * 2.0, 0.0)).r;
    float p2 = texture2D(pressure, uv + vec2(0.0, px.y * 2.0)).r;
    float p3 = texture2D(pressure, uv - vec2(0.0, px.y * 2.0)).r;
    float div = texture2D(divergence, uv).r;
    float newP = (p0 + p1 + p2 + p3) / 4.0 - div;
    gl_FragColor = vec4(newP);
  }`;

  const pressure_frag = `
  precision highp float;
  uniform sampler2D pressure;
  uniform sampler2D velocity;
  uniform vec2 px;
  uniform float dt;
  varying vec2 uv;
  void main(){
    float step = 1.0;
    float p0 = texture2D(pressure, uv + vec2(px.x * step, 0.0)).r;
    float p1 = texture2D(pressure, uv - vec2(px.x * step, 0.0)).r;
    float p2 = texture2D(pressure, uv + vec2(0.0, px.y * step)).r;
    float p3 = texture2D(pressure, uv - vec2(0.0, px.y * step)).r;
    vec2 v = texture2D(velocity, uv).xy;
    vec2 gradP = vec2(p0 - p1, p2 - p3) * 0.5;
    v = v - gradP * dt;
    gl_FragColor = vec4(v, 0.0, 1.0);
  }`;

  const viscous_frag = `
  precision highp float;
  uniform sampler2D velocity;
  uniform sampler2D velocity_new;
  uniform float v;
  uniform vec2 px;
  uniform float dt;
  varying vec2 uv;
  void main(){
    vec2 old = texture2D(velocity, uv).xy;
    vec2 new0 = texture2D(velocity_new, uv + vec2(px.x * 2.0, 0.0)).xy;
    vec2 new1 = texture2D(velocity_new, uv - vec2(px.x * 2.0, 0.0)).xy;
    vec2 new2 = texture2D(velocity_new, uv + vec2(0.0, px.y * 2.0)).xy;
    vec2 new3 = texture2D(velocity_new, uv - vec2(0.0, px.y * 2.0)).xy;
    vec2 newv = 4.0 * old + v * dt * (new0 + new1 + new2 + new3);
    newv /= 4.0 * (1.0 + v * dt);
    gl_FragColor = vec4(newv, 0.0, 0.0);
  }`;

  function makePaletteTexture(stops) {
    const arr = Array.isArray(stops) && stops.length ? (stops.length === 1 ? [stops[0], stops[0]] : stops) : ['#ffffff', '#ffffff'];
    const w = arr.length;
    const data = new Uint8Array(w * 4);
    for (let i = 0; i < w; i++) {
      const c = new THREE.Color(arr[i]);
      data[i * 4] = Math.round(c.r * 255);
      data[i * 4 + 1] = Math.round(c.g * 255);
      data[i * 4 + 2] = Math.round(c.b * 255);
      data[i * 4 + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  }

  class ShaderPass {
    constructor(props) {
      this.props = props || {};
      this.uniforms = this.props.material?.uniforms;
      this.scene = null;
      this.camera = null;
      this.material = null;
      this.geometry = null;
      this.plane = null;
    }
    init() {
      this.scene = new THREE.Scene();
      this.camera = new THREE.Camera();
      if (this.uniforms) {
        this.material = new THREE.RawShaderMaterial(this.props.material);
        this.geometry = new THREE.PlaneGeometry(2, 2);
        this.plane = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.plane);
      }
    }
    update() {
      Common.renderer.setRenderTarget(this.props.output || null);
      Common.renderer.render(this.scene, this.camera);
      Common.renderer.setRenderTarget(null);
    }
  }

  let Common;
  let Mouse;

  class Advection extends ShaderPass {
    constructor(simProps) {
      super({
        material: {
          vertexShader: face_vert,
          fragmentShader: advection_frag,
          uniforms: {
            boundarySpace: { value: simProps.cellScale },
            px: { value: simProps.cellScale },
            fboSize: { value: simProps.fboSize },
            velocity: { value: simProps.src.texture },
            dt: { value: simProps.dt },
            isBFECC: { value: true }
          }
        },
        output: simProps.dst
      });
      this.uniforms = this.props.material.uniforms;
      this.init();
    }
    init() {
      super.init();
      const boundaryG = new THREE.BufferGeometry();
      boundaryG.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        -1, -1, 0, -1, 1, 0, -1, 1, 0, 1, 1, 0, 1, 1, 0, 1, -1, 0, 1, -1, 0, -1, -1, 0
      ]), 3));
      this.line = new THREE.LineSegments(boundaryG, new THREE.RawShaderMaterial({
        vertexShader: line_vert,
        fragmentShader: advection_frag,
        uniforms: this.uniforms
      }));
      this.scene.add(this.line);
    }
    update({ dt, isBounce, BFECC }) {
      this.uniforms.dt.value = dt;
      this.line.visible = isBounce;
      this.uniforms.isBFECC.value = BFECC;
      super.update();
    }
  }

  class ExternalForce extends ShaderPass {
    constructor(simProps) {
      super({ output: simProps.dst });
      this.init(simProps);
    }
    init(simProps) {
      super.init();
      const mouseM = new THREE.RawShaderMaterial({
        vertexShader: mouse_vert,
        fragmentShader: externalForce_frag,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        uniforms: {
          px: { value: simProps.cellScale },
          force: { value: new THREE.Vector2(0, 0) },
          center: { value: new THREE.Vector2(0, 0) },
          scale: { value: new THREE.Vector2(simProps.cursor_size, simProps.cursor_size) }
        }
      });
      this.mouse = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mouseM);
      this.scene.add(this.mouse);
    }
    update(props) {
      const forceX = (Mouse.diff.x / 2) * props.mouse_force;
      const forceY = (Mouse.diff.y / 2) * props.mouse_force;
      const cursorSizeX = props.cursor_size * props.cellScale.x;
      const cursorSizeY = props.cursor_size * props.cellScale.y;
      const centerX = Math.min(Math.max(Mouse.coords.x, -1 + cursorSizeX + props.cellScale.x * 2), 1 - cursorSizeX - props.cellScale.x * 2);
      const centerY = Math.min(Math.max(Mouse.coords.y, -1 + cursorSizeY + props.cellScale.y * 2), 1 - cursorSizeY - props.cellScale.y * 2);
      const u = this.mouse.material.uniforms;
      u.force.value.set(forceX, forceY);
      u.center.value.set(centerX, centerY);
      u.scale.value.set(props.cursor_size, props.cursor_size);
      super.update();
    }
  }

  class Viscous extends ShaderPass {
    constructor(simProps) {
      super({
        material: {
          vertexShader: face_vert,
          fragmentShader: viscous_frag,
          uniforms: {
            boundarySpace: { value: simProps.boundarySpace },
            velocity: { value: simProps.src.texture },
            velocity_new: { value: simProps.dst_.texture },
            v: { value: simProps.viscous },
            px: { value: simProps.cellScale },
            dt: { value: simProps.dt }
          }
        },
        output: simProps.dst,
        output0: simProps.dst_,
        output1: simProps.dst
      });
      this.init();
    }
    update({ viscous, iterations, dt }) {
      let fbo_in, fbo_out, fbo_out_final;
      this.uniforms.v.value = viscous;
      for (let i = 0; i < iterations; i++) {
        fbo_in = i % 2 === 0 ? this.props.output0 : this.props.output1;
        fbo_out = i % 2 === 0 ? this.props.output1 : this.props.output0;
        this.uniforms.velocity_new.value = fbo_in.texture;
        this.props.output = fbo_out;
        this.uniforms.dt.value = dt;
        super.update();
        fbo_out_final = fbo_out;
      }
      return fbo_out_final;
    }
  }

  class Divergence extends ShaderPass {
    constructor(simProps) {
      super({
        material: {
          vertexShader: face_vert,
          fragmentShader: divergence_frag,
          uniforms: {
            boundarySpace: { value: simProps.boundarySpace },
            velocity: { value: simProps.src.texture },
            px: { value: simProps.cellScale },
            dt: { value: simProps.dt }
          }
        },
        output: simProps.dst
      });
      this.init();
    }
    update({ vel }) {
      this.uniforms.velocity.value = vel.texture;
      super.update();
    }
  }

  class Poisson extends ShaderPass {
    constructor(simProps) {
      super({
        material: {
          vertexShader: face_vert,
          fragmentShader: poisson_frag,
          uniforms: {
            boundarySpace: { value: simProps.boundarySpace },
            pressure: { value: simProps.dst_.texture },
            divergence: { value: simProps.src.texture },
            px: { value: simProps.cellScale }
          }
        },
        output: simProps.dst,
        output0: simProps.dst_,
        output1: simProps.dst
      });
      this.init();
    }
    update({ iterations }) {
      let p_in, p_out, p_out_final;
      for (let i = 0; i < iterations; i++) {
        p_in = i % 2 === 0 ? this.props.output0 : this.props.output1;
        p_out = i % 2 === 0 ? this.props.output1 : this.props.output0;
        this.uniforms.pressure.value = p_in.texture;
        this.props.output = p_out;
        super.update();
        p_out_final = p_out;
      }
      return p_out_final;
    }
  }

  class Pressure extends ShaderPass {
    constructor(simProps) {
      super({
        material: {
          vertexShader: face_vert,
          fragmentShader: pressure_frag,
          uniforms: {
            boundarySpace: { value: simProps.boundarySpace },
            pressure: { value: simProps.src_p.texture },
            velocity: { value: simProps.src_v.texture },
            px: { value: simProps.cellScale },
            dt: { value: simProps.dt }
          }
        },
        output: simProps.dst
      });
      this.init();
    }
    update({ vel, pressure }) {
      this.uniforms.velocity.value = vel.texture;
      this.uniforms.pressure.value = pressure.texture;
      super.update();
    }
  }

  class Simulation {
    constructor(options) {
      this.options = {
        iterations_poisson: 32,
        iterations_viscous: 32,
        mouse_force: 20,
        resolution: 0.5,
        cursor_size: 100,
        viscous: 30,
        isBounce: false,
        dt: 0.014,
        isViscous: false,
        BFECC: true,
        ...options
      };
      this.fbos = { vel_0: null, vel_1: null, vel_viscous0: null, vel_viscous1: null, div: null, pressure_0: null, pressure_1: null };
      this.fboSize = new THREE.Vector2();
      this.cellScale = new THREE.Vector2();
      this.boundarySpace = new THREE.Vector2();
      this.init();
    }
    getFloatType() {
      const gl = Common.renderer && Common.renderer.getContext();
      if (!gl) return THREE.HalfFloatType;
      if (gl.getExtension('OES_texture_half_float') && gl.getExtension('WEBGL_color_buffer_half_float')) {
        return THREE.HalfFloatType;
      }
      if (gl.getExtension('OES_texture_float') && gl.getExtension('WEBGL_color_buffer_float')) {
        return THREE.FloatType;
      }
      return THREE.HalfFloatType;
    }
    getFboFilter(type) {
      const gl = Common.renderer.getContext();
      if (type === THREE.FloatType && gl.getExtension('OES_texture_float_linear')) {
        return THREE.LinearFilter;
      }
      if (type === THREE.HalfFloatType && gl.getExtension('OES_texture_half_float_linear')) {
        return THREE.LinearFilter;
      }
      return THREE.NearestFilter;
    }
    createAllFBO() {
      const type = this.getFloatType();
      const filter = this.getFboFilter(type);
      const opts = {
        type,
        depthBuffer: false,
        stencilBuffer: false,
        minFilter: filter,
        magFilter: filter,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping
      };
      for (const key in this.fbos) {
        this.fbos[key] = new THREE.WebGLRenderTarget(this.fboSize.x, this.fboSize.y, opts);
      }
    }
    createShaderPass() {
      this.advection = new Advection({ cellScale: this.cellScale, fboSize: this.fboSize, dt: this.options.dt, src: this.fbos.vel_0, dst: this.fbos.vel_1 });
      this.externalForce = new ExternalForce({ cellScale: this.cellScale, cursor_size: this.options.cursor_size, dst: this.fbos.vel_1 });
      this.viscous = new Viscous({ cellScale: this.cellScale, boundarySpace: this.boundarySpace, viscous: this.options.viscous, src: this.fbos.vel_1, dst: this.fbos.vel_viscous1, dst_: this.fbos.vel_viscous0, dt: this.options.dt });
      this.divergence = new Divergence({ cellScale: this.cellScale, boundarySpace: this.boundarySpace, src: this.fbos.vel_viscous0, dst: this.fbos.div, dt: this.options.dt });
      this.poisson = new Poisson({ cellScale: this.cellScale, boundarySpace: this.boundarySpace, src: this.fbos.div, dst: this.fbos.pressure_1, dst_: this.fbos.pressure_0 });
      this.pressure = new Pressure({ cellScale: this.cellScale, boundarySpace: this.boundarySpace, src_p: this.fbos.pressure_0, src_v: this.fbos.vel_viscous0, dst: this.fbos.vel_0, dt: this.options.dt });
    }
    calcSize() {
      const width = Math.max(1, Math.round(this.options.resolution * Common.width));
      const height = Math.max(1, Math.round(this.options.resolution * Common.height));
      this.cellScale.set(1 / width, 1 / height);
      this.fboSize.set(width, height);
    }
    init() {
      this.calcSize();
      this.createAllFBO();
      this.createShaderPass();
    }
    resize() {
      this.calcSize();
      for (const key in this.fbos) this.fbos[key].setSize(this.fboSize.x, this.fboSize.y);
    }
    update() {
      this.boundarySpace.copy(this.options.isBounce ? new THREE.Vector2(0, 0) : this.cellScale);
      this.advection.update({ dt: this.options.dt, isBounce: this.options.isBounce, BFECC: this.options.BFECC });
      this.externalForce.update({ cursor_size: this.options.cursor_size, mouse_force: this.options.mouse_force, cellScale: this.cellScale });
      let vel = this.fbos.vel_1;
      if (this.options.isViscous) {
        vel = this.viscous.update({ viscous: this.options.viscous, iterations: this.options.iterations_viscous, dt: this.options.dt });
      }
      this.divergence.update({ vel });
      const pressure = this.poisson.update({ iterations: this.options.iterations_poisson });
      this.pressure.update({ vel, pressure });
    }
  }

  class AutoDriver {
    constructor(mouse, manager, opts) {
      this.mouse = mouse;
      this.manager = manager;
      this.enabled = opts.enabled;
      this.speed = opts.speed;
      this.resumeDelay = opts.resumeDelay || 3000;
      this.rampDurationMs = (opts.rampDuration || 0) * 1000;
      this.active = false;
      this.current = new THREE.Vector2(0, 0);
      this.target = new THREE.Vector2();
      this.lastTime = performance.now();
      this.activationTime = 0;
      this.margin = 0.2;
      this._tmpDir = new THREE.Vector2();
      this.pickNewTarget();
    }
    pickNewTarget() {
      const r = Math.random;
      this.target.set((r() * 2 - 1) * (1 - this.margin), (r() * 2 - 1) * (1 - this.margin));
    }
    forceStop() {
      this.active = false;
      this.mouse.isAutoActive = false;
    }
    update() {
      if (!this.enabled) return;
      const now = performance.now();
      if (now - this.manager.lastUserInteraction < this.resumeDelay) {
        if (this.active) this.forceStop();
        return;
      }
      if (this.mouse.isHoverInside) {
        if (this.active) this.forceStop();
        return;
      }
      if (!this.active) {
        this.active = true;
        this.current.copy(this.mouse.coords);
        this.lastTime = now;
        this.activationTime = now;
      }
      this.mouse.isAutoActive = true;
      let dtSec = (now - this.lastTime) / 1000;
      this.lastTime = now;
      if (dtSec > 0.2) dtSec = 0.016;
      const dir = this._tmpDir.subVectors(this.target, this.current);
      const dist = dir.length();
      if (dist < 0.01) {
        this.pickNewTarget();
        return;
      }
      dir.normalize();
      let ramp = 1;
      if (this.rampDurationMs > 0) {
        const t = Math.min(1, (now - this.activationTime) / this.rampDurationMs);
        ramp = t * t * (3 - 2 * t);
      }
      this.current.addScaledVector(dir, Math.min(this.speed * dtSec * ramp, dist));
      this.mouse.setNormalized(this.current.x, this.current.y);
    }
  }

  class LiquidEtherApp {
    constructor(container, options = {}) {
      if (!container || typeof THREE === 'undefined') return;

      this.container = container;
      this.options = {
        colors: ['#C4A882', '#E6E1D8', '#A89576'],
        mouseForce: 20,
        cursorSize: 100,
        isViscous: true,
        viscous: 30,
        iterationsViscous: 32,
        iterationsPoisson: 32,
        dt: 0.014,
        BFECC: true,
        resolution: 0.5,
        isBounce: false,
        autoDemo: true,
        autoSpeed: 0.5,
        autoIntensity: 2.2,
        takeoverDuration: 0.25,
        autoResumeDelay: 3000,
        autoRampDuration: 0.6,
        ...options
      };

      this.raf = null;
      this.running = false;
      this.isVisible = true;
      this.resizeRaf = null;

      container.classList.add('liquid-ether-container');
      container.style.position = container.style.position || 'relative';
      container.style.overflow = container.style.overflow || 'hidden';

      const paletteTex = makePaletteTexture(this.options.colors);
      const bgVec4 = new THREE.Vector4(0, 0, 0, 0);

      Common = {
        width: 0, height: 0, aspect: 1, pixelRatio: 1,
        container: null, renderer: null, clock: null,
        init(el) {
          this.container = el;
          this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
          this.resize();

          try {
            if (typeof THREE.WebGL1Renderer === 'function') {
              this.renderer = new THREE.WebGL1Renderer({
                alpha: true,
                antialias: true,
                premultipliedAlpha: false
              });
            } else {
              const canvas = document.createElement('canvas');
              const gl =
                canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false }) ||
                canvas.getContext('experimental-webgl');
              if (!gl) throw new Error('WebGL unavailable');
              this.renderer = new THREE.WebGLRenderer({ canvas, context: gl, alpha: true, antialias: true });
            }

            this.renderer.autoClear = false;
            this.renderer.setClearColor(new THREE.Color(0x000000), 0);
            this.renderer.setPixelRatio(this.pixelRatio);
            this.renderer.setSize(this.width, this.height);
            const dom = this.renderer.domElement;
            dom.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
            this.clock = new THREE.Clock();
            this.clock.start();
          } catch (err) {
            console.warn('LiquidEther: не удалось создать WebGL', err);
            this.renderer = null;
          }
        },
        resize() {
          if (!this.container) return;
          const rect = this.container.getBoundingClientRect();
          this.width = Math.max(1, Math.floor(rect.width));
          this.height = Math.max(1, Math.floor(rect.height));
          this.aspect = this.width / this.height;
          if (this.renderer) this.renderer.setSize(this.width, this.height, false);
        },
        update() {
          this.clock.getDelta();
        }
      };

      Mouse = {
        mouseMoved: false,
        coords: new THREE.Vector2(),
        coords_old: new THREE.Vector2(),
        diff: new THREE.Vector2(),
        timer: null,
        container: null,
        docTarget: null,
        listenerTarget: null,
        isHoverInside: false,
        hasUserControl: false,
        isAutoActive: false,
        autoIntensity: this.options.autoIntensity,
        takeoverActive: false,
        takeoverStartTime: 0,
        takeoverDuration: this.options.takeoverDuration,
        takeoverFrom: new THREE.Vector2(),
        takeoverTo: new THREE.Vector2(),
        onInteract: null,
        init(el) {
          this.container = el;
          this.docTarget = el.ownerDocument || document;
          this.listenerTarget = this.docTarget.defaultView || window;
          this._onMouseMove = this.onDocumentMouseMove.bind(this);
          this._onTouchStart = this.onDocumentTouchStart.bind(this);
          this._onTouchMove = this.onDocumentTouchMove.bind(this);
          this._onTouchEnd = this.onTouchEnd.bind(this);
          this._onDocumentLeave = this.onDocumentLeave.bind(this);
          this.listenerTarget.addEventListener('mousemove', this._onMouseMove);
          this.listenerTarget.addEventListener('touchstart', this._onTouchStart, { passive: true });
          this.listenerTarget.addEventListener('touchmove', this._onTouchMove, { passive: true });
          this.listenerTarget.addEventListener('touchend', this._onTouchEnd);
          if (this.docTarget) this.docTarget.addEventListener('mouseleave', this._onDocumentLeave);
        },
        dispose() {
          if (!this.listenerTarget) return;
          this.listenerTarget.removeEventListener('mousemove', this._onMouseMove);
          this.listenerTarget.removeEventListener('touchstart', this._onTouchStart);
          this.listenerTarget.removeEventListener('touchmove', this._onTouchMove);
          this.listenerTarget.removeEventListener('touchend', this._onTouchEnd);
          if (this.docTarget) this.docTarget.removeEventListener('mouseleave', this._onDocumentLeave);
        },
        isPointInside(x, y) {
          if (!this.container) return false;
          const rect = this.container.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        },
        updateHoverState(x, y) {
          this.isHoverInside = this.isPointInside(x, y);
          return this.isHoverInside;
        },
        setCoords(x, y) {
          if (!this.container) return;
          if (this.timer) window.clearTimeout(this.timer);
          const rect = this.container.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          const nx = (x - rect.left) / rect.width;
          const ny = (y - rect.top) / rect.height;
          this.coords.set(nx * 2 - 1, -(ny * 2 - 1));
          this.mouseMoved = true;
          this.timer = window.setTimeout(() => { this.mouseMoved = false; }, 100);
        },
        setNormalized(nx, ny) {
          this.coords.set(nx, ny);
          this.mouseMoved = true;
        },
        onDocumentMouseMove(event) {
          if (!this.updateHoverState(event.clientX, event.clientY)) return;
          if (this.onInteract) this.onInteract();
          if (this.isAutoActive && !this.hasUserControl && !this.takeoverActive) {
            const rect = this.container.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            const nx = (event.clientX - rect.left) / rect.width;
            const ny = (event.clientY - rect.top) / rect.height;
            this.takeoverFrom.copy(this.coords);
            this.takeoverTo.set(nx * 2 - 1, -(ny * 2 - 1));
            this.takeoverStartTime = performance.now();
            this.takeoverActive = true;
            this.hasUserControl = true;
            this.isAutoActive = false;
            return;
          }
          this.setCoords(event.clientX, event.clientY);
          this.hasUserControl = true;
        },
        onDocumentTouchStart(event) {
          if (event.touches.length !== 1) return;
          const t = event.touches[0];
          if (!this.updateHoverState(t.clientX, t.clientY)) return;
          if (this.onInteract) this.onInteract();
          this.setCoords(t.clientX, t.clientY);
          this.hasUserControl = true;
        },
        onDocumentTouchMove(event) {
          if (event.touches.length !== 1) return;
          const t = event.touches[0];
          if (!this.updateHoverState(t.clientX, t.clientY)) return;
          if (this.onInteract) this.onInteract();
          this.setCoords(t.clientX, t.clientY);
        },
        onTouchEnd() { this.isHoverInside = false; },
        onDocumentLeave() { this.isHoverInside = false; },
        update() {
          if (this.takeoverActive) {
            const t = (performance.now() - this.takeoverStartTime) / (this.takeoverDuration * 1000);
            if (t >= 1) {
              this.takeoverActive = false;
              this.coords.copy(this.takeoverTo);
              this.coords_old.copy(this.coords);
              this.diff.set(0, 0);
            } else {
              const k = t * t * (3 - 2 * t);
              this.coords.copy(this.takeoverFrom).lerp(this.takeoverTo, k);
            }
          }
          this.diff.subVectors(this.coords, this.coords_old);
          this.coords_old.copy(this.coords);
          if (!this.hasUserControl && !this.isAutoActive && this.coords.x === 0 && this.coords.y === 0) {
            this.diff.set(0, 0);
          }
          if (this.isAutoActive && !this.takeoverActive) this.diff.multiplyScalar(this.autoIntensity);
        }
      };

      Common.init(container);
      if (!Common.renderer) return;

      Mouse.init(container);
      Mouse.autoIntensity = this.options.autoIntensity;
      Mouse.takeoverDuration = this.options.takeoverDuration;
      Mouse.coords.set(0.35, 0.12);
      Mouse.coords_old.set(-0.2, -0.08);

      this.lastUserInteraction = 0;
      Mouse.onInteract = () => {
        this.lastUserInteraction = performance.now();
        if (this.autoDriver) this.autoDriver.forceStop();
      };

      this.autoDriver = new AutoDriver(Mouse, this, {
        enabled: this.options.autoDemo,
        speed: this.options.autoSpeed,
        resumeDelay: this.options.autoResumeDelay,
        rampDuration: this.options.autoRampDuration
      });

      container.prepend(Common.renderer.domElement);

      try {
        this.simulation = new Simulation({
          mouse_force: this.options.mouseForce,
          cursor_size: this.options.cursorSize,
          isViscous: this.options.isViscous,
          viscous: this.options.viscous,
          iterations_viscous: this.options.iterationsViscous,
          iterations_poisson: this.options.iterationsPoisson,
          dt: this.options.dt,
          BFECC: this.options.BFECC,
          resolution: this.options.resolution,
          isBounce: this.options.isBounce
        });
      } catch (simErr) {
        console.warn('LiquidEther: ошибка симуляции', simErr);
        Common.renderer.domElement.remove();
        Common.renderer.dispose();
        Common.renderer = null;
        return;
      }

      this.outputScene = new THREE.Scene();
      this.outputCamera = new THREE.Camera();
      this.outputMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.RawShaderMaterial({
          vertexShader: face_vert,
          fragmentShader: color_frag,
          transparent: true,
          depthWrite: false,
          uniforms: {
            velocity: { value: this.simulation.fbos.vel_0.texture },
            boundarySpace: { value: new THREE.Vector2() },
            palette: { value: paletteTex },
            bgColor: { value: bgVec4 }
          }
        })
      );
      this.outputScene.add(this.outputMesh);

      this._loop = this.loop.bind(this);
      this._resize = this.resize.bind(this);
      this._onVisibility = () => {
        if (document.hidden) this.pause();
        else this.start();
      };

      window.addEventListener('resize', this._resize);
      document.addEventListener('visibilitychange', this._onVisibility);

      this.resizeObserver = new ResizeObserver(() => {
        if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
        this.resizeRaf = requestAnimationFrame(() => this.resize());
      });
      this.resizeObserver.observe(container);

      this.start();
    }

    resize() {
      if (!Common.renderer || !this.simulation) return;
      Common.resize();
      this.simulation.resize();
    }

    render() {
      if (!Common.renderer || !this.simulation) return;
      if (this.autoDriver) this.autoDriver.update();
      Mouse.update();
      Common.update();
      this.simulation.update();
      Common.renderer.setRenderTarget(null);
      Common.renderer.render(this.outputScene, this.outputCamera);
    }

    loop() {
      if (!this.running) return;
      this.render();
      this.raf = requestAnimationFrame(this._loop);
    }

    start() {
      if (this.running) return;
      this.running = true;
      this._loop();
    }

    pause() {
      this.running = false;
      if (this.raf) {
        cancelAnimationFrame(this.raf);
        this.raf = null;
      }
    }

    dispose() {
      this.pause();
      window.removeEventListener('resize', this._resize);
      document.removeEventListener('visibilitychange', this._onVisibility);
      if (this.resizeObserver) this.resizeObserver.disconnect();
      Mouse.dispose();
      if (Common.renderer) {
        const canvas = Common.renderer.domElement;
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        Common.renderer.dispose();
      }
    }
  }

  function initLiquidEther(container, options) {
    return new LiquidEtherApp(container, options);
  }

  global.initLiquidEther = initLiquidEther;
  global.LiquidEtherApp = LiquidEtherApp;
})(typeof window !== 'undefined' ? window : globalThis);
