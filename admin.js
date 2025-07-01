document.addEventListener('DOMContentLoaded', () => {
    const aboutTextarea = document.getElementById('about-textarea');
    const projectsList = document.getElementById('projects-list');
    const skillsList = document.getElementById('skills-list');
    const contactList = document.getElementById('contact-list');
    const addProjectBtn = document.getElementById('add-project-btn');
    const addSkillBtn = document.getElementById('add-skill-btn');
    const addContactBtn = document.getElementById('add-contact-btn');
    const saveChangesBtn = document.getElementById('save-changes-btn');

    let portfolioData = {};

    // Fetch existing data from Vercel KV
    fetch('/api/save')
        .then(response => response.json())
        .then(data => {
            if (data) {
                portfolioData = data;
                loadData();
            } else {
                // Fallback to local JSON if KV is empty
                fetch('database.json')
                    .then(response => response.json())
                    .then(localData => {
                        portfolioData = localData;
                        loadData();
                    });
            }
        });

    function loadData() {
        // About
        aboutTextarea.value = portfolioData.about.paragraph;

        // Projects
        projectsList.innerHTML = '';
        portfolioData.projects.forEach((project, index) => {
            projectsList.appendChild(createItemElement(project, index, 'project'));
        });

        // Skills
        skillsList.innerHTML = '';
        portfolioData.skills.forEach((skill, index) => {
            skillsList.appendChild(createItemElement(skill, index, 'skill'));
        });

        // Contact
        contactList.innerHTML = '';
        portfolioData.contact.forEach((contact, index) => {
            contactList.appendChild(createItemElement(contact, index, 'contact'));
        });
    }

    function createItemElement(item, index, type) {
        const div = document.createElement('div');
        div.className = 'item-container';
        div.dataset.index = index;
        div.dataset.type = type;

        let fields = '';
        if (type === 'project') {
            fields = `
                <input type="text" value="${item.name}" data-field="name" placeholder="Project Name">
                <input type="text" value="${item.description}" data-field="description" placeholder="Description">
                <input type="text" value="${item.link}" data-field="link" placeholder="Link">
                <input type="text" value="${(item.tags || []).join(',')}" data-field="tags" placeholder="Tags (comma-separated)">
            `;
        } else if (type === 'skill') {
            fields = `
                <input type="text" value="${item.name}" data-field="name" placeholder="Skill Name">
                <input type="text" value="${item.description}" data-field="description" placeholder="Description">
                <input type="text" value="${(item.tags || []).join(',')}" data-field="tags" placeholder="Tags (comma-separated)">
            `;
        } else if (type === 'contact') {
            fields = `
                <input type="text" value="${item.name}" data-field="name" placeholder="Name">
                <input type="text" value="${item.url}" data-field="url" placeholder="URL">
                <textarea data-field="icon" placeholder="SVG Icon">${item.icon}</textarea>
            `;
        }

        div.innerHTML = fields + '<button class="remove-btn">Remove</button>';
        return div;
    }

    // Add new items
    addProjectBtn.addEventListener('click', () => {
        portfolioData.projects.push({ name: '', description: '', link: '', tags: [] });
        loadData();
    });

    addSkillBtn.addEventListener('click', () => {
        portfolioData.skills.push({ name: '', description: '', tags: [] });
        loadData();
    });

    addContactBtn.addEventListener('click', () => {
        portfolioData.contact.push({ name: '', url: '', icon: '' });
        loadData();
    });

    // Remove items
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const itemContainer = e.target.closest('.item-container');
            const index = itemContainer.dataset.index;
            const type = itemContainer.dataset.type;
            
            if (type === 'project') portfolioData.projects.splice(index, 1);
            if (type === 'skill') portfolioData.skills.splice(index, 1);
            if (type === 'contact') portfolioData.contact.splice(index, 1);

            loadData();
        }
    });

    // Save changes
    saveChangesBtn.addEventListener('click', () => {
        // Update about
        portfolioData.about.paragraph = aboutTextarea.value;

        // Update projects
        document.querySelectorAll('#projects-list .item-container').forEach(container => {
            const index = container.dataset.index;
            const project = portfolioData.projects[index];
            container.querySelectorAll('input, textarea').forEach(input => {
                if (input.dataset.field === 'tags') {
                    project[input.dataset.field] = input.value.split(',').map(t => t.trim());
                } else {
                    project[input.dataset.field] = input.value;
                }
            });
        });

        // Update skills
        document.querySelectorAll('#skills-list .item-container').forEach(container => {
            const index = container.dataset.index;
            const skill = portfolioData.skills[index];
            container.querySelectorAll('input, textarea').forEach(input => {
                if (input.dataset.field === 'tags') {
                    skill[input.dataset.field] = input.value.split(',').map(t => t.trim());
                } else {
                    skill[input.dataset.field] = input.value;
                }
            });
        });

        // Update contact
        document.querySelectorAll('#contact-list .item-container').forEach(container => {
            const index = container.dataset.index;
            const contact = portfolioData.contact[index];
            container.querySelectorAll('input, textarea').forEach(input => {
                contact[input.dataset.field] = input.value;
            });
        });

        fetch('/api/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(portfolioData),
        })
        .then(response => response.text())
        .then(result => alert(result))
        .catch(error => console.error('Error saving data:', error));
    });
});