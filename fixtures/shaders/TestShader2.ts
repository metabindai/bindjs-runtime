const metadata = {
    title: "TestShader2",
    description: "Extended variant of TestShader with more SDF primitives (sphere, rounded box/cylinder/cone, torus, capsule, noise sphere, book, box cluster), a shell-built room and a sphere-to-shape ping-pong morph; expect an animated raymarched shape morphing inside a pale (Subtle) or blue (Default) room, or the dark Metallic / Punchy preset.",
    category: "Shaders"
};

// ─── Properties ─────────────────────────────────────────

const properties = {
    baseColor: {
        type: "string",
        title: "Shape Base Color",
        description: "Hex color for the main shape (e.g. #E5ECFF)",
        inspector: {
            control: "singleline",
            placeholder: "#E5ECFF"
        }
    },
    rimColor: {
        type: "string",
        title: "Rim / Fresnel Color",
        description: "Hex color for rim lighting (e.g. #66A8FF)",
        inspector: {
            control: "singleline",
            placeholder: "#66A8FF"
        }
    },
    ambientColor: {
        type: "string",
        title: "Ambient Color",
        description: "Hex color for ambient light on the shape",
        inspector: {
            control: "singleline",
            placeholder: "#02050A"
        }
    },
    roomColor: {
        type: "string",
        title: "Room Color",
        description: "Hex color for the box / room walls",
        inspector: {
            control: "singleline",
            placeholder: "#F2F2F2"
        }
    },
    backgroundColor: {
        type: "string",
        title: "Background Color",
        description: "Background color behind the shader view",
        inspector: {
            control: "singleline",
            placeholder: "black"
        }
    },
    morphSpeed: {
        type: "number",
        title: "Morph Speed",
        description: "Speed of shape transitions",
        inspector: {
            control: "slider",
            step: 0.05
        },
        validation: {
            min: 0,
            max: 2
        }
    },
    rotationSpeedXZ: {
        type: "number",
        title: "Rotation Speed XZ",
        description: "Spin speed around the vertical axis",
        inspector: {
            control: "slider",
            step: 0.05
        },
        validation: {
            min: 0,
            max: 2
        }
    },
    rotationSpeedXY: {
        type: "number",
        title: "Rotation Speed XY",
        description: "Tilt speed",
        inspector: {
            control: "slider",
            step: 0.05
        },
        validation: {
            min: 0,
            max: 2
        }
    },
    shadowSoftness: {
        type: "number",
        title: "Shadow Softness",
        description: "Softness factor for shadows (higher = harder)",
        inspector: {
            control: "slider",
            step: 0.5
        },
        validation: {
            min: 1,
            max: 16
        }
    },
    shadowStrength: {
        type: "number",
        title: "Shadow Strength",
        description: "Overall darkness of shadows",
        inspector: {
            control: "slider",
            step: 0.05
        },
        validation: {
            min: 0,
            max: 2
        }
    },
    specularPower: {
        type: "number",
        title: "Specular Sharpness",
        description: "Exponent for highlight sharpness",
        inspector: {
            control: "slider",
            step: 1
        },
        validation: {
            min: 1,
            max: 128
        }
    },
    specularIntensity: {
        type: "number",
        title: "Specular Intensity",
        description: "Strength of specular highlights",
        inspector: {
            control: "slider",
            step: 0.1
        },
        validation: {
            min: 0,
            max: 3
        }
    },
    fresnelStrength: {
        type: "number",
        title: "Fresnel Strength",
        description: "Intensity of edge / rim effect",
        inspector: {
            control: "slider",
            step: 0.1
        },
        validation: {
            min: 0,
            max: 3
        }
    },
    fogDensity: {
        type: "number",
        title: "Fog Density",
        description: "Amount of distance fog",
        inspector: {
            control: "slider",
            step: 0.0005
        },
        validation: {
            min: 0,
            max: 0.01
        }
    },
    roomBrightness: {
        type: "number",
        title: "Room Brightness",
        description: "Multiplier for room/wall brightness",
        inspector: {
            control: "slider",
            step: 0.05
        },
        validation: {
            min: 0,
            max: 2
        }
    },
    materialMode: {
        type: "enum",
        title: "Material Mode",
        description: "Shape material response",
        options: [
            { value: "plastic", label: "Plastic" },
            { value: "metallic", label: "Metallic" },
            { value: "emissive", label: "Emissive" }
        ],
        inspector: {
            control: "segmented"
        }
    }
} satisfies ComponentProperties;

