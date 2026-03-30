import React, { useState, useEffect } from 'react';

const TrainingBanner = () => {
  const [trainers, setTrainers] = useState(0);
  const [courses, setCourses] = useState(0);
  const [branches, setBranches] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const trainerStep = 1000 / steps;
    const courseStep = 30 / steps;
    const branchStep = 25 / steps;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setTrainers(Math.min(Math.floor(trainerStep * currentStep), 1000));
      setCourses(Math.min(Math.floor(courseStep * currentStep), 30));
      setBranches(Math.min(Math.floor(branchStep * currentStep), 25));

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600")',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 py-16 max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
          INDIA'S NO.1
        </h1>
        <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
          TRAINING INSTITUTE
        </h2>

        <p className="text-3xl md:text-4xl font-bold text-yellow-400 mb-12">
          100% Placement Assistance
        </p>

        {/* Stats Boxes */}
        <div className="flex flex-wrap justify-center gap-6 mb-16">
          <div className="bg-orange-500 hover:bg-orange-600 transition-colors duration-300 rounded-lg px-4 py-3 min-w-[200px]">
            <p className="text-2xl font-bold text-white mb-2">{trainers}+</p>
            <p className="text-lg font-semibold text-white">Student Trained</p>
          </div>

          <div className="bg-teal-500 hover:bg-teal-600 transition-colors duration-300 rounded-lg px-4 py-3 min-w-[200px]">
            <p className="text-2xl font-bold text-white mb-2">{courses}+</p>
            <p className="text-lg font-semibold text-white">Course Offered</p>
          </div>

          <div className="bg-blue-600 hover:bg-blue-700 transition-colors duration-300 rounded-lg px-4 py-3 min-w-[200px]">
            <p className="text-2xl font-bold text-white mb-2">{branches}+</p>
            <p className="text-lg font-semibold text-white">Expert Instructor</p>
          </div>
        </div>

        {/* Course List */}
        <div className="text-white text-sm md:text-base leading-relaxed">
          <p className="flex flex-wrap justify-center items-center gap-2">
            <span>Programming</span>
            <span>|</span>
            <span>Accounting</span>
            <span>|</span>
            <span>Graphic Designing</span>
            <span>|</span>
            <span>Digital Marketing</span>
            <span>|</span>
            <span>CAD</span>
            <span>|</span>
            <span>Robotics</span>
            <span>|</span>
            <span>Artificial Intelligence</span>
            <span>|</span>
            <span>Ethical Hacking</span>
            <span>|</span>
          </p>
          <p className="mt-2 flex flex-wrap justify-center items-center gap-2">
            <span>Hardware & Networking</span>
            <span>|</span>
            <span>Soft Skills</span>
            <span>|</span>
            <span>Distance Education</span>
            <span>|</span>
            <span>Pearson Certifications</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrainingBanner;
