import './BlueTick.css';

export default function BlueTick({ checked = true }) {
  return (
    <div className="field">
      <input className="field__checkbox" type="checkbox" checked={checked} readOnly />
      <span className="field__label">
        <svg className="check" viewBox="0 0 64 64" aria-hidden="true">
          <g transform="translate(32,32)">
            <g strokeLinecap="round" strokeWidth="3">
              <polyline className="check__stroke-offset check__stroke-offset--1" stroke="var(--purple)" points="-30 -30,-42 -42" strokeDasharray="17 17" strokeDashoffset="17" />
              <polyline className="check__stroke-offset check__stroke-offset--2" stroke="var(--primary)" points="38 -38,54 -54" strokeDasharray="22.63 22.63" strokeDashoffset="22.63" />
              <polyline className="check__stroke-offset check__stroke-offset--3" stroke="var(--green)" points="-28 28,-40 40" strokeDasharray="17 17" strokeDashoffset="17" />
              <polyline className="check__stroke-offset check__stroke-offset--4" stroke="var(--red)" points="32 32,44 44" strokeDasharray="17 17" strokeDashoffset="17" />
            </g>
            <g>
              <circle className="check__move-fade check__move-fade--1" fill="var(--red)" r="3" cx="4" cy="-44" opacity="0" />
              <circle className="check__move-fade check__move-fade--2" fill="var(--primary)" r="3" cx="-44" cy="-8" opacity="0" />
              <circle className="check__move-fade check__move-fade--3" fill="var(--green)" r="3" cx="52" cy="12" opacity="0" />
              <circle className="check__move-fade check__move-fade--4" fill="var(--purple)" r="2" cx="-2" cy="40" opacity="0" />
              <circle className="check__move-fade check__move-fade--5" fill="var(--primary)" r="3" cx="-12" cy="46" opacity="0" />
            </g>
            <g className="check__scale-out" fill="none" stroke="var(--check-outline)" strokeWidth="2">
              <circle r="30" />
              <polygon points="-10 -4,-16 2,-4 14,16 -6,10 -12,-4 2" />
            </g>
            <g className="check__fade" opacity="0">
              <circle className="check__scale-in check__scale-in--1" fill="var(--check-bubble)" r="30.9" />
              <circle className="check__scale-in check__scale-in--2" fill="var(--primary)" r="31" />
              <polygon className="check__scale-in check__scale-in--3" fill="var(--white)" stroke="var(--primary)" strokeWidth="2" points="-10 -4,-16 2,-4 14,16 -6,10 -12,-4 2" />
            </g>
          </g>
        </svg>
        <span className="field__sr-only">Check circle</span>
      </span>
    </div>
  );
}