// ─── Body ───────────────────────────────────────────────

const body = (props: InferProps<typeof properties>) => {
    const env = useEnvironment();
    const fragmentShader = buildFragmentShader(props);
    // Free-form string property: a named color or "#rrggbb".
    const background = (props.backgroundColor ?? "black") as ColorProps;

    return (
        Shader({
            // Freeze animation when rendered as a static thumbnail.
            updateInterval: env.preview === "thumbnail" ? 0 : undefined,
            fragmentShader,
            mouseEnabled: false
        })
            .background(Color(background))
    );
};

// ─── Helpers ────────────────────────────────────────────

function hexToVec3(hex: string | undefined, fallback: number[]): number[] {
    if (!hex || typeof hex !== "string")
        return fallback;
    const trimmed = hex.trim();
    const match = /^#?([0-9a-fA-F]{6})$/.exec(trimmed);
    if (!match)
        return fallback;
    const int = parseInt(match[1], 16);
    const r = ((int >> 16) & 255) / 255;
    const g = ((int >> 8) & 255) / 255;
    const b = (int & 255) / 255;
    return [
        Number(r.toFixed(4)),
        Number(g.toFixed(4)),
        Number(b.toFixed(4))
    ];
}
function buildFragmentShader(props: InferProps<typeof properties>): string {
    // Defaults that mirror your original shader
    const morphSpeed = props.morphSpeed ?? 0.5;
    const rotXZ = props.rotationSpeedXZ ?? 0.5;
    const rotXY = props.rotationSpeedXY ?? 0.3;
    const shadowSoftness = props.shadowSoftness ?? 4.0;
    const shadowStrength = props.shadowStrength ?? 1.0;
    const specPower = props.specularPower ?? 64.0;
    const specIntensity = props.specularIntensity ?? 1.5;
    const fresnelStrength = props.fresnelStrength ?? 1.2;
    const fogDensity = props.fogDensity ?? 0.002;
    const roomBrightness = props.roomBrightness ?? 1.0;
    const [br, bg, bb] = hexToVec3(props.baseColor ?? "#E5ECFF", [0.9, 0.9, 0.9]);
    const [rr, rg, rb] = hexToVec3(props.rimColor ?? "#66A8FF", [0.4, 0.7, 1.0]);
    const [ar, ag, ab] = hexToVec3(props.ambientColor ?? "#02050A", [0.01, 0.02, 0.05]);
    const [rmr, rmg, rmb] = hexToVec3(props.roomColor ?? "#F2F2F2", [0.95, 0.95, 0.95]);
    const mode = props.materialMode === "metallic" ? 1 :
        props.materialMode === "emissive" ? 2 :
            0; // plastic default
    return `
precision highp float;

uniform float time;
uniform vec2 resolution;

// ───────────────────────────────
// CONFIG CONSTANTS (from props)
// ───────────────────────────────
const float MORPH_SPEED      = ${morphSpeed.toFixed(3)};
const float ROT_SPEED_XZ     = ${rotXZ.toFixed(3)};
const float ROT_SPEED_XY     = ${rotXY.toFixed(3)};

const float SHADOW_SOFTNESS  = ${shadowSoftness.toFixed(3)};
const float SHADOW_STRENGTH  = ${shadowStrength.toFixed(3)};

const float SPEC_POWER       = ${specPower.toFixed(3)};
const float SPEC_INTENSITY   = ${specIntensity.toFixed(3)};

const float FRESNEL_STRENGTH = ${fresnelStrength.toFixed(3)};
const float FOG_DENSITY      = ${fogDensity.toExponential(3)};

const float ROOM_BRIGHTNESS  = ${roomBrightness.toFixed(3)};

const vec3 BASE_COLOR   = vec3(${br}, ${bg}, ${bb});
const vec3 RIM_COLOR    = vec3(${rr}, ${rg}, ${rb});
const vec3 AMBIENT_BASE = vec3(${ar}, ${ag}, ${ab});
const vec3 ROOM_COLOR   = vec3(${rmr}, ${rmg}, ${rmb});

const int MATERIAL_MODE = ${mode};

// ───────────────────────────────
// ORIGINAL SDF / RAYMARCH SHADER
// Adapted to use time / resolution
// and the config constants above.
// ───────────────────────────────

#define MAX_STEPS 128
#define MAX_DIST 100.0
#define SURF_DIST 0.001

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdRoundBox(vec3 p, vec3 b, float r) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) - r + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdCylinder(vec3 p, float h, float r) {
  vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float sdTorus(vec3 p, vec2 t) {
    // t.x = major radius, t.y = tube radius
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
    vec3 pa = p - a;
    vec3 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - r;
}

float sdCone(vec3 p, float h, float r1, float r2) {
  vec2 q = vec2(length(p.xz), p.y);
  vec2 k1 = vec2(r2, h);
  vec2 k2 = vec2(r2 - r1, 2.0 * h);
  vec2 ca = vec2(q.x - min(q.x, (q.y < 0.0) ? r1 : r2), abs(q.y) - h);
  vec2 cb = q - k1 + k2 * clamp(dot(k1 - q, k2) / dot(k2, k2), 0.0, 1.0);
  float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
  return s * sqrt(min(dot(ca, ca), dot(cb, cb)));
}

// Rounded cone: outward-rounded edges by Minkowski sum with a sphere of radius r
float sdRoundedCone(vec3 p, float h, float r1, float r2, float rEdge) {
    // For convex SDFs, subtracting rEdge smooths/rounds all edges
    return sdCone(p, h, r1, r2) - rEdge;
}

float sdRoundCylinder( vec3 p, float ra, float rb, float h, float r ) {
    // ra = radius at bottom
    // rb = radius at top (can be same as ra for uniform cylinder)
    // h  = half-height
    // r  = rounding radius
    vec2 q = vec2( length(p.xz), p.y );
    
    vec2 k1 = vec2( rb, h );
    vec2 k2 = vec2( rb - ra, 2.0 * h );
    
    vec2 ca = vec2( q.x - min(q.x, (q.y < 0.0) ? ra : rb ),
                    abs(q.y) - h );
    
    vec2 cb = q - k1 + k2 * clamp( dot(k1 - q, k2) / dot(k2, k2),
                                  0.0, 1.0 );
    
    float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
    return s * ( sqrt( min(dot(ca,ca), dot(cb,cb)) ) - r );
}

mat2 rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

mat3 SetCamera(vec3 ro, vec3 ta, float cr) {
  vec3 cw = normalize(ta - ro);
  vec3 cp = vec3(sin(cr), cos(cr), 0.0);
  vec3 cu = normalize(cross(cw, cp));
  vec3 cv = normalize(cross(cu, cw));
  return mat3(cu, cv, cw);
}

// Axis-aligned box using min/max bounds (non-signed, 0 inside)
float sdBoxBounds(vec3 p, vec3 bmin, vec3 bmax) {
  vec3 q = max(max(bmin - p, vec3(0.0)), p - bmax);
  return length(q);
}

vec3 hash3(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(vec3(p.x * p.y, p.y * p.z, p.z * p.x));
}

// ---------- Ops ----------

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

vec2 opU(vec2 a, vec2 b) {
    return (a.x < b.x) ? a : b;
}

vec2 opSmoothU(vec2 a, vec2 b, float k) {
    float d = smin(a.x, b.x, k);
    // keep material id from closer shape
    return (a.x < b.x) ? vec2(d, a.y) : vec2(d, b.y);
}

// ---------- Transforms ----------

mat2 rot2(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

vec3 translate(vec3 p, vec3 t) {
    return p - t;
}

vec2 sdfEducationBook(vec3 p) {
    vec3 q = translate(p, vec3(0.0, 0, 0.0));

    // base
    float base = sdRoundBox(q, vec3(0.8, 0.02, 0.6), 0.08);

    // left page
    vec3 leftP = q;
    leftP.z += 0.1;
    leftP.x += 0.18;

    // curve the page outward a bit using x
    leftP.y += 0.06 * sin(leftP.x * 3.0);
    float leftPage = sdRoundBox(leftP, vec3(0.28, 0.04, 0.40), 0.05);

    // right page
    vec3 rightP = q;
    rightP.z += 0.0;
    rightP.x -= 0.5;
    rightP.y += 0.26 * sin(-rightP.x * 3.0);
    float rightPage = sdRoundBox(rightP, vec3(0.28, 0.44, 0.40), 0.05);

    float pages = smin(leftPage, rightPage, 0.01);
    float d = smin(base, pages, 0.50);

    return vec2(d, 14.0);
}

float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);

    // Quintic interpolation (smoothstep-like)
    f = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(mix(dot(hash3(i + vec3(0,0,0)), f - vec3(0,0,0)),
                dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), f.x),
            mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
                dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), f.x), f.y),
        mix(mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
                dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), f.x),
            mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
                dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), f.x), f.y),
        f.z);
}

float sdNoiseSphere(vec3 p, float radius, float amp, float freq) {
    float n = noise3(p * freq + time * 0.5);
    return sdSphere(p, radius) + n * amp;
}

float boxCluster(vec3 p) {
    float d = 1e9;
    float boxCornerRadius = 0.15;

    // Center box
    d = min(d, sdRoundBox(p + vec3(0.1, -1.0, -0.1), vec3(0.5, 0.5, 0.31), boxCornerRadius));

    // Offset boxes
    d = min(d, sdRoundBox(p - vec3(0.85, 0.75, 1.0), vec3(0.2, 0.2, 0.2), boxCornerRadius));
    d = min(d, sdRoundBox(p + vec3(-1.0, -0.15, 0.0), vec3(0.3, 0.3, 0.3), boxCornerRadius));
    d = min(d, sdRoundBox(p + vec3(0.2, 0.4, -0.6), vec3(0.5, 0.3, 0.3), boxCornerRadius));

    return d;
}

vec2 GetDist(vec3 p) {
  // --- 1. The Room (Uniform Shell Method) ---

  float boxSize = 1.3;
  float thick   = 0.04;
  float floorY  = -0.8;
  float fillet  = 0.08; // internal curve radius

  // 1. Inner air void (the mold)
  vec3 innerCorner = vec3(-boxSize, floorY, -boxSize);
  vec3 airMin      = innerCorner + vec3(fillet);
  vec3 airMax      = vec3(10.0, 10.0, 10.0);

  float dAir = sdBoxBounds(p, airMin, airMax) - fillet;

  // 2. Wall shell (uniform thickness around the void)
  float wall = max(-dAir, dAir - thick);

  // 3. Trim to stage size with rounded ends
  vec3 clipMin         = vec3(-10.0, -10.0, -10.0);
  vec3 clipMax         = vec3(boxSize, 1.5, boxSize);
  float endCornerRadius = 0.1;

  vec3 clipCenter   = (clipMax + clipMin) * 0.5;
  vec3 clipHalfSize = (clipMax - clipMin) * 0.5;

  float stageClip = sdRoundBox(p - clipCenter, clipHalfSize, endCornerRadius);

  // Intersection of shell and stage clip
  float room = max(wall, stageClip);

  // --- 2. The Morphing Object ---

  vec3 pObj = p;
  pObj.y -= 0.4;

  // Rotations driven by time and our config constants
  pObj.xz *= rot(time * ROT_SPEED_XZ);
  pObj.xy *= rot(time * ROT_SPEED_XY);

  // Sphere
  float dSphere = sdSphere(pObj, 0.75);

  // Rounded box
  float boxCornerRadius = 0.15;
  float dBox = sdRoundBox(pObj, vec3(0.7), boxCornerRadius);
  float dBox2 = sdRoundBox(pObj, vec3(0.7, 0.2, 0.1), boxCornerRadius);
  float dBox3 = sdRoundBox(pObj, vec3(0.5, 0.2, 0.5), boxCornerRadius);

  float dBoxes  = boxCluster(p);

  // Rounded cylinder
  float cylRadius       = 0.4;
  float cylHalfHeight   = 0.45;
  float cylCornerRadius = 0.12;
  float dCyl = sdRoundCylinder(pObj, cylRadius, cylRadius,
                               cylHalfHeight, cylCornerRadius);

  // Rounded cone
  vec3 pCone = pObj;
  pCone.y += 0.1;
  float coneHeight      = 0.55;
  float coneBaseRadius  = 0.5;
  float coneTopRadius   = 0.0;
  float coneCornerRadius = 0.12;
  float dTorus = sdTorus(pCone, vec2(0.7, 0.2));

    // Noise-displaced morph target
    float dNoise = sdNoiseSphere(pObj, 0.75, 0.45, 3.0);


  float dCone = sdRoundedCone(pCone, coneHeight,
                            coneBaseRadius, coneTopRadius,
                            coneCornerRadius);

  // --- Morph animation: sphere ↔ next shape ping-pong ---

  float tTotal    = time * MORPH_SPEED;
  float cycle     = mod(tTotal, 10.0);   // 10 phases
  float localTime = fract(tTotal);

  float t = clamp(localTime / 0.5, 0.0, 1.0);
  float k = 8.0;
  float blend = 1.0 - exp(-k * t) * (1.0 + k * t);
  if (t >= 1.0) blend = 1.0;

  float dShape;


  if      (cycle < 1.0) dShape = mix(dSphere, dBox,   blend); // Sphere → Box
  else if (cycle < 2.0) dShape = mix(dBox,    dBox2,blend); // Box → Sphere
  else if (cycle < 3.0) dShape = mix(dBox2, dBox3,   blend); // Sphere → Cylinder
  else if (cycle < 4.0) dShape = mix(dBox3,    dSphere,blend); // Cylinder → Sphere
  else if (cycle < 5.0) dShape = mix(dSphere,    dSphere,blend); // Cylinder → Sphere  
  else if (cycle < 6.0) dShape = mix(dSphere, dCyl,   blend);
  else if (cycle < 7.0) dShape = mix(dCyl,   dNoise, blend);
  else if (cycle < 8.0) dShape = mix(dNoise, dBoxes,  blend); // New morph!
  else if (cycle < 9.0) dShape = mix(dBoxes, dSphere,  blend); // New morph!  
  else                  dShape = mix(dSphere,  dSphere, blend);


  //dShape = dBoxes;

  // Combine object vs room
  float d  = min(dShape, room);
  float id = (dShape < room) ? 1.0 : 2.0;

  return vec2(d, id);
}

vec2 RayMarch(vec3 ro, vec3 rd) {
  float dO = 0.0;
  float id = 0.0;
  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * dO;
    vec2 dS = GetDist(p);
    dO += dS.x;
    id = dS.y;
    if (dO > 200.0 || dS.x < SURF_DIST) break;
  }
  return vec2(dO, id);
}

vec3 GetNormal(vec3 p) {
  float d = GetDist(p).x;
  vec2 e = vec2(0.001, 0.0);
  vec3 n = d - vec3(
    GetDist(p - e.xyy).x,
    GetDist(p - e.yxy).x,
    GetDist(p - e.yyx).x
  );
  return normalize(n);
}

float GetShadow(vec3 p, vec3 n, vec3 lDist, float softness) {
  float lightDist = length(lDist);
  vec3  l = normalize(lDist);
  float t = 0.02;
  float res = 1.0;

  for (int i = 0; i < 50; i++) {
    vec2 h = GetDist(p + l * t);
    if (h.x < 0.001) return 0.0;
    res = min(res, softness * h.x / t);
    t += h.x;
    if (t > lightDist) break;
  }
  return clamp(1.0 - (1.0 - res) * SHADOW_STRENGTH, 0.0, 1.0);
}

vec3 GetLight(vec3 p, vec3 rd, float id) {
  vec3 lightPos   = vec3(2.0, 5.0, 3.0);
  vec3 lVector    = lightPos - p;
  vec3 l          = normalize(lVector);
  vec3 n          = GetNormal(p);
  float dif       = clamp(dot(n, l), 0.0, 1.0);
  float shadow    = GetShadow(p, n, lVector, SHADOW_SOFTNESS);
  float shadowRoom    = GetShadow(p, n, lVector, SHADOW_SOFTNESS );  
  dif            *= shadow;

  float difRoom       = clamp(dot(n, l), 0.0, 1.0);
  difRoom            *= shadowRoom;

  vec3 r = reflect(-l, n);
  vec3 col;

  if (id < 1.5) {
    // Shape material
    float diffuseTerm = pow(dif, 1.4);
    vec3 base = BASE_COLOR * diffuseTerm;

    // Ambient gradient
    vec3 ambient = AMBIENT_BASE;
    ambient += vec3(0.02, 0.02, 0.2) * (n.y * 0.5 + 0.5);

    // Specular
    float sharpSpec = pow(max(dot(r, -rd), 0.0), SPEC_POWER) * shadow;
    float specScale = SPEC_INTENSITY;

    // Fresnel / rim
    float fresnel = pow(1.0 + dot(rd, n), 4.0);
    vec3 rim = RIM_COLOR * fresnel * FRESNEL_STRENGTH;

    col = base + ambient + rim + vec3(1.0) * sharpSpec * specScale;

    // Material modes
    if (MATERIAL_MODE == 1) {
      // Metallic: boost specular and rim, slightly desaturate base
      col = mix(vec3(dot(col, vec3(0.299, 0.587, 0.114))), col, 0.6);
      col += rim * 0.4;
    } else if (MATERIAL_MODE == 2) {
      // Emissive: boost overall brightness
      col *= 1.4;
    }

  } else {
    // Room
    col = ROOM_COLOR * ROOM_BRIGHTNESS;
    col = col + (difRoom * 0.125);
    float cornerDist = length(p - vec3(-2.3, -0.8, -2.3));
    col *= smoothstep(0.0, 4.0, cornerDist);
  }
  return col;
}

void main() {
  // Derive UV from fragment coordinates (no vertex shader needed)
  vec2 res = resolution;
  vec2 uv = (gl_FragCoord.xy / res) - 0.5;
  uv.x *= res.x / res.y;

  vec3 target = vec3(0.0);
  vec3 ro = target + normalize(vec3(1.0, 1.0, 1.0)) * 8.0;
  mat3 cam = SetCamera(ro, target, 0.0);
  vec3 rd = cam * vec3(0.0, 0.05, 1.0);

  float viewSize = 7.5;
  vec3 roOrtho = ro + (cam * vec3(uv * viewSize, 0.0));

  vec2 result = RayMarch(roOrtho, rd);
  float d  = result.x;
  float id = result.y;

  vec3 col = vec3(1.0);

  if (d < 200.0) {
    vec3 p = roOrtho + rd * d;
    col = GetLight(p, rd, id);
    col = mix(col, vec3(1.0), 1.0 - exp(-FOG_DENSITY * d * d));
  }

  col = pow(col, vec3(0.4545)); // gamma
  gl_FragColor = vec4(col, 1.0);
}
`;
}

