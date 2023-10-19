import { useState } from "react";
import "./StarRating.css";

export default function StarRating({
  max = 5,
  message = ["a", "b", "c", "d", "e"],
  size = 48,
  color = "yellow",
  defaultRating = 3,
  syncRating,
}) {
  const [rating, setRating] = useState(defaultRating);
  const [tempRating, setTempRating] = useState(0);
  const handleClick = (rate) => {
    setRating(rate);
    syncRating(rate);
  };
  const handleIn = (rate) => {
    setTempRating(rate);
  };
  const handleOut = (rate) => {
    setTempRating(rate);
  };

  return (
    <>
      <div className="containerStyle">
        <div className="starContainerStyle">
          {Array.from({ length: max }, (_, i) => (
            <Star
              color={color}
              size={size}
              onRate={() => handleClick(i + 1)}
              isFull={tempRating ? tempRating >= i + 1 : rating >= i + 1}
              mouseIn={() => handleIn(i + 1)}
              mouseOut={() => handleOut(0)}
            />
          ))}
        </div>
        <p style={{ color: color, fontSize: size }} className="textStyle">
          {message.length === max
            ? message[tempRating ? tempRating - 1 : rating - 1]
            : tempRating || rating || ""}
        </p>
      </div>
    </>
  );
}

function Star({ onRate, isFull, mouseIn, mouseOut, size, color }) {
  return (
    <span
      style={{ width: `${size}px`, height: ` ${size}px` }}
      className="star"
      onClick={onRate}
      onMouseEnter={mouseIn}
      onMouseLeave={mouseOut}
    >
      {isFull ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill={color}
          stroke={color}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke={color}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="{2}"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      )}
    </span>
  );
}
