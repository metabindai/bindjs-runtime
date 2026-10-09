const metadata = {
    title: "ProjectThumbnail",
    description: "Animated metaball shader built from GLSL generated per props (count, speed, radius, glow, multiply/plasma modes): expect glowing blue/purple blobs orbiting and merging on a dark navy background with a soft vignette; each preview is a different preset.",
    category: "Graphics"
};

// ─── Properties ──────────────────────────────────────────

const properties = {
    count: {
        title: "Metaball Count",
        type: "number",
        validation: { min: 1, max: 20 },
        inspector: { control: "slider", step: 1 },
        defaultValue: 5
    },
    speed: {
        title: "Speed",
        type: "number",
        validation: { min: 0.1, max: 3.0 },
        inspector: { control: "slider", step: 0.05 },
        defaultValue: 1.2
    },
    distance: {
        title: "Distance",
        type: "number",
        validation: { min: 0.2, max: 1.5 },
        inspector: { control: "slider", step: 0.05 },
        defaultValue: 0.8
    },
    radius: {
        title: "Radius",
        type: "number",
        validation: { min: 0.1, max: 1.0 },
        inspector: { control: "slider", step: 0.05 },
        defaultValue: 0.2
    },
    wobble: {
        title: "Wobble",
        type: "number",
        validation: { min: 0.0, max: 1.0 },
        inspector: { control: "slider", step: 0.05 },
        defaultValue: 0.5
    },
    glow: {
        title: "Glow Intensity",
        type: "number",
        validation: { min: 0.0, max: 5.0 },
        inspector: { control: "slider", step: 0.1 },
        defaultValue: 2.0
    },
    pulseIntensity: {
        title: "Pulse Intensity",
        type: "number",
        validation: { min: 0.0, max: 1.0 },
        inspector: { control: "slider", step: 0.05 },
        defaultValue: 0.3
    },
    colorShift: {
        title: "Color Animation Speed",
        type: "number",
        validation: { min: 0.0, max: 2.0 },
        inspector: { control: "slider", step: 0.1 },
        defaultValue: 0.5
    },
    turbulence: {
        title: "Turbulence",
        type: "number",
        validation: { min: 0.0, max: 1.0 },
        inspector: { control: "slider", step: 0.05 },
        defaultValue: 0.2
    },
    multiplyMode: {
        title: "Multiply Metaballs",
        type: "boolean",
        defaultValue: false
    },
    plasmaMode: {
        title: "Plasma",
        type: "boolean",
        defaultValue: false
    },
} satisfies ComponentProperties;

// ─── Body ────────────────────────────────────────────────

const body = (props: InferProps<typeof properties>) => {
    return ZStack([
        MetaShader(props)
    ]);
};

// ─── Lockups ─────────────────────────────────────────────

