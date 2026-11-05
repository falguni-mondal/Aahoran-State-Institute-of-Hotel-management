import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Rules from "../pages/Rules";
import ComputerLab from "../pages/ComputerLab";
import FoodAndBeverage from "../pages/FoodAndBeverage";
import FoodProduction from "../pages/FoodProduction";
import FrontOffice from "../pages/FrontOffice";
import HouseKeeping from "../pages/HouseKeeping";
import ShortTermCourses from "../pages/ShortTermCourses";
import FullTermCourses from "../pages/FullTermCourses";
import HunarSeRozgar from "../pages/HunarSeRozgar";
import Syllabus from "../pages/Syllabus";
import StudyMaterial from "../pages/StudyMaterial";
import CampusFacilities from "../pages/CampusFacilities";
import AntiRagging from "../pages/AntiRagging";
import Placement from "../pages/Placement";
import Alumni from "../pages/Alumni";
import NoticeBoard from "../pages/NoticeBoard";
import Results from "../pages/Results";
import OurCampus from "../pages/OurCampus";
import InauguralProgramme from "../pages/InauguralProgramme";
import FreshersWelcome from "../pages/FreshersWelcome";
import ProgrammeEvents from "../pages/ProgrammeEvents";
import Contact from "../pages/Contact";
import Farewell from "../pages/Farewell";
import DepartmentOverview from "../pages/DepartmentOverview";
import KridaSports from "../pages/KridaSports";
import StcpSkillDevelopment from "../pages/StcpSkillDevelopment";

const PageRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* ABOUT ROUTE GROUP */}
      <Route path="/about">
        <Route index element={<About />} />
        <Route path="rules" element={<Rules />} />
        {/* <Route path="computer-lab" element={<ComputerLab />} /> */}
      </Route>


      {/* DEPARTMENT ROUTES */}
      <Route path="/food-and-beverage" element={<FoodAndBeverage />} />
      <Route path="/food-production" element={<FoodProduction />} />
      <Route path="/front-office" element={<FrontOffice />} />
      <Route path="/house-keeping" element={<HouseKeeping />} />
      <Route path="/department-overview" element={<DepartmentOverview />} />


      {/* ACADEMIC ROUTES */}
      <Route path="/short-term-courses" element={<ShortTermCourses />} />
      <Route path="/ug-program" element={<FullTermCourses />} />
      <Route path="/hunar-se-rozgar" element={<HunarSeRozgar />} />
      <Route path="/syllabus" element={<Syllabus />} />
      <Route path="/study-material" element={<StudyMaterial />} />


      {/* STUDENT & ALUMNI ROUTES */}
      <Route path="/campus-facilities" element={<CampusFacilities />} />
      <Route path="/anti-ragging" element={<AntiRagging />} />
      <Route path="/placement" element={<Placement />} />
      <Route path="/alumni" element={<Alumni />} />


      {/* NOTICE BOARD */}
      <Route path="/notice-board" element={<NoticeBoard />} />


      {/* RESULTS */}
      <Route path="/results" element={<Results />} />


      {/* GALLERY */}
      <Route path="/our-campus" element={<OurCampus />} />
      <Route path="/inaugural-programme" element={<InauguralProgramme />} />
      <Route path="/freshers-welcome" element={<FreshersWelcome />} />
      <Route path="/farewell" element={<Farewell />} />
      <Route path="/krida" element={<KridaSports />} />
      <Route path="/stcp" element={<StcpSkillDevelopment />} />
      <Route path="/programme-and-events" element={<ProgrammeEvents />} />



      <Route path="/contact" element={<Contact />} />

    </Routes>
  );
};

export default PageRouter;