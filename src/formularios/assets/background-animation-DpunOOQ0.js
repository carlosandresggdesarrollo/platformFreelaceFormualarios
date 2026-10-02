import{j as e,B as n}from"./index-VW6ahCD1.js";const o=`@media (prefers-reduced-motion: reduce) {
  .bg-anim * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
}`,s={position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"},c=`
  @keyframes bg-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
`;function d(){return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[c,o]}),e.jsx(n,{sx:{position:"absolute",top:"15%",left:"8%",width:80,height:80,borderRadius:"50%",bgcolor:"var(--landing-circle1)",animation:"bg-float 8s ease-in-out infinite"}}),e.jsx(n,{sx:{position:"absolute",top:"25%",right:"12%",width:60,height:60,borderRadius:"50%",bgcolor:"var(--landing-circle2)",animation:"bg-float 10s ease-in-out infinite",animationDelay:"2s"}})]})}const p=`
  @keyframes bg-float-up {
    0% { transform: translateY(100vh) translateX(0); opacity: 0; }
    10% { opacity: var(--p-opacity, 0.2); }
    90% { opacity: var(--p-opacity, 0.2); }
    100% { transform: translateY(-10vh) translateX(var(--p-drift, 20px)); opacity: 0; }
  }
`;function y(){const r=Array.from({length:18},(a,t)=>({key:t,left:`${t*5.5%100}%`,size:3+t%4,duration:12+t%8*2,delay:t*1.3%10,opacity:.12+t%5*.04,drift:-30+t%7*10}));return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[p,o]}),r.map(a=>e.jsx(n,{sx:{position:"absolute",bottom:0,left:a.left,width:a.size,height:a.size,borderRadius:"50%",bgcolor:a.key%2===0?"var(--landing-primary)":"var(--landing-accent)",opacity:0,animation:`bg-float-up ${a.duration}s linear infinite`,animationDelay:`${a.delay}s`,"--p-opacity":a.opacity,"--p-drift":`${a.drift}px`}},a.key))]})}const m=`
  @keyframes bg-wave-move { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
`;function g(){const r=[{y:"65%",opacity:.08,dur:20,color:"var(--landing-primary)"},{y:"72%",opacity:.06,dur:25,color:"var(--landing-accent)"},{y:"80%",opacity:.05,dur:18,color:"var(--landing-circle1)"}];return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[m,o]}),r.map((a,t)=>e.jsx(n,{sx:{position:"absolute",top:a.y,left:0,width:"200%",height:120,opacity:a.opacity,animation:`bg-wave-move ${a.dur}s linear infinite`},children:e.jsx("svg",{width:"100%",height:"120",viewBox:"0 0 2400 120",preserveAspectRatio:"none",children:e.jsx("path",{d:"M0,60 C200,10 400,110 600,60 C800,10 1000,110 1200,60 C1400,10 1600,110 1800,60 C2000,10 2200,110 2400,60",fill:"none",stroke:a.color,strokeWidth:"2"})})},t))]})}const f=`
  @keyframes bg-bubble-rise {
    0% { transform: translateY(100vh) translateX(0) scale(0.4); opacity: 0; }
    10% { opacity: var(--b-opacity, 0.15); }
    80% { opacity: var(--b-opacity, 0.15); }
    100% { transform: translateY(-10vh) translateX(var(--b-drift, 30px)) scale(1); opacity: 0; }
  }
`;function u(){const r=Array.from({length:12},(a,t)=>({key:t,left:`${t*8.3%100}%`,size:12+t%5*8,duration:14+t%6*2,delay:t*1.5%12,opacity:.08+t%4*.03,drift:-40+t%9*10}));return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[f,o]}),r.map(a=>e.jsx(n,{sx:{position:"absolute",bottom:0,left:a.left,width:a.size,height:a.size,borderRadius:"50%",border:"1px solid",borderColor:a.key%2===0?"var(--landing-primary)":"var(--landing-accent)",opacity:0,animation:`bg-bubble-rise ${a.duration}s ease-in-out infinite`,animationDelay:`${a.delay}s`,"--b-opacity":a.opacity,"--b-drift":`${a.drift}px`}},a.key))]})}const x=`
  @keyframes bg-gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;function h(){return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[x,o]}),e.jsx(n,{sx:{position:"absolute",inset:0,opacity:.08,background:"linear-gradient(135deg, var(--landing-primary), var(--landing-accent), var(--landing-circle1), var(--landing-circle2))",backgroundSize:"400% 400%",animation:"bg-gradient-shift 20s ease infinite"}})]})}const b=`
  @keyframes bg-pulse-expand {
    0% { transform: translate(-50%,-50%) scale(0.2); opacity: 0.2; }
    100% { transform: translate(-50%,-50%) scale(1); opacity: 0; }
  }
`;function v(){const r=[0,3,6,9];return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[b,o]}),r.map((a,t)=>e.jsx(n,{sx:{position:"absolute",top:"50%",left:"50%",width:"80vmin",height:"80vmin",borderRadius:"50%",border:"1px solid",borderColor:t%2===0?"var(--landing-primary)":"var(--landing-accent)",opacity:0,animation:"bg-pulse-expand 12s ease-out infinite",animationDelay:`${a}s`}},t))]})}const j=`
  @keyframes bg-diagonal-scroll {
    0% { background-position: 0 0; }
    100% { background-position: 60px 60px; }
  }
`;function k(){return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[j,o]}),e.jsx(n,{sx:{position:"absolute",inset:0,opacity:.06,background:"repeating-linear-gradient(45deg, var(--landing-primary) 0px, var(--landing-primary) 1px, transparent 1px, transparent 30px)",backgroundSize:"42.43px 42.43px",animation:"bg-diagonal-scroll 15s linear infinite"}})]})}const $=`
  @keyframes bg-twinkle {
    0%, 100% { opacity: 0; transform: scale(0.5); }
    50% { opacity: var(--s-opacity, 0.3); transform: scale(1); }
  }
`;function z(){const r=Array.from({length:25},(a,t)=>({key:t,top:`${(t*17+3)%95}%`,left:`${(t*13+7)%97}%`,size:1+t%3,duration:4+t%6*2,delay:t*.7%8,opacity:.15+t%5*.05}));return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[$,o]}),r.map(a=>e.jsx(n,{sx:{position:"absolute",top:a.top,left:a.left,width:a.size,height:a.size,borderRadius:"50%",bgcolor:a.key%3===0?"var(--landing-accent)":"var(--landing-primary)",opacity:0,animation:`bg-twinkle ${a.duration}s ease-in-out infinite`,animationDelay:`${a.delay}s`,"--s-opacity":a.opacity}},a.key))]})}const w=`
  @keyframes bg-geo-float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-15px) rotate(5deg); }
    50% { transform: translateY(-8px) rotate(-3deg); }
    75% { transform: translateY(-20px) rotate(2deg); }
  }
`;function A(){const r=[{top:"10%",left:"5%",type:"square",size:20,dur:12,delay:0},{top:"30%",left:"85%",type:"circle",size:16,dur:15,delay:2},{top:"60%",left:"15%",type:"triangle",size:18,dur:10,delay:1},{top:"20%",left:"50%",type:"circle",size:12,dur:18,delay:3},{top:"75%",left:"70%",type:"square",size:14,dur:14,delay:4},{top:"45%",left:"35%",type:"triangle",size:22,dur:16,delay:2},{top:"85%",left:"90%",type:"circle",size:10,dur:11,delay:5}],a=t=>{const i={position:"absolute",top:t.top,left:t.left,opacity:.1,animation:`bg-geo-float ${t.dur}s ease-in-out infinite`,animationDelay:`${t.delay}s`};return t.type==="circle"?{...i,width:t.size,height:t.size,borderRadius:"50%",bgcolor:"var(--landing-primary)"}:t.type==="square"?{...i,width:t.size,height:t.size,borderRadius:2,border:"1.5px solid var(--landing-accent)"}:{...i,width:0,height:0,borderLeft:`${t.size/2}px solid transparent`,borderRight:`${t.size/2}px solid transparent`,borderBottom:`${t.size}px solid var(--landing-primary)`,opacity:.08}};return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[w,o]}),r.map((t,i)=>e.jsx(n,{sx:a(t)},i))]})}const N=`
  @keyframes bg-net-drift {
    0%, 100% { transform: translate(0, 0); }
    33% { transform: translate(var(--n-dx, 8px), var(--n-dy, -6px)); }
    66% { transform: translate(calc(var(--n-dx, 8px) * -0.5), calc(var(--n-dy, -6px) * -0.5)); }
  }
`;function R(){const r=[{cx:10,cy:20},{cx:25,cy:60},{cx:40,cy:15},{cx:55,cy:45},{cx:70,cy:25},{cx:85,cy:55},{cx:15,cy:80},{cx:45,cy:75},{cx:65,cy:70},{cx:90,cy:85},{cx:30,cy:40},{cx:75,cy:50},{cx:50,cy:90},{cx:20,cy:45},{cx:80,cy:10}],a=[[0,1],[0,3],[1,2],[2,4],[3,5],[4,5],[1,6],[3,7],[5,8],[7,9],[6,7],[8,9],[2,10],[10,3],[4,11],[11,5],[7,12],[0,13],[13,10],[4,14]];return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[N,o]}),e.jsxs("svg",{width:"100%",height:"100%",viewBox:"0 0 100 100",preserveAspectRatio:"xMidYMid slice",style:{position:"absolute",inset:0},children:[a.map(([t,i],l)=>e.jsx("line",{x1:r[t].cx,y1:r[t].cy,x2:r[i].cx,y2:r[i].cy,stroke:"var(--landing-primary)",strokeWidth:"0.15",opacity:"0.12"},`e${l}`)),r.map((t,i)=>e.jsx("circle",{cx:t.cx,cy:t.cy,r:"0.5",fill:"var(--landing-accent)",opacity:"0.2",style:{animation:`bg-net-drift ${10+i%5*3}s ease-in-out infinite`,animationDelay:`${i*.8%6}s`,"--n-dx":`${-1+i%3}%`,"--n-dy":`${-1+(i+1)%3}%`}},`n${i}`))]})]})}const Y=`
  @keyframes bg-aurora-sway {
    0%, 100% { transform: translateX(0) scaleY(1); }
    25% { transform: translateX(5%) scaleY(1.1); }
    50% { transform: translateX(-3%) scaleY(0.9); }
    75% { transform: translateX(4%) scaleY(1.05); }
  }
`;function _(){const r=[{top:"20%",color:"var(--landing-primary)",blur:100,opacity:.06,dur:18,delay:0},{top:"35%",color:"var(--landing-accent)",blur:120,opacity:.05,dur:22,delay:3},{top:"50%",color:"var(--landing-circle1)",blur:90,opacity:.07,dur:15,delay:1},{top:"65%",color:"var(--landing-circle2)",blur:110,opacity:.04,dur:20,delay:5}];return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[Y,o]}),r.map((a,t)=>e.jsx(n,{sx:{position:"absolute",top:a.top,left:"-10%",width:"120%",height:150,bgcolor:a.color,filter:`blur(${a.blur}px)`,opacity:a.opacity,borderRadius:"50%",animation:`bg-aurora-sway ${a.dur}s ease-in-out infinite`,animationDelay:`${a.delay}s`}},t))]})}const D=`
  @keyframes bg-confetti-fall {
    0% { transform: translateY(-5vh) rotate(0deg); opacity: 0; }
    10% { opacity: var(--c-opacity, 0.2); }
    90% { opacity: var(--c-opacity, 0.2); }
    100% { transform: translateY(105vh) rotate(var(--c-rot, 360deg)); opacity: 0; }
  }
`;function O(){const r=Array.from({length:18},(a,t)=>({key:t,left:`${t*5.5%98}%`,width:4+t%3,height:2+t%2,duration:10+t%8*2,delay:t*.9%8,opacity:.12+t%4*.04,rotation:180+t%4*90,initialRot:t*30%360}));return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[D,o]}),r.map(a=>e.jsx(n,{sx:{position:"absolute",top:0,left:a.left,width:a.width,height:a.height,borderRadius:.5,bgcolor:a.key%3===0?"var(--landing-primary)":a.key%3===1?"var(--landing-accent)":"var(--landing-circle1)",opacity:0,transform:`rotate(${a.initialRot}deg)`,animation:`bg-confetti-fall ${a.duration}s linear infinite`,animationDelay:`${a.delay}s`,"--c-opacity":a.opacity,"--c-rot":`${a.rotation}deg`}},a.key))]})}const C=`
  @keyframes bg-hex-pulse {
    0%, 100% { opacity: 0.04; transform: scale(1); }
    50% { opacity: 0.1; transform: scale(1.05); }
  }
`;function S(){const r=Array.from({length:12},(a,t)=>({key:t,top:`${10+Math.floor(t/4)*30}%`,left:`${5+t%4*25+(Math.floor(t/4)%2===1?12:0)}%`,size:50+t%3*10,delay:t*.8%6}));return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[C,o]}),r.map(a=>e.jsx(n,{sx:{position:"absolute",top:a.top,left:a.left,width:a.size,height:a.size,clipPath:"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",border:"1px solid",borderColor:a.key%2===0?"var(--landing-primary)":"var(--landing-accent)",opacity:.04,animation:`bg-hex-pulse ${10+a.key%4*2}s ease-in-out infinite`,animationDelay:`${a.delay}s`}},a.key))]})}const F=`
  @keyframes bg-ripple {
    0% { transform: translate(-50%,-50%) scale(0); opacity: 0.15; }
    100% { transform: translate(-50%,-50%) scale(1); opacity: 0; }
  }
`;function K(){const r=[0,2.5,5,7.5,10];return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[F,o]}),r.map((a,t)=>e.jsx(n,{sx:{position:"absolute",top:"50%",left:"50%",width:"90vmin",height:"90vmin",borderRadius:"50%",border:"1px solid",borderColor:t%2===0?"var(--landing-primary)":"var(--landing-accent)",opacity:0,animation:"bg-ripple 12s ease-out infinite",animationDelay:`${a}s`}},t))]})}const E=`
  @keyframes bg-snow-fall {
    0% { transform: translateY(-5vh) translateX(0); opacity: 0; }
    10% { opacity: var(--sf-opacity, 0.15); }
    90% { opacity: var(--sf-opacity, 0.15); }
    100% { transform: translateY(105vh) translateX(var(--sf-drift, 30px)); opacity: 0; }
  }
`;function M(){const r=Array.from({length:18},(a,t)=>({key:t,left:`${t*5.5%98}%`,size:2+t%4,duration:12+t%7*2,delay:t*1.1%10,opacity:.1+t%4*.03,drift:-40+t%9*10}));return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[E,o]}),r.map(a=>e.jsx(n,{sx:{position:"absolute",top:0,left:a.left,width:a.size,height:a.size,borderRadius:"50%",bgcolor:a.key%2===0?"var(--landing-primary)":"var(--landing-accent)",opacity:0,animation:`bg-snow-fall ${a.duration}s linear infinite`,animationDelay:`${a.delay}s`,"--sf-opacity":a.opacity,"--sf-drift":`${a.drift}px`}},a.key))]})}const X=`
  @keyframes bg-plasma-morph {
    0%, 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: translate(0,0) scale(1); }
    25% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: translate(2%,-3%) scale(1.05); }
    50% { border-radius: 50% 60% 30% 60% / 50% 70% 30% 50%; transform: translate(-2%,2%) scale(0.95); }
    75% { border-radius: 30% 50% 70% 40% / 60% 40% 50% 60%; transform: translate(1%,1%) scale(1.02); }
  }
`;function I(){const r=[{top:"15%",left:"10%",size:250,color:"var(--landing-primary)",dur:18,delay:0},{top:"50%",left:"60%",size:300,color:"var(--landing-accent)",dur:22,delay:3},{top:"70%",left:"20%",size:200,color:"var(--landing-circle1)",dur:15,delay:1},{top:"25%",left:"75%",size:220,color:"var(--landing-circle2)",dur:20,delay:5}];return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[X,o]}),r.map((a,t)=>e.jsx(n,{sx:{position:"absolute",top:a.top,left:a.left,width:a.size,height:a.size,bgcolor:a.color,filter:"blur(80px)",opacity:.07,animation:`bg-plasma-morph ${a.dur}s ease-in-out infinite`,animationDelay:`${a.delay}s`}},t))]})}const B=`
  @keyframes bg-ray-rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;function P(){const r=[{origin:"top left",angle:45,color:"var(--landing-primary)"},{origin:"top right",angle:-45,color:"var(--landing-accent)"},{origin:"bottom left",angle:-45,color:"var(--landing-circle1)"},{origin:"bottom right",angle:45,color:"var(--landing-circle2)"}];return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[B,o]}),r.map((a,t)=>{const i=a.origin.includes("top"),l=a.origin.includes("left");return e.jsx(n,{sx:{position:"absolute",top:i?0:"auto",bottom:i?"auto":0,left:l?0:"auto",right:l?"auto":0,width:"60vmax",height:3,background:`linear-gradient(${l?"90deg":"270deg"}, ${a.color}, transparent)`,opacity:.08,transformOrigin:`${l?"0":"100"}% 50%`,animation:"bg-ray-rotate 25s linear infinite",animationDelay:`${t*2}s`,animationDirection:t%2===0?"normal":"reverse"}},t)})]})}const T=`
  @keyframes bg-spiral-rotate { 0% { transform: translate(-50%,-50%) rotate(0deg); } 100% { transform: translate(-50%,-50%) rotate(360deg); } }
