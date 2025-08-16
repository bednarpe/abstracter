import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
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
  uniform sampler2D u_feedback_texture;
  uniform vec2 u_resolution;

  // Noise functions from the previous step...
  float random (vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
  }

  float noise (in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      vec2 u = f*f*(3.0-2.0*f);
      return mix( mix( random( i + vec2(0.0,0.0) ),
                       random( i + vec2(1.0,0.0) ), u.x),
                  mix( random( i + vec2(0.0,1.0) ),
                       random( i + vec2(1.0,1.0) ), u.x), u.y);
  }

  // Function to draw a line with a neon glow
  float neon_line(vec2 p, vec2 a, vec2 b, float width) {
      vec2 dir = b - a;
      float l = length(dir);
      dir /= l;

      vec2 pa = p - a;
      float t = clamp(dot(pa, dir), 0.0, l);
      vec2 proj = a + t * dir;

      float d = distance(p, proj);

      // Neon effect
      float glow = 1.0 / (d * d * 100.0); // Inverse square for a nice glow
      glow = smoothstep(0.0, 1.0, glow);

      return glow * smoothstep(width, width * 0.5, d);
  }

  void main() {
      vec2 st = gl_FragCoord.xy / u_resolution.xy;

      // Feedback (the trailing fades)
      vec4 feedback = texture2D(u_feedback_texture, st);

      // Generate moving lines
      float line = 0.0;
      for(float i = 0.0; i < 3.0; i++) {
          float t = u_time * (0.2 + i * 0.05);
          vec2 start = vec2(sin(t + i * 2.0) * 0.5, cos(t + i * 3.0) * 0.5);
          start += vec2(0.5, 0.5); // Center it

          vec2 end = start;
          for(int j=0; j<10; j++) {
              end += vec2(noise(end + float(j)) - 0.5, noise(end + float(j) + 10.0) - 0.5) * 0.1;
          }

          line += neon_line(st, start, end, 0.05);
      }

      vec3 color = vec3(line);
      color *= vec3(1.0, 0.2, 0.8); // Brighter Neon color

      // Mix with feedback
      gl_FragColor = vec4(color + feedback.rgb * 0.92, 1.0);
  }
`;

const OrganicAnimation = () => {
  const { size, viewport } = useThree();
  const fbo = useFBO(size.width, size.height);
  const materialRef = useRef();

  useFrame(({ gl, scene, camera, clock }) => {
    gl.setRenderTarget(fbo);
    gl.render(scene, camera);
    materialRef.current.uniforms.u_feedback_texture.value = fbo.texture;
    materialRef.current.uniforms.u_time.value = clock.getElapsedTime();
    gl.setRenderTarget(null);
  });

  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          u_time: { value: 0.0 },
          u_feedback_texture: { value: null },
          u_resolution: { value: new THREE.Vector2(size.width, size.height) }
        }}
      />
    </mesh>
  );
};

export default OrganicAnimation;
