'use client';

import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/careers.css';

gsap.registerPlugin(ScrollTrigger);

export function CareersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const updateProgressBar = (progress) => {
      const progressBar = document.getElementById("progress-bar");
      if (progressBar) {
        progressBar.style.width = progress + "%";
      }
    };

    const simulateProgress = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 1;
        updateProgressBar(progress);
        if (progress === 100) {
          clearInterval(interval);
          setTimeout(() => {
            const loader = document.querySelector(".loader");
            if (loader) {
              loader.classList.add("open");
            }
            document.documentElement.classList.remove("scroll-hide");
          }, 1000);
        }
      }, 0);
    };

    document.documentElement.classList.add("scroll-hide");
    simulateProgress();

    const scrollImages = document.querySelectorAll(".image");
    const totalScrollRange = 2000;
    const scrollRangePerImage = totalScrollRange / (scrollImages.length - 1);

    const showImage = (index) => {
      scrollImages.forEach((image, i) => {
        if (i === index) {
          gsap.set(image, { opacity: 1 });
        } else {
          gsap.set(image, { opacity: 0 });
        }
      });
    };

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".images-wrapper",
        start: "center center",
        end: `+=${totalScrollRange}`,
        scrub: 0.9,
        markers: false,
        pin: true,
        pinSpacing: true
      }
    });

    scrollImages.forEach((image, index) => {
      timeline.to({}, scrollRangePerImage, {
        onUpdate: () => showImage(index)
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      document.documentElement.classList.remove("scroll-hide");
    };
  }, []);

  const viImages = Array.from({ length: 150 }, (_, i) => i + 1);
  const jinxImages = Array.from({ length: 102 }, (_, i) => i + 1);

  return (
    <div className="careers-page dark-theme">
      <div className="loader">
        <div className="loader-content">
          <h3>ANARCHY BAY</h3>
          <span className="progress-line" id="progress-bar"></span>
        </div>
      </div>
      <main>
        <header>
          <div className="header-inner">
            <div className="left-logo">
              <h2>ANARCHY BAY</h2>
            </div>
            <div className="right-button">
              <button 
                className="liquid-glass-btn"
                onClick={() => setIsModalOpen(true)}
              >
                Careers
              </button>
            </div>
          </div>
        </header>
        <div className="title-main">
          <div className="title-wrapper">
            <h1 className="t-stroke italic">arcane</h1>
            <h1>arcane</h1>
            <h1 className="t-stroke italic">arcane</h1>
            <h1>arcane</h1>
          </div>
          <div className="title-wrapper">
            <h1 className="t-stroke italic">arcane</h1>
            <h1>arcane</h1>
            <h1 className="t-stroke italic">arcane</h1>
            <h1>arcane</h1>
          </div>
        </div>
        <div className="images-wrapper">
          {viImages.map((num) => (
            <img
              key={`vi-${num}`}
              src={`https://www.yudiz.com/codepen/arcane/vi/${num}.png`}
              alt=""
              className="img-fluid image"
            />
          ))}
          {jinxImages.map((num) => (
            <img
              key={`jinx-${num}`}
              src={`https://www.yudiz.com/codepen/arcane/jinx/${num}.png`}
              alt=""
              className="img-fluid image"
            />
          ))}
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            <h2>Join Our Team</h2>
            <div className="job-listings">
              <div className="job-card">
                <h3>Backend Developers</h3>
                <p className="job-description">
                  We are looking for talented Backend Developers to join our team.
                </p>
                <p className="diversity-note">
                  We encourage applications from female as well as male candidates. 
                  Anarchy Bay is committed to building a diverse and inclusive workplace.
                </p>
                <div className="requirements">
                  <h4>Requirements:</h4>
                  <ul>
                    <li>Experience with Node.js, Express, or similar frameworks</li>
                    <li>Strong understanding of RESTful APIs</li>
                    <li>Database experience (SQL/NoSQL)</li>
                    <li>Passion for clean, maintainable code</li>
                  </ul>
                </div>
              </div>

              <div className="job-card">
                <h3>Frontend Developers</h3>
                <p className="job-description">
                  Looking for creative Frontend Developers to craft beautiful user experiences.
                </p>
                <p className="diversity-note">
                  We welcome all genders and backgrounds. Diversity fuels innovation at Anarchy Bay.
                </p>
                <div className="requirements">
                  <h4>Requirements:</h4>
                  <ul>
                    <li>Proficiency in React, Vue, or similar frameworks</li>
                    <li>Strong CSS and responsive design skills</li>
                    <li>Eye for detail and design aesthetics</li>
                    <li>Experience with modern build tools</li>
                  </ul>
                </div>
              </div>

              <div className="job-card">
                <h3>Full Stack Engineers</h3>
                <p className="job-description">
                  Seeking versatile Full Stack Engineers to build end-to-end solutions.
                </p>
                <p className="diversity-note">
                  Equal opportunity for all. We believe the best teams are diverse teams.
                </p>
                <div className="requirements">
                  <h4>Requirements:</h4>
                  <ul>
                    <li>Experience with both frontend and backend technologies</li>
                    <li>DevOps and deployment knowledge</li>
                    <li>Problem-solving mindset</li>
                    <li>Team collaboration skills</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CareersPage;