// Fixed, decorative backdrop behind every page: three slowly drifting light
// orbs and a field of faint geometric shards, coloured by the active palette
// (glass-theme.scss). The glass cards blur whatever sits behind them, so this
// layer is what gives them depth and refraction. Server component, no JS.
const SHARDS = [
  "40,0 140,60 70,120",
  "300,20 380,90 280,140",
  "620,0 720,40 660,130",
  "900,60 1010,10 980,150",
  "1180,30 1260,110 1150,140",
  "110,300 220,260 190,390",
  "460,220 560,300 430,330",
  "780,260 880,220 860,360",
  "1060,300 1180,260 1120,400",
  "20,520 130,480 90,620",
  "330,560 440,500 420,640",
  "640,480 760,540 650,620",
  "960,560 1060,500 1080,640",
  "1220,520 1300,600 1200,640",
  "200,720 320,680 280,800",
  "560,700 680,760 540,800",
  "900,720 1000,680 1020,800",
];

export default function PrismBackground() {
  return (
    <div className="pv-prism-bg" aria-hidden="true">
      <span className="pv-orb pv-orb--1" />
      <span className="pv-orb pv-orb--2" />
      <span className="pv-orb pv-orb--3" />
      <svg className="pv-shards" viewBox="0 0 1300 800" preserveAspectRatio="xMidYMid slice">
        {SHARDS.map((points, i) => (
          <polygon key={points} points={points} className={`pv-shard pv-shard--${i % 3}`} />
        ))}
      </svg>
    </div>
  );
}
