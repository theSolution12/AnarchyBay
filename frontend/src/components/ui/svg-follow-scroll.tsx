"use client";

import React, { useState, useEffect } from "react";

const Skiper19 = () => {
  const [key, setKey] = useState(0);
  const [bounce, setBounce] = useState(false);

  const handleRestart = () => {
    setKey(prev => prev + 1);
  };

  return (
    <section
      onClick={handleRestart}
      className="relative w-full min-h-[70vh] flex flex-col items-center justify-center bg-white px-4 py-20 cursor-pointer overflow-hidden"
    >
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --ease-one: linear(
            0, 0.2342, 0.4374, 0.6093 37.49%,
            0.6835, 0.7499, 0.8086, 0.8593, 0.9023,
            0.9375, 0.9648, 0.9844, 0.9961, 1
          );
          --ease-two: linear(
            0, 0.2178 2.1%, 1.1144 8.49%,
            1.2959 10.7%, 1.3463 11.81%,
            1.3705 12.94%, 1.3726, 1.3643 14.48%,
            1.3151 16.2%, 1.0317 21.81%,
            0.941 24.01%, 0.8912 25.91%,
            0.8694 27.84%, 0.8698 29.21%,
            0.8824 30.71%, 1.0122 38.33%, 1.0357,
            1.046 42.71%, 1.0416 45.7%,
            0.9961 53.26%, 0.9839 57.54%,
            0.9853 60.71%, 1.0012 68.14%,
            1.0056 72.24%, 0.9981 86.66%, 1
          );
        }

        @keyframes pop-x {
          to { scale: 1 0.05; }
        }

        @keyframes pop-y {
          to { scale: 1 1; }
        }

        .pop-heading {
          font-size: clamp(3rem, 8vw + 1rem, 10rem);
          position: relative;
          display: flex;
          align-items: flex-end;
        }

        .pop-heading > span:first-child {
          line-height: 0.8;
        }

        .pop-heading > span:nth-of-type(2),
        .pop-heading > span:nth-of-type(3) {
          color: white;
          position: relative;
        }

        .pop-heading > span:nth-of-type(3) {
          position: absolute;
          bottom: 0;
          right: 0;
          transform-origin: 100% 20%;
          scale: 0.35;
          z-index: 3;
        }

        .pop-heading > span:nth-of-type(2) {
          line-height: 1.2;
          transform-origin: 50% 100%;
          display: inline-flex;
          align-items: center;
        }

        .pop-heading > span:nth-of-type(2)::after {
          content: "";
          position: absolute;
          inset: 0.25rem -0.5rem -0.5rem -0.5rem;
          background: #ec4899;
          z-index: -1;
          transform-origin: 50% 100%;
          scale: 0 0.05;
          animation:
            pop-x 0.8s 0.5s forwards var(--ease-one),
            pop-y 1s 1.4s both var(--ease-two); 
        }

        .bounce-enabled .pop-heading > span:nth-of-type(2) span:first-child {
          transform-origin: 50% 110%;
          line-height: 1;
          scale: 1 0;
          animation: pop-y 1s 1.4s both var(--ease-two); 
        }
      `}} />

      <div className={bounce ? 'bounce-enabled' : ''}>
        <h1 key={key} className="pop-heading">
          <span aria-hidden="true">Anarchy&nbsp;</span>
          <span aria-hidden="true">
            <span>Bay</span>
            <span>.</span>
          </span>
          <span aria-hidden="true">™</span>
          <span className="sr-only">Anarchy Bay.</span>
        </h1>
      </div>

      <h2 className="mt-8 text-base md:text-lg opacity-50 font-medium">
        tap to restart.
      </h2>

      <div className="fixed top-4 right-4 flex items-center gap-2 bg-white border-2 border-black px-4 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <label htmlFor="bounce" className="text-sm font-bold cursor-pointer">
          Bounce text?
        </label>
        <input
          type="checkbox"
          id="bounce"
          checked={bounce}
          onChange={(e) => setBounce(e.target.checked)}
          className="w-5 h-5 cursor-pointer accent-pink-500"
        />
      </div>
    </section>
  );
};

export { Skiper19 };