// `startColor` is a GLSL vec3 expression, not exposed as a property.
const MetaShader = defineComponent({
    body: (props: InferProps<typeof properties> & { startColor?: string }) => {
        const startColor = props.startColor ?? "vec3(0.0, 0.028, 0.25)"; // dark navy
        const count = Math.min(Math.max(Math.trunc(props.count ?? 5), 1), 20);
        const speed = props.speed ?? 1.2;
        const separation = props.distance ?? 0.8;
        const radius = props.radius ?? 0.2;
        const wobble = props.wobble ?? 0.5;
        const glow = props.glow ?? 2.0;
        const multiplyMode = props.multiplyMode ?? false;
        const plasmaMode = props.plasmaMode ?? false;
        const pulseIntensity = props.pulseIntensity ?? 0.3;
        const colorShift = props.colorShift ?? 0.5;
        const turbulence = props.turbulence ?? 0.2;
        // Build the metaball GLSL dynamically with more complex motion
        let metaballCalculations = "";
        for (let i = 0; i < count; i++) {
            const angleOffset = (i / count) * Math.PI * 2.0;
            const fi = i.toFixed(1);
            metaballCalculations += `
          {
            float baseAngle${i} = t * (0.8 + ${fi} * 0.15) + ${angleOffset.toFixed(6)};
            float phase${i} = sin(t * (0.4 + ${fi} * 0.12)) * ${pulseIntensity.toFixed(3)};
            float turbPhase${i} = sin(t * (1.2 + ${fi} * 0.3)) * ${turbulence.toFixed(3)};
            
            // Complex orbital motion with turbulence
            float angle${i} = baseAngle${i} + phase${i} + turbPhase${i};
            float orbitRadius${i} = ${separation.toFixed(3)} * (1.0 + 0.3 * sin(t * (0.6 + ${fi} * 0.1)));
            
            vec2 c${i} = vec2(
              sin(angle${i}) * orbitRadius${i} + sin(t * (2.0 + ${fi} * 0.2)) * 0.1,
              cos(angle${i} * 0.9) * ${wobble.toFixed(3)} + cos(t * (1.5 + ${fi} * 0.15)) * 0.08
            );
            
            // Dynamic radius with pulsing
            float dynamicRadius${i} = ${radius.toFixed(3)} * (1.0 + 0.4 * sin(t * (3.0 + ${fi} * 0.5)));
            
            field ${multiplyMode ? "*=" : "+="} metaball(uv, c${i}, dynamicRadius${i});
          }
        `;
        }
        const metaballShaderCode = `
        precision highp float;
        uniform float time;
        uniform vec2 resolution;

        float metaball(vec2 p, vec2 c, float r) {
          float d = length(p - c);
          return r * r / (d * d + 0.0001);
        }

        // Noise function for extra visual complexity
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        // Smooth noise
        float smoothNoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          
          float a = noise(i);
          float b = noise(i + vec2(1.0, 0.0));
          float c = noise(i + vec2(0.0, 1.0));
          float d = noise(i + vec2(1.0, 1.0));
          
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
          float t = time * ${speed.toFixed(3)};
          float field = ${multiplyMode ? "5.0" : "0.0"};

          ${metaballCalculations}

          ${plasmaMode ? "field = 1.0 - clamp(field, 0.0, 1.0);" : ""}

          // Enhanced color mixing with dynamic shifts
          float colorTime = t * ${colorShift.toFixed(3)};
          float noiseValue = smoothNoise(uv * 3.0 + t * 0.5) * 0.3;
          
          // Multiple threshold levels for richer visuals
          float threshold1 = smoothstep(0.8, 1.4, field + noiseValue);
          float threshold2 = smoothstep(1.2, 1.8, field);
          float threshold3 = smoothstep(1.6, 2.2, field);
          float edge = smoothstep(0.6, 1.0, field) - threshold1;

          // Dynamic color palette
          vec3 startColor = ${startColor};
          vec3 midColor = vec3(
            0.2 + 0.3 * sin(colorTime * 0.7),
            0.1 + 0.4 * sin(colorTime * 0.9 + 2.0),
            0.6 + 0.3 * sin(colorTime * 1.1 + 4.0)
          );
          vec3 endColor = ${!plasmaMode ?
            `vec3(
              0.1 + 0.4 * sin(colorTime + 1.0),
              0.3 + 0.5 * sin(colorTime * 1.3 + 3.0),
              0.8 + 0.2 * sin(colorTime * 0.8 + 5.0)
            )` :
            `vec3(
              0.8 + 0.2 * sin(colorTime),
              0.1 + 0.3 * sin(colorTime * 1.2),
              0.0
            )`};

          // Multi-layer color blending
          vec3 color = mix(startColor, midColor, threshold1);
          color = mix(color, endColor, threshold2);
          color += threshold3 * vec3(1.0, 0.8, 0.6) * 0.5;
          
          // Enhanced glow with multiple layers
          color += edge * midColor * ${glow.toFixed(2)};
          color += threshold1 * 0.1 * vec3(1.0, 0.9, 0.7);
          
          // Animated brightness modulation
          float brightness = 0.85 + 0.15 * sin(time * 2.5) + 0.1 * sin(time * 4.7);
          color *= brightness;
          
          // Subtle vignette effect
          float vignette = 1.0 - 0.3 * length(uv);
          color *= vignette;

          gl_FragColor = vec4(color, 1.0);
        }
      `;
        return (
            Shader({
                fragmentShader: metaballShaderCode,
                mouseEnabled: false
            })
                .background(Color("black"))
        );
    }
});

// ─── Previews ────────────────────────────────────────────

const previews = [
    Self({ plasmaMode: true, multiplyMode: true, radius: 0.25, distance: 0.6, count: 4, speed: 1.5, glow: 3.0, colorShift: 1.0 }).previewName("Plasma Storm"),
    Self({ count: 3, speed: 0.8, distance: 0.7, radius: 0.3, pulseIntensity: 0.5, glow: 2.5 }).previewName("Pulsing Orbs"),
    Self({ count: 7, multiplyMode: true, distance: 1.0, radius: 0.15, turbulence: 0.4, speed: 1.8 }).previewName("Chaotic Field"),
    Self({ count: 2, glow: 4.0, radius: 0.4, wobble: 0.8, colorShift: 0.8 }).previewName("Twin Suns"),
    Self({ count: 8, radius: 0.1, speed: 2.0, distance: 1.2, pulseIntensity: 0.6 }).previewName("Swarm Dance"),
    Self({ count: 12, radius: 0.08, speed: 1.0, multiplyMode: true, turbulence: 0.6 }).previewName("Particle Cloud")
];

export default defineComponent({ metadata, properties, body, previews });
