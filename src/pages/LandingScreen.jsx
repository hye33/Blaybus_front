// import React from "react";
import "../styles/LandingScreen.css";
import logoSimvex from '../assets/logo_simvex.png'

export default function LandingScreen({ onStart }) {
  return (
    <main className="ls">
      <div className="ls__bg" aria-hidden="true" />

      <section className="ls__center">
        <img className="ls__logo" src={logoSimvex} alt="SIMVEX" />

        <h1 className="ls__title">
          공학도들과 연구자분들을 위한 혁신적인 파트너 
          {" "}
          SIMVEX
          {/* <span className="lsbrand">SIMVEX</span> */}
        </h1>

        <p className="ls__subtitle">
          복잡한 이론만으로는 2% 부족했던 공학적 직관, 이제 SIMVEX와 함께 생생한 3D 시뮬레이션으로
          머릿속 세계를 펼쳐볼 수 있어요
        </p>

        <button className="ls__cta" type="button" onClick={onStart}>
          시작하기
        </button>
      </section>
    </main>
  );
}