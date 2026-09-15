"use client";

import { useEffect, useRef, useState } from "react";

const vertexSource = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const fragmentSource = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_pointer;

varying vec2 v_uv;

vec3 permute(vec3 value) {
  return mod(((value * 34.0) + 1.0) * value, 289.0);
}

float noise(vec2 point) {
  const vec4 constants = vec4(
    0.2113248654,
    0.3660254038,
    -0.5773502692,
    0.0243902439
  );

  vec2 grid = floor(point + dot(point, constants.yy));
  vec2 local = point - grid + dot(grid, constants.xx);
  vec2 offset =
    local.x > local.y
      ? vec2(1.0, 0.0)
      : vec2(0.0, 1.0);

  vec4 corners = local.xyxy + constants.xxzz;
  corners.xy -= offset;

  grid = mod(grid, 289.0);

  vec3 permutations =
    permute(
      permute(grid.y + vec3(0.0, offset.y, 1.0))
      + grid.x
      + vec3(0.0, offset.x, 1.0)
    );

  vec3 weight = max(
    0.5 - vec3(
      dot(local, local),
      dot(corners.xy, corners.xy),
      dot(corners.zw, corners.zw)
    ),
    0.0
  );

  weight *= weight * weight * weight;

  vec3 gradient =
    2.0 * fract(permutations * constants.www) - 1.0;

  vec3 height = abs(gradient) - 0.5;
  vec3 offsetGradient = floor(gradient + 0.5);
  vec3 adjusted = gradient - offsetGradient;

  weight *=
    1.7928429 -
    0.8537347 * (
      adjusted * adjusted +
      height * height
    );

  vec3 direction;

  direction.x =
    adjusted.x * local.x +
    height.x * local.y;

  direction.yz =
    adjusted.yz * corners.xz +
    height.yz * corners.yw;

  return 130.0 * dot(weight, direction);
}

