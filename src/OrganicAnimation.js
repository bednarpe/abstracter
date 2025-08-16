import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float u_time;

  // 2D Random
  float random (vec2 st) {
      return fract(sin(dot(st.xy,
                           vec2(12.9898,78.233)))*
          43758.5453123);
  }

  // 2D Noise based on Morgan McGuire @morgan3d
  // https://www.shadertoy.com/view/4dS3Wd
  float noise (in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);

      // Four corners in 2D of a tile
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));

      vec2 u = f*f*(3.0-2.0*f);
      return mix(a, b, u.x) +
              (c - a)* u.y * (1.0 - u.x) +
              (d - b) * u.x * u.y;
  }

  #define NUM_OCTAVES 5

  float fbm ( in vec2 st) {
      float value = 0.0;
      float amplitude = .5;
      float frequency = 0.;
      for (int i = 0; i < NUM_OCTAVES; i++) {
          value += amplitude * noise(st);
          st *= 2.;
          amplitude *= .5;
      }
      return value;
  }

  void main() {
      vec2 st = vUv * 3.0;
      st.x += u_time * 0.1;
      vec3 color = vec3(0.0);
      float value = fbm(st);

      color = mix(vec3(0.1, 0.2, 0.8), vec3(0.9, 0.2, 0.2), value);
      color = mix(color, vec3(0.9, 0.9, 0.9), value * 0.2);
      color = mix(color, vec3(0.0, 0.0, 0.0), length(vUv - 0.5) * 1.5);


      gl_FragColor = vec4(color,1.0);
  }
`;

const OrganicAnimation = () => {
  const materialRef = useRef();

  useFrame(({ clock }) => {
    if(materialRef.current) {
      materialRef.current.uniforms.u_time.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh>
      <planeGeometry args={[10, 10, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          u_time: { value: 0.0 },
        }}
      />
    </mesh>
  );
};

export default OrganicAnimation;