// ─── Previews ───────────────────────────────────────────

const previews = [
    Self({
        baseColor: "#aaaaaa",
        rimColor: "#ffffff",
        ambientColor: "#aaaaaa",
        roomColor: "#eeeeff",
        backgroundColor: "black",
        morphSpeed: 1.25,
        rotationSpeedXZ: 0.25,
        rotationSpeedXY: 0.23,
        shadowSoftness: 8.0,
        shadowStrength: 0.85,
        specularPower: 64,
        specularIntensity: 0.01,
        fresnelStrength: .2,
        fogDensity: 0.006,
        roomBrightness: 0.85,
        materialMode: "plastic"
    }).previewName("Subtle"),
    Self({
        baseColor: "#aaaaaa",
        rimColor: "#ffffff",
        ambientColor: "#aaaaaa",
        roomColor: "#004AF8",
        backgroundColor: "black",
        morphSpeed: 1.5,
        rotationSpeedXZ: 0.25,
        rotationSpeedXY: 0.23,
        shadowSoftness: 5.0,
        shadowStrength: 0.95,
        specularPower: 64,
        specularIntensity: 0.01,
        fresnelStrength: 1.2,
        fogDensity: 0.0006,
        roomBrightness: 1.0,
        materialMode: "plastic"
    }).previewName("Default"),
    Self({
        baseColor: "#D0D4DC",
        rimColor: "#9AD0FF",
        ambientColor: "#05060A",
        roomColor: "#000000",
        backgroundColor: "black",
        morphSpeed: 0.6,
        rotationSpeedXZ: 0.8,
        rotationSpeedXY: 0.4,
        shadowSoftness: 6,
        shadowStrength: 1.2,
        specularPower: 96,
        specularIntensity: 2.0,
        fresnelStrength: 1.6,
        fogDensity: 0.003,
        roomBrightness: 0.0,
        materialMode: "metallic"
    }).previewName("Metallic / Punchy")
];

export default defineComponent({ metadata, properties, body, previews });
