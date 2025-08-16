import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Lines = ({ count = 50 }) => {
  const ref = useRef();

  const lines = useMemo(() => {
    const lineArray = [];
    for (let i = 0; i < count; i++) {
      const pos = () => new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
      );
      const start = pos();
      const end = pos();
      const speed = () => (Math.random() - 0.5) * 0.02;
      const speedVec = new THREE.Vector3(speed(), speed(), speed());
      const color = new THREE.Color(Math.random() * 0xffffff);
      lineArray.push({ start, end, speedVec, color });
    }
    return lineArray;
  }, [count]);

  const geometry = useMemo(() => {
    const points = lines.flatMap(line => [line.start, line.end]);
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const colors = lines.flatMap(line => [line.color.r, line.color.g, line.color.b, line.color.r, line.color.g, line.color.b]);
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, [lines]);

  useFrame(() => {
    if(!ref.current) return;
    const positions = ref.current.geometry.attributes.position.array;
    let i = 0;
    lines.forEach(line => {
      line.start.add(line.speedVec);
      line.end.add(line.speedVec);

      if (line.start.length() > 15) {
        line.start.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
        );
        const endPos = line.start.clone().add(new THREE.Vector3((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5));
        line.end.copy(endPos);
      }

      positions[i++] = line.start.x;
      positions[i++] = line.start.y;
      positions[i++] = line.start.z;
      positions[i++] = line.end.x;
      positions[i++] = line.end.y;
      positions[i++] = line.end.z;
    });
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial vertexColors />
    </lineSegments>
  );
};

export default Lines;
