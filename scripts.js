// Fetch and display dynamic content
document.addEventListener("DOMContentLoaded", function() {
  fetch('/api/save') // Fetch from Vercel KV
    .then(response => {
        if (!response.ok) { // If KV fetch fails, try local file
            return fetch('database.json').then(res => res.json());
        }
        return response.json();
    })
    .then(response => response.json())
    .then(data => {
      // Populate About Me
      const aboutParagraph = document.getElementById('about-paragraph');
      aboutParagraph.textContent = data.about.paragraph;

      // --- Projects Section Logic ---
      const projects = data.projects;
      const projectGrid = document.getElementById('project-grid');
      const projectFilterContainer = document.getElementById('project-filter-container');
      const projectPaginationContainer = document.getElementById('project-pagination-container');
      const projectsPerPage = 4;
      let currentProjectPage = 1;
      let currentProjectFilter = 'all';

      function displayProjects() {
        projectGrid.innerHTML = '';
        const filteredProjects = projects.filter(project => 
          currentProjectFilter === 'all' || (project.tags && project.tags.includes(currentProjectFilter))
        );

        if (filteredProjects.length > projectsPerPage) {
          projectPaginationContainer.style.display = 'block';
        } else {
          projectPaginationContainer.style.display = 'none';
        }

        const paginatedProjects = filteredProjects.slice((currentProjectPage - 1) * projectsPerPage, currentProjectPage * projectsPerPage);

        paginatedProjects.forEach(project => {
          const projectCard = document.createElement('div');
          projectCard.className = 'project';
          projectCard.innerHTML = `
            <h3>${project.name}</h3>
            <p>${project.description}</p>
            <a href="${project.link}" target="_blank">View Project</a>
          `;
          projectGrid.appendChild(projectCard);
        });

        setupProjectPagination(filteredProjects.length);
      }

      function setupProjectFilters() {
        const tags = [...new Set(projects.flatMap(p => p.tags || []))];
        if (tags.length > 1) { // Only show filters if there's more than one tag
            projectFilterContainer.style.display = 'block';
            tags.forEach(tag => {
                const btn = document.createElement('button');
                btn.className = 'filter-btn';
                btn.dataset.filter = tag;
                btn.textContent = tag;
                projectFilterContainer.appendChild(btn);
            });
        }

        projectFilterContainer.addEventListener('click', e => {
          if (e.target.classList.contains('filter-btn')) {
            projectFilterContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            currentProjectFilter = e.target.dataset.filter;
            currentProjectPage = 1;
            displayProjects();
          }
        });
      }

      function setupProjectPagination(totalItems) {
        projectPaginationContainer.innerHTML = '';
        const pageCount = Math.ceil(totalItems / projectsPerPage);
        for (let i = 1; i <= pageCount; i++) {
          const btn = document.createElement('button');
          btn.className = 'pagination-btn';
          if (i === currentProjectPage) btn.classList.add('active');
          btn.dataset.page = i;
          btn.textContent = i;
          projectPaginationContainer.appendChild(btn);
        }

        projectPaginationContainer.addEventListener('click', e => {
          if (e.target.classList.contains('pagination-btn')) {
            currentProjectPage = parseInt(e.target.dataset.page);
            displayProjects();
          }
        });
      }

      // --- Skills Section Logic ---
      const skills = data.skills;
      const skillsGrid = document.getElementById('skills-grid');
      const skillFilterContainer = document.getElementById('skill-filter-container');
      const skillPaginationContainer = document.getElementById('skill-pagination-container');
      const skillsPerPage = 6;
      let currentSkillPage = 1;
      let currentSkillFilter = 'all';

      function displaySkills() {
        skillsGrid.innerHTML = '';
        const filteredSkills = skills.filter(skill => 
          currentSkillFilter === 'all' || (skill.tags && skill.tags.includes(currentSkillFilter))
        );

        if (filteredSkills.length > skillsPerPage) {
          skillPaginationContainer.style.display = 'block';
        } else {
          skillPaginationContainer.style.display = 'none';
        }

        const paginatedSkills = filteredSkills.slice((currentSkillPage - 1) * skillsPerPage, currentSkillPage * skillsPerPage);

        paginatedSkills.forEach(skill => {
          const skillCard = document.createElement('div');
          skillCard.className = 'skill-card';
          skillCard.innerHTML = `
            <h3>${skill.name}</h3>
            <p>${skill.description}</p>
          `;
          skillsGrid.appendChild(skillCard);
        });

        setupSkillPagination(filteredSkills.length);
      }

      function setupSkillFilters() {
        const tags = [...new Set(skills.flatMap(s => s.tags || []))];
         if (tags.length > 1) { // Only show filters if there's more than one tag
            skillFilterContainer.style.display = 'block';
            tags.forEach(tag => {
                const btn = document.createElement('button');
                btn.className = 'filter-btn';
                btn.dataset.filter = tag;
                btn.textContent = tag;
                skillFilterContainer.appendChild(btn);
            });
        }

        skillFilterContainer.addEventListener('click', e => {
          if (e.target.classList.contains('filter-btn')) {
            skillFilterContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            currentSkillFilter = e.target.dataset.filter;
            currentSkillPage = 1;
            displaySkills();
          }
        });
      }

      function setupSkillPagination(totalItems) {
        skillPaginationContainer.innerHTML = '';
        const pageCount = Math.ceil(totalItems / skillsPerPage);
        for (let i = 1; i <= pageCount; i++) {
          const btn = document.createElement('button');
          btn.className = 'pagination-btn';
          if (i === currentSkillPage) btn.classList.add('active');
          btn.dataset.page = i;
          btn.textContent = i;
          skillPaginationContainer.appendChild(btn);
        }

        skillPaginationContainer.addEventListener('click', e => {
          if (e.target.classList.contains('pagination-btn')) {
            currentSkillPage = parseInt(e.target.dataset.page);
            displaySkills();
          }
        });
      }

      // Initial Display
      if (projects.length > 0) {
        setupProjectFilters();
        displayProjects();
      }
      if (skills.length > 0) {
        setupSkillFilters();
        displaySkills();
      }

      // Populate Contact Info
      const socialLinksContainer = document.getElementById('social-links-container');
      data.contact.forEach(item => {
        const link = document.createElement('a');
        link.href = item.url;
        link.target = '_blank';
        link.innerHTML = item.icon;
        link.setAttribute('aria-label', item.name);
        socialLinksContainer.appendChild(link);
      });
    });
});

