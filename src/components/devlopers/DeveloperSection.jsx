import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import darshan from "../../assets/darshan.jpg";
import jay from "../../assets/jay.jpg";
const developers = [
  {
    name: "Darshan Sheta",
    github: "https://github.com/Darshan-Sheta",
    linkedin: "https://www.linkedin.com/in/darshan-sheta-942941288/",
    image: darshan,
  },
  {
    name: "Jay Thummar",
    github: "https://github.com/Jay-thummar",
    linkedin: "https://www.linkedin.com/in/jay-thummar-3b9b84321/",
    image: jay,
  },
];


const DeveloperSection = () => {
  return (
    <div className="text-white text-center py-16 px-4">
      <h2 className="text-4xl font-bold mb-10">👩‍💻 Meet Our Developers 👨‍💻</h2>
      <div className="flex justify-center gap-8 flex-wrap">
        {developers.map((dev, index) => (
          <div
            key={index}
            className="bg-gray-800 p-6 rounded-xl shadow-lg w-72 hover:scale-105 transition-transform duration-300"
          >
            <img
              src={dev.image}
              alt={dev.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-indigo-500 ring-offset-2"
            />
            <h3 className="text-xl font-semibold mb-2">{dev.name}</h3>
            <div className="flex justify-center gap-6 text-xl">
              <a href={dev.github} target="_blank" rel="noopener noreferrer">
                <FaGithub className="hover:text-gray-400" />
              </a>
              <a href={dev.linkedin} target="_blank" rel="noopener noreferrer">
                <FaLinkedin className="hover:text-blue-400" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeveloperSection;
