import React, { useId } from 'react';

export const worldPalette = {
  Anime: ['#f29cc5', '#863fb2', '#241333'],
  Gaming: ['#77f7cd', '#137d85', '#091f29'],
  Movies: ['#ffc57e', '#995232', '#211329'],
  'TV Shows': ['#94aafa', '#4d52ba', '#14182f'],
  'K-Pop': ['#f799d3', '#b63a83', '#29102e'],
  Comics: ['#f5d86d', '#c17c30', '#292039'],
  Manga: ['#dee4e5', '#82969d', '#19242c'],
  Cosplay: ['#bda4ff', '#7f46ac', '#28142c'],
};

// Original vector scenes: no downloaded fandom art, third-party marks or runtime image dependency.
export function UniverseArtwork({ category = 'Anime', className = '' }) {
  const id = useId().replaceAll(':', ''),
    [light, mid, dark] = worldPalette[category] || worldPalette.Anime;
  return (
    <svg
      className={`universe-artwork ${className}`}
      viewBox="0 0 500 320"
      role="img"
      aria-label={`${category} universe illustration`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x2=".8" y2="1">
          <stop stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop stopColor="#fff5dd" />
          <stop offset=".55" stopColor={light} />
          <stop offset="1" stopColor={light} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-floor`} x2="0" y2="1">
          <stop stopColor={light} stopOpacity=".26" />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <pattern id={`${id}-dots`} width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill={light} opacity=".25" />
        </pattern>
      </defs>
      <rect width="500" height="320" fill={`url(#${id}-sky)`} />
      <ellipse cx="320" cy="98" rx="190" ry="150" fill={`url(#${id}-sun)`} opacity=".35" />
      <g fill={light} opacity=".6">
        {Array.from({ length: 24 }, (_, i) => (
          <circle
            key={i}
            cx={(i * 79 + 23) % 500}
            cy={(i * 31 + 17) % 195}
            r={i % 4 === 0 ? 1.5 : 0.7}
          />
        ))}
      </g>
      {category === 'Anime' && (
        <>
          <circle cx="326" cy="106" r="53" fill={light} />
          <circle cx="326" cy="106" r="64" fill="none" stroke={light} opacity=".3" />
          <path d="M0 248 105 117 210 239 292 152 438 251 500 212V320H0" fill={dark} opacity=".7" />
          <path d="m69 163 36-46 40 47-31-12-9 9-11-11Z" fill="#fff0ed" opacity=".5" />
          <path d="M0 286Q100 256 250 277T500 275V320H0" fill={dark} />
          <g fill="#1b1329">
            <path d="m132 137 9-6q110 33 220 0l10 6-11 18q-110 15-218 0Z" />
            <path d="M143 168h218v10H143zM166 147h14v134h-18zM327 147h14l4 134h-18zM245 148h13v28h-13z" />
          </g>
          <g fill={light} opacity=".7">
            {Array.from({ length: 9 }, (_, i) => (
              <ellipse
                key={i}
                cx={35 + i * 54}
                cy={120 + ((i * 19) % 100)}
                rx="5"
                ry="2"
                transform={`rotate(${i * 23} ${35 + i * 54} ${120 + ((i * 19) % 100)})`}
              />
            ))}
          </g>
        </>
      )}
      {category === 'Gaming' && (
        <>
          <path d="M0 245 102 211 186 234 298 196 430 220 500 189V320H0" fill={dark} />
          <path d="m130 186 120-65 119 65-120 68Z" fill={light} opacity=".13" stroke={light} />
          <g stroke={light} strokeWidth="1.5">
            <path d="m191 105 62-36 62 36-62 35Z" fill={light} fillOpacity=".35" />
            <path d="m191 105 62 35v78l-62-35Z" fill={dark} fillOpacity=".8" />
            <path d="m253 140 62-35v78l-62 35Z" fill={mid} />
            <path d="m216 119 37 21 36-21M253 140v78" fill="none" />
            <path
              d="M250 34v20M250 234v29M156 102l-18-10M343 211l19 11M343 94l19-11M147 210l-19 11"
              opacity=".6"
            />
          </g>
          <ellipse cx="253" cy="248" rx="113" ry="31" fill="none" stroke={light} opacity=".28" />
          <ellipse cx="253" cy="248" rx="141" ry="42" fill="none" stroke={light} opacity=".15" />
          <path
            d="M0 280h500M0 300h500M83 320l107-75M416 320l-99-75"
            stroke={light}
            opacity=".15"
          />
        </>
      )}
      {category === 'Movies' && (
        <>
          <ellipse cx="285" cy="146" rx="102" ry="102" fill={`url(#${id}-sun)`} />
          <circle cx="285" cy="146" r="72" fill={dark} />
          <path d="M250 85a72 72 0 0 1 67 125" fill="none" stroke={light} strokeWidth="4" />
          <ellipse
            cx="285"
            cy="150"
            rx="165"
            ry="31"
            fill="none"
            stroke={light}
            strokeWidth="8"
            opacity=".6"
            transform="rotate(-25 285 150)"
          />
          <ellipse
            cx="285"
            cy="150"
            rx="178"
            ry="38"
            fill="none"
            stroke={light}
            opacity=".6"
            transform="rotate(-25 285 150)"
          />
          <path d="M0 299 95 260 174 287 263 249 359 285 434 257 500 282v38H0" fill={dark} />
          <path d="m84 85 56-15" stroke={light} strokeWidth="2" />
          <circle cx="84" cy="85" r="2" fill="white" />
        </>
      )}
      {category === 'TV Shows' && (
        <>
          <g transform="translate(139 63) rotate(-7 110 84)">
            <rect width="233" height="167" rx="20" fill={dark} stroke={light} strokeWidth="2" />
            <rect x="12" y="12" width="207" height="125" rx="10" fill={mid} />
            <path d="m13 109 62-61 41 48 27-35 77 76H13" fill={light} opacity=".4" />
            <circle cx="169" cy="43" r="19" fill={light} />
            <path d="m113 52 38 24-38 25Z" fill="#fff" opacity=".85" />
            <circle cx="115" cy="152" r="4" fill={light} />
            <path d="M62 167v22m110-22v22M81 0 62-27m77 27 30-30" stroke={light} strokeWidth="4" />
          </g>
          <path d="M63 267h378M92 277h316" stroke={light} opacity=".25" />
        </>
      )}
      {category === 'K-Pop' && (
        <>
          <circle cx="250" cy="144" r="87" fill="none" stroke={light} opacity=".2" />
          <circle cx="250" cy="144" r="102" fill="none" stroke={light} opacity=".12" />
          {Array.from({ length: 27 }, (_, i) => (
            <rect
              key={i}
              x={85 + i * 12}
              y={145 - Math.abs(Math.sin(i * 0.65)) * 56}
              width="4"
              height={Math.abs(Math.sin(i * 0.65)) * 112 + 5}
              rx="2"
              fill={light}
              opacity={i % 3 === 0 ? 0.7 : 0.25}
            />
          ))}
          <path d="m250 74 20 48 52 4-40 34 13 50-45-28-45 28 13-50-40-34 52-4Z" fill={light} />
          <path d="m250 94 12 36 39 1-30 23 10 37-31-23-31 23 10-37-30-23 39-1Z" fill={mid} />
          <path d="M0 270Q110 190 250 263T500 241" fill="none" stroke={light} opacity=".3" />
        </>
      )}
      {category === 'Comics' && (
        <>
          <rect width="500" height="320" fill={`url(#${id}-dots)`} />
          <path
            d="m262 38 22 59 63-21-27 63 79 18-67 35 35 53-75-9-24 51-30-54-70 20 15-64-67-22 61-36-16-65 65 29Z"
            fill={light}
            opacity=".3"
          />
          <path d="m279 48-97 117h62l-25 91 102-136h-68Z" fill={light} />
          <path
            d="M94 91l-35-22m47 72-63-7m337-55 40-35m-20 113 57-7M89 233l-28 22"
            stroke={light}
            strokeWidth="3"
          />
        </>
      )}
      {category === 'Manga' && (
        <>
          <circle cx="295" cy="117" r="66" fill={light} />
          <path d="M0 273 96 190 168 250 290 134 428 259 500 218v102H0" fill={dark} />
          <path d="m242 181 48-47 46 48-35-12-10 13-14-14Z" fill={light} opacity=".8" />
          <g stroke={light} opacity=".3">
            {Array.from({ length: 14 }, (_, i) => (
              <path key={i} d={`M${i * 43 - 40} 320 ${i * 36 + 32} 215`} />
            ))}
          </g>
          <path
            d="M51 0q44 95 24 258M85 103l57-48M76 149l-46-30M76 212l48-24"
            fill="none"
            stroke={dark}
            strokeWidth="9"
          />
          <g fill={dark}>
            <ellipse cx="119" cy="72" rx="30" ry="12" transform="rotate(-32 119 72)" />
            <ellipse cx="38" cy="119" rx="29" ry="13" transform="rotate(20 38 119)" />
          </g>
        </>
      )}
      {category === 'Cosplay' && (
        <>
          <circle cx="250" cy="141" r="96" stroke={light} fill="none" opacity=".2" />
          <path
            d="m168 75 45 34q37-14 74 0l45-34-7 102q-19 65-75 86-56-21-75-86Z"
            fill={light}
            opacity=".9"
          />
          <path d="m181 99 29 32 40-10 39 10 29-32-11 81-57 62-57-62Z" fill={mid} />
          <path d="m190 150 48 18-37 13Zm120 0-48 18 37 13Z" fill={dark} />
          <path d="m242 195 8-14 8 14-8 15Z" fill={light} />
          <path d="m242 223 8-5 8 5" fill="none" stroke={light} strokeWidth="2" />
          <g fill={light}>
            <path d="m100 78 5 16 16 5-16 5-5 16-5-16-16-5 16-5Z" />
            <path d="m386 190 4 12 12 4-12 4-4 12-4-12-12-4 12-4Z" />
          </g>
        </>
      )}
      <path d="M0 310h500" stroke={light} opacity=".15" />
      <rect width="500" height="320" fill={`url(#${id}-floor)`} opacity=".17" />
    </svg>
  );
}