void main() {
  vec2 centered = (v_uv - 0.5) * 2.0;

  centered.x *=
    u_resolution.x /
    max(u_resolution.y, 1.0);

  float time = u_time * 0.1;

  float layeredNoise =
    noise(centered * 1.5 + time) * 0.7 +
    noise(centered * 3.0 - time * 1.5) * 0.3;

  float form =
    1.0 -
    smoothstep(
      0.08,
      0.95,
      length(
        centered -
        (u_pointer - 0.5) * 0.12
      ) +
      layeredNoise * 0.12
    );

  float grid =
    sin(v_uv.x * 50.0 + layeredNoise) *
    sin(v_uv.y * 50.0 - layeredNoise);

  grid =
    smoothstep(0.98, 1.0, grid) * 0.1;

  float light =
    pow(
      1.0 -
      length(v_uv - vec2(0.5, 0.3)),
      3.0
    );

  vec3 deepInk =
    vec3(0.012, 0.016, 0.015);

  vec3 champagne =
    vec3(0.83, 0.76, 0.63);

  vec3 blue =
    vec3(0.18, 0.36, 1.0);

  float blueField =
    smoothstep(
      1.2,
      0.05,
      length(centered + vec2(0.28, 0.18))
    );

  vec3 color =
    mix(
      deepInk,
      champagne * 0.72,
      form
    );

  color =
    mix(
      color,
      color + blue * 0.55,
      blueField * 0.32
    );

  color +=
    blue *
    grid *
    max(form, 0.18);

  color +=
    champagne *
    light *
    0.2;

  color *=
    1.0 -
    smoothstep(
      0.5,
      1.5,
      length(centered)
    );

  gl_FragColor =
    vec4(color, 1.0);
}`;

type ShaderCanvasProps = {
  className?: string;
  reducedMotion?: boolean;
};

export function ShaderCanvas({
  className = "",
  reducedMotion = false,
}: ShaderCanvasProps) {
  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const [isSupported, setIsSupported] =
    useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: true,
    });

    if (!gl) {
      setIsSupported(false);
      return;
    }

    const compile = (
      type: number,
      source: string
    ) => {
      const shader = gl.createShader(type);

      if (!shader) {
        throw new Error(
          "Unable to create shader"
        );
      }

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (
        !gl.getShaderParameter(
          shader,
          gl.COMPILE_STATUS
        )
      ) {
        gl.deleteShader(shader);
        throw new Error(
          "Unable to compile shader"
        );
      }

      return shader;
    };

    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let frame = 0;

    try {
      const vertexShader = compile(
        gl.VERTEX_SHADER,
        vertexSource
      );

      const fragmentShader = compile(
        gl.FRAGMENT_SHADER,
        fragmentSource
      );

      program = gl.createProgram();

      if (!program) {
        throw new Error(
          "Unable to create program"
        );
      }

      gl.attachShader(
        program,
        vertexShader
      );

      gl.attachShader(
        program,
        fragmentShader
      );

      gl.linkProgram(program);

      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);

      if (
        !gl.getProgramParameter(
          program,
          gl.LINK_STATUS
        )
      ) {
        throw new Error(
          "Unable to link shader program"
        );
      }

      buffer = gl.createBuffer();

      if (!buffer) {
        throw new Error(
          "Unable to create shader buffer"
        );
      }

      gl.bindBuffer(
        gl.ARRAY_BUFFER,
        buffer
      );

      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          -1,
          -1,
          1,
          -1,
          -1,
          1,
          1,
          1,
        ]),
        gl.STATIC_DRAW
      );

      gl.useProgram(program);

      const position =
        gl.getAttribLocation(
          program,
          "a_position"
        );

      gl.enableVertexAttribArray(position);

      gl.vertexAttribPointer(
        position,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );

      const timeLocation =
        gl.getUniformLocation(
          program,
          "u_time"
        );

      const resolutionLocation =
        gl.getUniformLocation(
          program,
          "u_resolution"
        );

      const pointerLocation =
        gl.getUniformLocation(
          program,
          "u_pointer"
        );

      const pointer = {
        x: 0.5,
        y: 0.5,
      };

      const syncSize = () => {
        const ratio = Math.min(
          window.devicePixelRatio || 1,
          2
        );

        const width = Math.max(
          1,
          Math.floor(
            canvas.clientWidth * ratio
          )
        );

        const height = Math.max(
          1,
          Math.floor(
            canvas.clientHeight * ratio
          )
        );

        if (
          canvas.width !== width ||
          canvas.height !== height
        ) {
          canvas.width = width;
          canvas.height = height;
        }
      };

      const draw = (
        timestamp: number
      ) => {
        syncSize();

        gl.viewport(
          0,
          0,
          canvas.width,
          canvas.height
        );

        gl.uniform1f(
          timeLocation,
          reducedMotion
            ? 0
            : timestamp * 0.001
        );

        gl.uniform2f(
          resolutionLocation,
          canvas.width,
          canvas.height
        );

        gl.uniform2f(
          pointerLocation,
          pointer.x,
          pointer.y
        );

        gl.drawArrays(
          gl.TRIANGLE_STRIP,
          0,
          4
        );

        if (!reducedMotion) {
          frame =
            requestAnimationFrame(draw);
        }
      };

      const handlePointerMove = (
        event: PointerEvent
      ) => {
        const bounds =
          canvas.getBoundingClientRect();

        pointer.x = Math.min(
          1,
          Math.max(
            0,
            (event.clientX -
              bounds.left) /
              bounds.width
          )
        );

        pointer.y = Math.min(
          1,
          Math.max(
            0,
            1 -
              (event.clientY -
                bounds.top) /
                bounds.height
          )
        );
      };

      const observer =
        new ResizeObserver(syncSize);

      observer.observe(canvas);

      canvas.addEventListener(
        "pointermove",
        handlePointerMove,
        { passive: true }
      );

      draw(0);

      return () => {
        cancelAnimationFrame(frame);

        observer.disconnect();

        canvas.removeEventListener(
          "pointermove",
          handlePointerMove
        );

        if (buffer) {
          gl.deleteBuffer(buffer);
        }

        if (program) {
          gl.deleteProgram(program);
        }
      };
    } catch {
      setIsSupported(false);

      if (buffer) {
        gl.deleteBuffer(buffer);
      }

      if (program) {
        gl.deleteProgram(program);
      }
    }
  }, [reducedMotion]);

  return (
    <div
      className={`shader-surface ${className}`.trim()}
      aria-hidden="true"
    >
      <div className="shader-surface__fallback" />

      {isSupported && (
        <canvas
          className="shader-surface__canvas"
          ref={canvasRef}
        />
      )}
    </div>
  );
}