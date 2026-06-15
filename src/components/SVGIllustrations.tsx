/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

// 3D Cake SVG with detailed gradients, frosting layers, and a moving candle flame
export function CakeIllustration() {
  return (
    <div className="w-full h-full flex items-center justify-center relative select-none">
      {/* Absolute background visual bubble shadow */}
      <div className="absolute w-44 h-8 bg-black/5 blur-xl rounded-full bottom-8" />
      
      <motion.svg
        viewBox="0 0 400 400"
        className="w-64 h-64 drop-shadow-[0_15px_30px_rgba(0,0,0,0.06)]"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <defs>
          {/* Gradients for 3D look */}
          <radialGradient id="cakeShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          
          <linearGradient id="frostingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E6C8FB" />
            <stop offset="60%" stopColor="#B57EDC" />
            <stop offset="100%" stopColor="#9C52CC" />
          </linearGradient>

          <linearGradient id="spongeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFDEB4" />
            <stop offset="100%" stopColor="#FFC58D" />
          </linearGradient>

          <linearGradient id="creamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F5EFEA" />
          </linearGradient>

          <linearGradient id="candleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF9F9F" />
            <stop offset="50%" stopColor="#FF7B7B" />
            <stop offset="100%" stopColor="#E04D4D" />
          </linearGradient>

          <radialGradient id="flameGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF275" />
            <stop offset="30%" stopColor="#FF8E53" />
            <stop offset="100%" stopColor="#FF4B4B" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="flameInner" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FFE066" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF9933" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Shadow base inside SVG */}
        <ellipse cx="200" cy="330" rx="110" ry="18" fill="url(#cakeShadow)" />

        {/* Bottom Sponge Layer */}
        <path d="M90,240 Q200,270 310,240 L310,310 Q200,340 90,310 Z" fill="url(#spongeGrad)" />

        {/* Center Cream Filling Rib */}
        <path d="M88,242 Q200,272 312,242 L312,262 Q200,292 88,262 Z" fill="url(#creamGrad)" opacity="0.95" />

        {/* Top Sponge Cylinder Body */}
        <path d="M90,170 Q200,195 310,170 L310,245 Q200,274 90,245 Z" fill="url(#spongeGrad)" />

        {/* Dripping Purple Frosting Layer */}
        <path d="M90,170 Q200,195 310,170 
                 L310,205 Q295,225 285,195 
                 Q270,230 255,200 
                 Q240,235 225,195 
                 Q210,240 190,200 
                 Q175,230 160,195 
                 Q145,235 130,200
                 Q115,225 105,195
                 Q95,215 90,195 Z" fill="url(#frostingGrad)" />

        {/* Smooth Top Cake Cap */}
        <ellipse cx="200" cy="170" rx="110" ry="32" fill="#D3A2FE" />
        <ellipse cx="200" cy="168" rx="104" ry="28" fill="#E6D8F2" opacity="0.4" />

        {/* Colorful Sprinkles on Frosting */}
        <rect x="130" y="160" width="12" height="6" rx="3" transform="rotate(15,130,160)" fill="#FFF59D" />
        <rect x="170" y="152" width="12" height="6" rx="3" transform="rotate(-25,170,152)" fill="#FF8A8A" />
        <rect x="250" y="155" width="12" height="6" rx="3" transform="rotate(40,250,155)" fill="#90CAF9" />
        <rect x="220" y="172" width="12" height="6" rx="3" transform="rotate(-10,220,172)" fill="#FFF59D" />
        <rect x="150" y="175" width="12" height="6" rx="3" transform="rotate(30,150,175)" fill="#B2F7EF" />
        <rect x="270" y="168" width="12" height="6" rx="3" transform="rotate(-45,270,168)" fill="#E1BEE7" />
        <rect x="110" y="171" width="12" height="6" rx="3" transform="rotate(50,110,171)" fill="#FFD166" />
        <rect x="190" y="165" width="12" height="6" rx="3" transform="rotate(5,190,165)" fill="#FF8A8A" />

        {/* The Candle */}
        <rect x="192" y="100" width="16" height="75" rx="4" fill="url(#candleGrad)" />
        {/* Candle tip wick */}
        <line x1="200" y1="100" x2="200" y2="90" stroke="#5d4037" strokeWidth="3" strokeLinecap="round" />

        {/* Glowing Flickering Flame */}
        <motion.path
          d="M200,90 Q182,72 200,32 Q218,72 200,90 Z"
          fill="url(#flameGrad)"
          animate={{
            scaleY: [1, 1.15, 0.95, 1.05, 1],
            scaleX: [1, 0.9, 1.1, 0.95, 1],
            skewX: [0, 4, -4, 2, -2, 0],
            y: [0, -1, 1, -0.5, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ originX: '200px', originY: '90px' }}
        />

        <motion.path
          d="M200,88 Q188,75 200,45 Q212,75 200,88 Z"
          fill="url(#flameInner)"
          animate={{
            scaleY: [1, 1.1, 0.9, 1.05, 1],
            scaleX: [1, 0.95, 1.05, 0.98, 1],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ originX: '200px', originY: '88px' }}
        />
      </motion.svg>
    </div>
  );
}

// 3D Balloons SVG (Pink & Blue) floating and oscillating slowly
export function BalloonsIllustration() {
  return (
    <div className="w-full h-full flex items-center justify-center relative select-none">
      <div className="absolute w-40 h-8 bg-black/5 blur-xl rounded-full bottom-8" />
      
      <svg
        viewBox="0 0 400 400"
        className="w-64 h-64 drop-shadow-[0_15px_35px_rgba(0,0,0,0.06)]"
      >
        <defs>
          {/* Pink Balloon Gradients */}
          <radialGradient id="pinkBalloonGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFF0F5" />
            <stop offset="40%" stopColor="#FFA6C9" />
            <stop offset="85%" stopColor="#F868A9" />
            <stop offset="100%" stopColor="#D52A77" />
          </radialGradient>
          
          {/* Blue Balloon Gradients */}
          <radialGradient id="blueBalloonGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#E0F7FA" />
            <stop offset="40%" stopColor="#80DEEA" />
            <stop offset="85%" stopColor="#26C6DA" />
            <stop offset="100%" stopColor="#00838F" />
          </radialGradient>

          <radialGradient id="balloonGloss" cx="30%" cy="30%" r="30%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* LEFT BALLOON (Pink) with full floating animation */}
        <motion.g
          animate={{
            y: [0, -12, 0, -8, 0],
            rotate: [-2, 3, -1, 2, -2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ originX: '170px', originY: '280px' }}
        >
          {/* String */}
          <path d="M170,230 Q160,280 180,310 T165,350 T180,380" fill="none" stroke="#E292B2" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Triangle Tie */}
          <polygon points="170,222 163,234 177,234" fill="#F868A9" />

          {/* Balloon Body */}
          <ellipse cx="170" cy="150" rx="55" r_y="70" rx-y-diff="true" className="origin-center" style={{ rY: 72 }} fill="url(#pinkBalloonGrad)" />
          {/* Gloss overlay */}
          <ellipse cx="150" cy="125" rx="18" ry="12" transform="rotate(-20, 150, 125)" fill="url(#balloonGloss)" />
        </motion.g>

        {/* RIGHT BALLOON (Blue) with staggered floating animation */}
        <motion.g
          animate={{
            y: [-3, 9, -5, 4, -3],
            rotate: [3, -2, 2, -1, 3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          style={{ originX: '235px', originY: '270px' }}
        >
          {/* String */}
          <path d="M235,220 Q245,260 225,295 T235,340 T220,375" fill="none" stroke="#80DEEA" strokeWidth="2.5" strokeLinecap="round" />

          {/* Triangle Tie */}
          <polygon points="235,212 228,224 242,224" fill="#26C6DA" />

          {/* Balloon Body */}
          <ellipse cx="235" cy="142" rx="52" ry="68" fill="url(#blueBalloonGrad)" />
          {/* Gloss Overlay */}
          <ellipse cx="218" cy="118" rx="16" ry="11" transform="rotate(-20, 218, 118)" fill="url(#balloonGloss)" />
        </motion.g>
      </svg>
    </div>
  );
}

// 3D Celebration & Sparks (Champagne cup popping confetti)
export function FestiveIllustration() {
  return (
    <div className="w-full h-full flex items-center justify-center relative select-none">
      <div className="absolute w-36 h-8 bg-black/5 blur-xl rounded-full bottom-8" />
      
      <svg
        viewBox="0 0 400 400"
        className="w-64 h-64 drop-shadow-[0_15px_30px_rgba(0,0,0,0.06)]"
      >
        <defs>
          <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="30%" stopColor="#E6F4F8" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#D4EBF2" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#B2DFEE" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="liqGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="50%" stopColor="#FFD54F" />
            <stop offset="100%" stopColor="#FFC107" />
          </linearGradient>

          <filter id="glassGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dynamic rising bubbles */}
        <g fill="#FFF59D" opacity="0.8">
          <motion.circle cx="180" cy="160" r="4" animate={{ y: [-10, -80], opacity: [0.8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />
          <motion.circle cx="205" cy="152" r="3" animate={{ y: [-5, -70], opacity: [0.8, 0] }} transition={{ duration: 2.3, repeat: Infinity, ease: "easeOut", delay: 0.4 }} />
          <motion.circle cx="192" cy="168" r="5" animate={{ y: [-15, -90], opacity: [0.8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.8 }} />
          <motion.circle cx="220" cy="162" r="3.5" animate={{ y: [-8, -65], opacity: [0.8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 1.1 }} />
        </g>

        {/* Celebrating Confetti Popping */}
        <g>
          {/* Confetti Particles */}
          <motion.circle cx="140" cy="110" r="6" fill="#F8DDEB" animate={{ scale: [0, 1.2, 1], y: [0, -40], x: [0, -30], rotate: 360 }} transition={{ duration: 4, repeat: Infinity }} />
          <motion.rect x="150" y="80" width="10" height="15" rx="3" fill="#B57EDC" animate={{ y: [0, -50], x: [0, -10], rotate: [0, 180, 360] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.2 }} />
          <motion.polygon points="210,75 220,60 225,80" fill="#FFF59D" animate={{ y: [0, -60], x: [0, 15], rotate: [0, -180, -360] }} transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }} />
          <motion.circle cx="250" cy="100" r="5" fill="#E6D8F2" animate={{ scale: [0, 1.1, 1], y: [0, -50], x: [0, 40] }} transition={{ duration: 3.8, repeat: Infinity, delay: 0.1 }} />
          <motion.rect x="235" y="120" width="12" height="6" rx="2" fill="#FFA6C9" animate={{ y: [0, -30], x: [0, 25], rotate: 120 }} transition={{ duration: 3, repeat: Infinity, delay: 0.6 }} />
          <motion.circle cx="195" cy="70" r="4.5" fill="#B2F7EF" animate={{ y: [0, -70], x: [0, -5] }} transition={{ duration: 3.2, repeat: Infinity, delay: 0.3 }} />
        </g>

        {/* Champagne Cup Body */}
        <motion.g
          animate={{
            rotate: [2, -2, 2],
            y: [0, -4, 0]
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ originX: '200px', originY: '330px' }}
        >
          {/* Stem & Base */}
          <path d="M195,260 L205,260 L205,330 L195,330 Z" fill="url(#glassGrad)" />
          <ellipse cx="200" cy="330" rx="45" ry="10" fill="url(#glassGrad)" />

          {/* Liquid content in the glass */}
          <path d="M136,180 Q200,210 264,180 Q260,250 200,260 Q140,250 136,180 Z" fill="url(#liqGrad)" />
          {/* Shadow/Reflection border on liquid */}
          <path d="M136,180 Q200,210 264,180" fill="none" stroke="#FFF59D" strokeWidth="3" />

          {/* Main Glass Bowl Cup (translucent) */}
          <path d="M130,160 Q200,195 270,160 C270,240 240,270 200,270 C160,270 130,240 130,160 Z" fill="url(#glassGrad)" />
          
          {/* Glass Rim highlight */}
          <ellipse cx="200" cy="160" rx="70" ry="12" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />
        </motion.g>
      </svg>
    </div>
  );
}

// 3D Gift Box illustration
export function GiftIllustration() {
  return (
    <div className="w-full h-full flex items-center justify-center relative select-none">
      <div className="absolute w-40 h-8 bg-black/5 blur-xl rounded-full bottom-8" />
      
      <svg
        viewBox="0 0 400 400"
        className="w-64 h-64 drop-shadow-[0_15px_30px_rgba(0,0,0,0.06)]"
      >
        <defs>
          <linearGradient id="boxFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C39FF3" />
            <stop offset="100%" stopColor="#B57EDC" />
          </linearGradient>
          
          <linearGradient id="boxSide" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9E68C7" />
            <stop offset="100%" stopColor="#8A4FB3" />
          </linearGradient>

          <linearGradient id="boxTop" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D8BEF7" />
            <stop offset="100%" stopColor="#C9A3F4" />
          </linearGradient>

          <linearGradient id="ribbonGradV" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFAEC9" />
            <stop offset="50%" stopColor="#FF91B6" />
            <stop offset="100%" stopColor="#FF709F" />
          </linearGradient>

          <linearGradient id="ribbonGradH" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFAEC9" />
            <stop offset="100%" stopColor="#FF709F" />
          </linearGradient>
        </defs>

        <motion.g
          animate={{
            y: [0, -8, 0],
            rotate: [0, 2, -1, 0]
          }}
          transition={{
            duration: 4.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ originX: '200px', originY: '250px' }}
        >
          {/* Main 3D Gift Box Body (Drawn with Isometric-like vectors) */}
          
          {/* LEFT SIDE WALL */}
          <path d="M120,200 L200,235 L200,315 L120,275 Z" fill="url(#boxSide)" />
          
          {/* RIGHT SIDE WALL */}
          <path d="M200,235 L280,200 L280,275 L200,315 Z" fill="url(#boxFront)" />
          
          {/* LID TOP SLAB */}
          <path d="M114,195 L200,158 L286,195 L200,228 Z" fill="url(#boxTop)" />
          
          {/* LID LEFT EDGE */}
          <path d="M114,195 L200,228 L200,240 L114,207 Z" fill="#9E68C7" />
          
          {/* LID RIGHT EDGE */}
          <path d="M200,228 L286,195 L286,207 L200,240 Z" fill="#B57EDC" />

          {/* Vertical Pink Ribbon (Left Wall / Isometric Side) */}
          <path d="M154,215 L166,220 L166,298 L154,292 Z" fill="url(#ribbonGradH)" opacity="0.95" />
          
          {/* Vertical Pink Ribbon (Right Wall) */}
          <path d="M234,220 L246,215 L246,292 L234,298 Z" fill="url(#ribbonGradH)" />

          {/* Lid Ribbon top crossing (Left segment) */}
          <path d="M154,211 L200,192 L200,203 L154,222 Z" fill="url(#ribbonGradV)" opacity="0.9" />
          
          {/* Lid Ribbon top crossing (Right segment) */}
          <path d="M200,192 L246,211 L246,222 L200,203 Z" fill="url(#ribbonGradV)" />

          {/* THE BIG BEAUTIFUL BOW ON TOP */}
          <g transform="translate(200, 168)">
            {/* Left Bow Loop */}
            <motion.path
              d="M0,-8 C-30,-45 -60,-20 -20,-3 C-5,3 0,-8 0,-8"
              fill="url(#ribbonGradH)"
              stroke="#FF709F"
              strokeWidth="1.5"
              animate={{
                scale: [1, 1.05, 0.98, 1],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Right Bow Loop */}
            <motion.path
              d="M0,-8 C30,-45 60,-20 20,-3 C5,3 0,-8 0,-8"
              fill="url(#ribbonGradH)"
              stroke="#FF709F"
              strokeWidth="1.5"
              animate={{
                scale: [1, 0.97, 1.04, 1],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
            {/* Ribbons Streamers (Loose Ribbon tails) */}
            <path d="M-6,-2 Q-35,30 -25,48" fill="none" stroke="#FF709F" strokeWidth="8" strokeLinecap="round" />
            <path d="M6,-2 Q35,30 22,50" fill="none" stroke="#FF709F" strokeWidth="8" strokeLinecap="round" />

            {/* Central Round Node knot */}
            <circle cx="0" cy="-6" r="10" fill="url(#ribbonGradV)" stroke="#FF709F" strokeWidth="1" />
          </g>
        </motion.g>
      </svg>
    </div>
  );
}

// 3D-inspired Dial Clock & Countdown stars illustration for the success countdown
export function ClockIllustration() {
  return (
    <div className="w-full h-full flex items-center justify-center relative select-none">
      <div className="absolute w-36 h-8 bg-black/5 blur-xl rounded-full bottom-8" />
      
      <svg
        viewBox="0 0 400 400"
        className="w-64 h-64 drop-shadow-[0_15px_30px_rgba(0,0,0,0.06)]"
      >
        <defs>
          <radialGradient id="dialGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="85%" stopColor="#FAF7F2" />
            <stop offset="100%" stopColor="#EFEBE7" />
          </radialGradient>

          <linearGradient id="rimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E6D8F2" />
            <stop offset="100%" stopColor="#B57EDC" />
          </linearGradient>

          <filter id="starGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* Floating background glowing stars */}
        <g fill="#FFF59D" filter="url(#starGlow)">
          <motion.path
            d="M80,120 L84,110 L94,114 L86,120 L89,130 L80,124 L71,130 L74,120 L66,114 L76,110 Z"
            animate={{ scale: [0.7, 1.2, 0.7], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.path
            d="M310,140 L313,132 L321,135 L315,140 L317,148 L310,143 L303,148 L305,140 L299,135 L307,132 Z"
            animate={{ scale: [1.1, 0.6, 1.1], opacity: [0.9, 0.3, 0.9] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
          />
        </g>

        {/* Floating micro stars around bottom */}
        <g fill="#FFA6C9">
          <motion.circle cx="100" cy="280" r="4.5" animate={{ scale: [0.5, 1.3, 0.5] }} transition={{ duration: 2.8, repeat: Infinity, delay: 0.2 }} />
          <motion.circle cx="300" cy="270" r="3" animate={{ scale: [1.3, 0.5, 1.3] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }} />
        </g>

        {/* Ticking dial base frame */}
        <motion.g
          animate={{
            y: [0, -6, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Main 3D outer rim */}
          <circle cx="200" cy="200" r="95" fill="url(#rimGrad)" />
          <circle cx="200" cy="202" r="88" fill="#B57EDC" opacity="0.3" />
          <circle cx="200" cy="198" r="88" fill="url(#dialGrad)" />

          {/* Hour markers on dial */}
          <circle cx="200" cy="122" r="3" fill="#B57EDC" />
          <circle cx="278" cy="200" r="3" fill="#B57EDC" />
          <circle cx="200" cy="278" r="3" fill="#B57EDC" />
          <circle cx="122" cy="200" r="3" fill="#B57EDC" />

          {/* Clock Hands with smooth tracking animation */}
          
          {/* Hour Hand (steady, slightly tilted) */}
          <rect x="197" y="155" width="6" height="50" rx="3" fill="#333333" transform="rotate(70, 200, 200)" style={{ originX: '200px', originY: '200px' }} />

          {/* Minute Hand (sweeping representation) */}
          <motion.rect
            x="198" y="138"
            width="4"
            height="68"
            rx="2"
            fill="#333333"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            style={{ originX: '200px', originY: '200px' }}
          />

          {/* Seconds Hand (fast sweeping, high contrast violet) */}
          <motion.line
            x1="200" y1="220"
            x2="200" y2="128"
            stroke="#EA33F7"
            strokeWidth="1.5"
            strokeLinecap="round"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            style={{ originX: '200px', originY: '200px' }}
          />

          {/* Central golden cap */}
          <circle cx="200" cy="200" r="7" fill="#FFF59D" stroke="#B57EDC" strokeWidth="2.5" />
        </motion.g>
      </svg>
    </div>
  );
}