`;function L(){const r=Array.from({length:24},(a,t)=>{const i=t/24*Math.PI*4,l=5+t*1.5;return{key:t,cx:50+Math.cos(i)*l,cy:50+Math.sin(i)*l,r:.3+t%3*.2}});return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[T,o]}),e.jsx("svg",{width:"100%",height:"100%",viewBox:"0 0 100 100",preserveAspectRatio:"xMidYMid slice",style:{position:"absolute",inset:0,animation:"bg-spiral-rotate 60s linear infinite",transformOrigin:"50% 50%"},children:r.map(a=>e.jsx("circle",{cx:a.cx,cy:a.cy,r:a.r,fill:a.key%2===0?"var(--landing-primary)":"var(--landing-accent)",opacity:.12+a.key%4*.03},a.key))})]})}const q=`
  @keyframes bg-cube-float {
    0%, 100% { transform: translateY(0) rotateX(0deg) rotateY(0deg); }
    25% { transform: translateY(-12px) rotateX(5deg) rotateY(10deg); }
    50% { transform: translateY(-6px) rotateX(-3deg) rotateY(-5deg); }
    75% { transform: translateY(-18px) rotateX(4deg) rotateY(8deg); }
  }
`;function U(){const r=Array.from({length:7},(a,t)=>({key:t,top:`${10+t*13%80}%`,left:`${5+t*14%90}%`,size:20+t%4*8,dur:12+t%5*3,delay:t*1.5%8}));return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[q,o]}),r.map(a=>e.jsx(n,{sx:{position:"absolute",top:a.top,left:a.left,width:a.size,height:a.size,border:"1px solid",borderColor:a.key%2===0?"var(--landing-primary)":"var(--landing-accent)",opacity:.08,transformStyle:"preserve-3d",perspective:200,animation:`bg-cube-float ${a.dur}s ease-in-out infinite`,animationDelay:`${a.delay}s`}},a.key))]})}const G=`
  @keyframes bg-equalizer {
    0%, 100% { transform: scaleY(var(--eq-min, 0.2)); }
    50% { transform: scaleY(var(--eq-max, 0.8)); }
  }
`;function H(){const r=Array.from({length:10},(a,t)=>({key:t,left:`${10+t*8}%`,width:3,maxH:.3+t%4*.15,minH:.1+t%3*.05,dur:2+t%5*.8,delay:t*.3%3}));return e.jsxs(n,{sx:s,className:"bg-anim",children:[e.jsxs("style",{children:[G,o]}),r.map(a=>e.jsx(n,{sx:{position:"absolute",bottom:"5%",left:a.left,width:a.width,height:"30%",bgcolor:a.key%2===0?"var(--landing-primary)":"var(--landing-accent)",opacity:.08,borderRadius:1,transformOrigin:"bottom center",animation:`bg-equalizer ${a.dur}s ease-in-out infinite`,animationDelay:`${a.delay}s`,"--eq-min":a.minH,"--eq-max":a.maxH}},a.key))]})}const W={minimalista:d,particulas:y,ondas:g,burbujas:u,gradiente:h,pulso:v,diagonales:k,estrellas:z,geometria:A,red:R,aurora:_,confeti:O,hexagonos:S,concentricas:K,copos:M,plasma:I,rayos:P,espiral:L,cubos:U,sonido:H};function Q({animation:r}){const a=W[r];return a?e.jsx(a,{}):null}export{Q as B};
