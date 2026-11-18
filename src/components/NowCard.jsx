import { useEffect, useState } from "react";
import { NOW_STATUS } from "../data";

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function pad(n) {
  return String(n).padStart(2, "0");
}

// 首页「此刻」侧卡：实时钟 + 当前状态列表
export default function NowCard() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateText = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 · ${
    WEEKDAYS[now.getDay()]
  }`;

  return (
    <aside className="now-card reveal" style={{ "--i": 3 }}>
      <p className="now-kicker">此刻 · NOW</p>
      <p className="now-clock" aria-label="当前时间">
        {pad(now.getHours())}:{pad(now.getMinutes())}
        <span className="now-sec">:{pad(now.getSeconds())}</span>
      </p>
      <p className="now-date">{dateText}</p>
      <ul className="now-list">
        {NOW_STATUS.map((item) => (
          <li className="now-item" key={item.label}>
            <span className="now-item-label">{item.label}</span>
            <span className="now-item-value">{item.value}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
