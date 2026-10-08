// Animaciones "Ver cómo se juega". Ilustración vectorial animada con react-native-svg.
// En producción estas escenas se pueden reemplazar por archivos de Rive o Lottie hechos por un ilustrador.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { F } from './theme';

const AG = Animated.createAnimatedComponent(G);
const AP = Animated.createAnimatedComponent(Path);

// Valor animado de 0 a 1. loop repite; yoyo va y regresa.
function useT(duration, { delay = 0, loop = false, yoyo = false, easing = Easing.linear } = {}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let a = Animated.timing(v, { toValue: 1, duration, delay, easing, useNativeDriver: false });
    if (yoyo) a = Animated.sequence([a, Animated.timing(v, { toValue: 0, duration, easing, useNativeDriver: false })]);
    const run = loop ? Animated.loop(a) : a;
    run.start();
    return () => run.stop();
  }, []);
  return v;
}
const lerp = (v, input, output) => v.interpolate({ inputRange: input, outputRange: output });
const st = (c) => ({ stroke: c.ink, strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round' });
const Floor = ({ c }) => <Line x1="0" y1="174" x2="320" y2="174" stroke={c.line} strokeWidth="3" />;
const CUP = 'M0 0h28l-4 30h-20z';
const CUPS = [[190, 144], [222, 144], [254, 144], [206, 114], [238, 114], [222, 84]];
const KNOCK = [[40, -30, 80], [55, -10, 120], [70, 5, 95], [30, -60, -70], [60, -45, 150], [45, -80, -120]];

function Ball({ c, r }) {
  return (
    <G>
      <Circle cx="0" cy="0" r={r} fill={c.berry} {...st(c)} />
      <Path d={`M${-r * 0.7} ${-r * 0.3}q${r * 0.7} ${r * 0.6} ${r * 1.4} 0M${-r * 0.6} ${r * 0.4}q${r * 0.6} ${-r * 0.4} ${r * 1.2} 0`} fill="none" stroke={c.paper} strokeWidth="2" />
    </G>
  );
}
function PopCup({ c, x, y, delay }) {
  const v = useT(450, { delay, easing: Easing.out(Easing.back(2)) });
  return <AG x={x} y={y} scale={v} originX={14} originY={30} opacity={v}><Path d={CUP} fill={c.sun} {...st(c)} /></AG>;
}
function Pop({ delay = 0, children, ox = 0, oy = 0, x = 0, y = 0 }) {
  const v = useT(400, { delay, easing: Easing.out(Easing.back(2)) });
  return <AG x={x} y={y} scale={v} originX={ox} originY={oy} opacity={v}>{children}</AG>;
}
function Fade({ delay = 0, out, children }) {
  const v = useT(500, { delay });
  return <AG opacity={out ? lerp(v, [0, 1], [1, 0]) : v}>{children}</AG>;
}

// ---------- Boliche de vasos ----------
const BolicheA = ({ c }) => (<G><Floor c={c} />{CUPS.map(([x, y], i) => <PopCup key={i} c={c} x={x} y={y} delay={i * 300} />)}</G>);
const BolicheB = ({ c }) => (
  <G><Floor c={c} />
    <Fade out delay={1000}><Path d="M140 40h26v52q0 14 14 14h12q12 0 12 14v6h-50q-14 0-14-14z" fill={c.berryBg} {...st(c)} /></Fade>
    <Fade delay={1300}><G x="160" y="140"><Ball c={c} r={24} /></G></Fade>
  </G>
);
function BolicheC({ c }) {
  const p = useT(2600, { loop: true, easing: Easing.in(Easing.quad) });
  return (
    <G><Floor c={c} />
      <Rect x="34" y="166" width="8" height="10" rx="2" fill={c.sky} />
      <SvgText x="38" y="194" textAnchor="middle" fill={c.inkSoft} fontSize="11" fontFamily={F.bold}>línea</SvgText>
      {CUPS.map(([x, y], i) => {
        const [dx, dy, r] = KNOCK[i];
        return (
          <AG key={i} x={lerp(p, [0, 0.46, 0.7, 1], [x, x, x + dx, x + dx])} y={lerp(p, [0, 0.46, 0.7, 1], [y, y, y + dy, y + dy])}
            rotation={lerp(p, [0, 0.46, 0.7, 1], [0, 0, r, r])} originX={14} originY={15}>
            <Path d={CUP} fill={c.sun} {...st(c)} />
          </AG>
        );
      })}
      <AG x={lerp(p, [0, 0.48, 1], [54, 204, 204])} y={160} rotation={lerp(p, [0, 0.48, 1], [0, 540, 540])} opacity={lerp(p, [0, 0.85, 1], [1, 1, 0])}>
        <Ball c={c} r={13} />
      </AG>
    </G>
  );
}
const BolicheD = ({ c }) => (
  <G><Floor c={c} />
    <Rect x="70" y="30" width="180" height="130" rx="14" fill={c.paper} {...st(c)} />
    <SvgText x="160" y="62" textAnchor="middle" fill={c.ink} fontSize="20" fontFamily={F.display}>Tiro de Sofi</SvgText>
    {[0, 1, 2, 3].map((i) => <Fade key={i} delay={300 + i * 350}><Line x1={115 + i * 18} y1="80" x2={115 + i * 18} y2="130" stroke={c.ink} strokeWidth="5" strokeLinecap="round" /></Fade>)}
    <Fade delay={1800}><Line x1="104" y1="122" x2="182" y2="88" stroke={c.berry} strokeWidth="5" strokeLinecap="round" /></Fade>
    <Fade delay={2200}><SvgText x="214" y="120" textAnchor="middle" fill={c.ink} fontSize="38" fontFamily={F.display}>5</SvgText></Fade>
  </G>
);

// ---------- Camino de cinta ----------
function Draw({ d, len, delay, c }) {
  const v = useT(1300, { delay, easing: Easing.out(Easing.quad) });
  return <AP d={d} fill="none" stroke={c.sky} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={[len, len]} strokeDashoffset={lerp(v, [0, 1], [len, 0])} />;
}
const ZIG = 'M30 120L90 80L150 120L210 80L270 120';
const CintaA = ({ c }) => (
  <G>
    <Draw c={c} d="M30 40H290" len={262} delay={0} />
    <Draw c={c} d={ZIG} len={292} delay={600} />
    <Draw c={c} d="M30 168Q95 140 160 168T290 168" len={285} delay={1200} />
  </G>
);
function CintaB({ c }) {
  const p = useT(4000, { loop: true });
  return (
    <G>
      <Path d={ZIG} fill="none" stroke={c.sky} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <AG x={lerp(p, [0, 0.25, 0.5, 0.75, 1], [30, 90, 150, 210, 270])} y={lerp(p, [0, 0.25, 0.5, 0.75, 1], [120, 80, 120, 80, 120])}>
        <Circle cx="-6" cy="5" r="4.5" fill={c.ink} /><Circle cx="6" cy="-5" r="4.5" fill={c.ink} />
        <Circle cx="0" cy="0" r="10" fill={c.sun} {...st(c)} />
      </AG>
      <SvgText x="160" y="180" textAnchor="middle" fill={c.inkSoft} fontSize="12" fontFamily={F.bold}>vista desde arriba</SvgText>
    </G>
  );
}
function KidSide({ c }) {
  return (
    <G>
      <Circle cx="0" cy="122" r="9" fill={c.sun} {...st(c)} />
      <Path d="M0 131V152M0 152l-8 16M0 152l8 16M0 138l-11 6M0 138l11 -6" fill="none" {...st(c)} />
    </G>
  );
}
function CintaC({ c }) {
  const px = useT(3000, { loop: true });
  const py = useT(300, { loop: true, yoyo: true, easing: Easing.inOut(Easing.quad) });
  return (
    <G><Floor c={c} />
      <Rect x="30" y="168" width="260" height="7" rx="3" fill={c.sky} />
      <AG x={lerp(px, [0, 1], [30, 280])}><AG y={lerp(py, [0, 1], [0, -22])}><KidSide c={c} /></AG></AG>
    </G>
  );
}

// ---------- Fuerte de almohadas ----------
function Chairs({ c, anim }) {
  const v = useT(anim ? 700 : 1, { easing: Easing.out(Easing.quad) });
  const s = { fill: 'none', stroke: c.inkSoft, strokeWidth: 7, strokeLinecap: 'round' };
  return (
    <G>
      <AG x={lerp(v, [0, 1], [-60, 0])} opacity={v}><Path d="M70 88V174M70 130H110V174" {...s} /></AG>
      <AG x={lerp(v, [0, 1], [60, 0])} opacity={v}><Path d="M250 88V174M250 130H210V174" {...s} /></AG>
    </G>
  );
}
function Blanket({ c, drop }) {
  const v = useT(drop ? 900 : 1, { delay: drop ? 200 : 0, easing: Easing.out(Easing.back(1.3)) });
  return (
    <AG y={lerp(v, [0, 1], [-90, 0])} opacity={v}>
      <Path d="M56 96Q160 52 264 96L268 174H52Z" fill={c.leaf} {...st(c)} />
      <Path d="M90 110q20 6 30 -4M200 106q16 8 30 0" fill="none" stroke={c.paper} strokeWidth="2" opacity="0.6" />
    </AG>
  );
}
function Pillows({ c, anim }) {
  return (
    <G>
      {[[22, 150, 46, 24, 0], [252, 150, 46, 24, 250], [140, 62, 40, 18, 500]].map(([x, y, w, h, d], i) => (
        anim
          ? <Pop key={i} delay={d} x={x} y={y} ox={w / 2} oy={h}><Rect x="0" y="0" width={w} height={h} rx="10" fill={c.amberBg} {...st(c)} /></Pop>
          : <Rect key={i} x={x} y={y} width={w} height={h} rx="10" fill={c.amberBg} {...st(c)} />
      ))}
    </G>
  );
}
function Star({ c, x, y, delay }) {
  const v = useT(1400, { delay, loop: true, yoyo: true, easing: Easing.inOut(Easing.quad) });
  return <AG opacity={lerp(v, [0, 1], [0.2, 1])}><Path d={`M${x} ${y - 8}l2.5 5.5 6 .5-4.5 4 1.5 6-5.5-3-5.5 3 1.5-6-4.5-4 6-.5z`} fill={c.sun} /></AG>;
}
const FuerteA = ({ c }) => (<G><Floor c={c} /><Chairs c={c} anim /></G>);
const FuerteB = ({ c }) => (<G><Floor c={c} /><Chairs c={c} /><Blanket c={c} drop /></G>);
const FuerteC = ({ c }) => (<G><Floor c={c} /><Chairs c={c} /><Blanket c={c} /><Pillows c={c} anim /></G>);
const FuerteD = ({ c }) => (
  <G><Floor c={c} /><Blanket c={c} /><Pillows c={c} />
    <Path d="M128 174Q160 112 192 174Z" fill={c.ink} />
    <Circle cx="160" cy="154" r="9" fill={c.sun} {...st(c)} />
    <Rect x="148" y="160" width="24" height="12" rx="2" fill={c.paper} {...st(c)} />
    <Star c={c} x={70} y={40} delay={0} /><Star c={c} x={250} y={34} delay={500} /><Star c={c} x={200} y={22} delay={900} />
  </G>
);

export const DEMOS = {
  9: [
    { h: 'Arma la pirámide', p: '6 vasos: 3 abajo, 2 en medio y 1 arriba.', C: BolicheA },
    { h: 'Haz la pelota', p: 'Enrolla dos calcetines y mete uno dentro del otro.', C: BolicheB },
    { h: 'Tira desde la línea', p: 'Rueda la pelota desde una marca de cinta o un zapato.', C: BolicheC },
    { h: 'Anota los puntos', p: 'Cuenten cuántos vasos cayeron. Cada vaso es un punto.', C: BolicheD },
  ],
  5: [
    { h: 'Pega tres caminos', p: 'Uno recto, uno en zigzag y uno curvo, con cinta en el piso.', C: CintaA },
    { h: 'Camina como equilibrista', p: 'Sin pisar fuera de la cinta. Los brazos abiertos ayudan.', C: CintaB },
    { h: 'Ahora saltando', p: 'Prueben de puntitas, de lado y con saltos de conejo.', C: CintaC },
  ],
  3: [
    { h: 'Dos sillas como paredes', p: 'Ponlas de espaldas, separadas lo que mide la cobija.', C: FuerteA },
    { h: 'Cubre con la cobija', p: 'Que cuelgue por los lados. Deja una entrada libre.', C: FuerteB },
    { h: 'Refuerza con almohadas', p: 'Sobre las orillas para que no se resbale la cobija.', C: FuerteC },
    { h: 'Cuento adentro', p: 'Ya dentro, lean o inventen un cuento con linterna.', C: FuerteD },
  ],
};