// Wait for the page to fully load, then hide the loading screen
window.onload = function () {
  const loadingScreen = document.getElementById("loading");
  const content = document.getElementById("content");
  const progressBar = document.querySelector(".progress-bar");

  // Simulate progress bar filling
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    progressBar.style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loadingScreen.style.display = "none";
        content.style.display = "block";
      }, 500);
    }
  }, 200);
};

// Smooth scrolling for navigation links
document.querySelectorAll(".nav-link").forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    
    // Remove active class from all links
    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.remove("active");
    });
    
    // Add active class to clicked link
    this.classList.add("active");
    
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 100) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  // Update active navigation link based on scroll position
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.scrollY >= (sectionTop - 200)) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// Smooth scrolling for CTA buttons
document.querySelectorAll('.cta-button').forEach(button => {
  button.addEventListener('click', function(e) {
    if (this.getAttribute('href').startsWith('#')) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// Add current date dynamically to the footer
const currentDateElement = document.createElement("p");
const currentDate = new Date().toDateString();
currentDateElement.textContent = `Current Date: ${currentDate}`;
document.querySelector("footer").appendChild(currentDateElement);

// Theme toggle functionality
const themeToggleButton = document.getElementById("theme-toggle");
const lightIcon = document.getElementById("light-icon");
const darkIcon = document.getElementById("dark-icon");
const prefersDarkScheme = window.matchMedia(
  "(prefers-color-scheme: dark)"
);

function setTheme(theme) {
  document.body.classList.toggle("dark-mode", theme === "dark");
  lightIcon.style.display = theme === "dark" ? "none" : "block";
  darkIcon.style.display = theme === "dark" ? "block" : "none";
}

// Set theme based on user preference
if (prefersDarkScheme.matches) {
  setTheme("dark");
} else {
  setTheme("light");
}

// Toggle theme on button click
themeToggleButton.addEventListener("click", () => {
  const currentTheme = document.body.classList.contains("dark-mode")
    ? "dark"
    : "light";
  setTheme(currentTheme === "light" ? "dark" : "light");
});