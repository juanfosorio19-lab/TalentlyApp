// Mock profiles data with complete company info
const mockProfiles = [
    {
        id: 1,
        name: 'TechCorp',
        title: 'Senior Full Stack Developer',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
        logo: 'https://ui-avatars.com/api/?name=Tech+Corp&background=0D8ABC&color=fff&size=200',
        tags: ['Remoto', 'Full-time', 'Tech'],
        location: 'Santiago, Chile',
        salary: '$3.500.000 - $4.500.000',
        modality: 'Híbrido',
        sector: 'Tecnología',
        size: '51-200 empleados',
        stage: 'Growth Stage',
        description: 'Somos una empresa líder en desarrollo de software con un equipo apasionado por la innovación. Creemos en el trabajo colaborativo y el crecimiento profesional de cada miembro.',
        techStack: ['React', 'Node.js', 'AWS', 'PostgreSQL', 'Docker', 'TypeScript'],
        benefits: ['Seguro médico', 'Stock options', 'Trabajo remoto', 'Horario flexible', 'Capacitación'],
        culture: ['Innovación', 'Trabajo en equipo', 'Autonomía', 'Balance vida-trabajo'],
        workModel: 'Híbrido flexible',
        hiringProcess: '3 etapas, 2-3 semanas'
    },
    {
        id: 2,
        name: 'StartupLab',
        title: 'Product Designer',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
        logo: 'https://ui-avatars.com/api/?name=Startup+Lab&background=random&size=200',
        tags: ['Startup', 'Growth', 'Full-time'],
        location: 'Providencia, Santiago',
        salary: '$2.500.000 - $3.200.000',
        modality: 'Presencial',
        sector: 'SaaS / Software',
        size: '11-50 empleados',
        stage: 'Seed Stage',
        description: 'Startup en rápido crecimiento enfocada en revolucionar la forma en que las empresas gestionan sus procesos. Cultura de ownership y aprendizaje constante.',
        techStack: ['Figma', 'React', 'Framer', 'Notion', 'Slack'],
        benefits: ['Equity', 'Almuerzo incluido', 'Gym', 'MacBook Pro', 'Días de salud mental'],
        culture: ['Fast-paced', 'Ownership', 'Data-driven', 'Aprendizaje continuo'],
        workModel: 'Presencial con flexibilidad',
        hiringProcess: '2 etapas, 1-2 semanas'
    },
    {
        id: 3,
        name: 'FinanzasPro',
        title: 'UX/UI Designer',
        image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop',
        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop',
        tags: ['FinTech', 'Senior', 'Híbrido'],
        location: 'El Golf, Santiago',
        salary: '$3.000.000 - $4.000.000',
        modality: 'Híbrido',
        sector: 'FinTech',
        size: '201-500 empleados',
        stage: 'Growth Stage',
        description: 'Lideramos la transformación digital del sector financiero. Buscamos diseñadores que quieran impactar la vida de millones de usuarios.',
        techStack: ['Figma', 'Sketch', 'Adobe XD', 'Principle', 'React'],
        benefits: ['Bono anual', 'Seguro complementario', 'Teletrabajo', 'Capacitación internacional'],
        culture: ['Customer-centric', 'Innovación', 'Excelencia', 'Colaboración'],
        workModel: '3 días oficina, 2 remoto',
        hiringProcess: '4 etapas, 3-4 semanas'
    },
    {
        id: 4,
        name: 'GreenTech',
        title: 'Frontend Developer',
        image: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=600&fit=crop',
        logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop',
        tags: ['Sustentable', 'Remote-first', 'Impact'],
        location: '100% Remoto',
        salary: '$2.800.000 - $3.800.000',
        modality: '100% Remoto',
        sector: 'CleanTech',
        size: '11-50 empleados',
        stage: 'Early Stage',
        description: 'Desarrollamos tecnología para combatir el cambio climático. Si te apasiona el impacto social y ambiental, este es tu lugar.',
        techStack: ['Vue.js', 'Nuxt', 'TailwindCSS', 'GraphQL', 'Python'],
        benefits: ['Remote-first', 'Unlimited PTO', 'Equipo para home office', 'Retiros de equipo'],
        culture: ['Impacto social', 'Sustentabilidad', 'Diversidad', 'Transparencia'],
        workModel: '100% Remoto global',
        hiringProcess: '3 etapas asíncronas'
    },
    {
        id: 5,
        name: 'DataMind',
        title: 'Data Analyst',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop',
        logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop',
        tags: ['Data', 'AI', 'Scale-up'],
        location: 'Las Condes, Santiago',
        salary: '$3.200.000 - $4.200.000',
        modality: 'Híbrido',
        sector: 'Data & Analytics',
        size: '51-200 empleados',
        stage: 'Scale-up',
        description: 'Somos líderes en inteligencia artificial aplicada a negocios. Trabaja con datos que impactan decisiones de empresas Fortune 500.',
        techStack: ['Python', 'SQL', 'Tableau', 'BigQuery', 'TensorFlow', 'Airflow'],
        benefits: ['Bonos trimestrales', 'Certificaciones pagadas', 'Conferencias', 'Flex time'],
        culture: ['Data-driven', 'Excelencia técnica', 'Mentoría', 'Innovación'],
        workModel: 'Híbrido 2-3 días oficina',
        hiringProcess: '4 etapas + case study'
    }
];

const citiesByCountry = {
    chile: ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta'],
    argentina: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'],
    colombia: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'],
    mexico: ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Cancún'],
    peru: ['Lima', 'Arequipa', 'Trujillo', 'Cusco', 'Chiclayo'],
    españa: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao']
};

const skillsByArea = {
    desarrollo: ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'AWS', 'Docker', 'SQL', 'Git', 'TypeScript', 'C#', 'Go', 'PHP', 'Ruby', 'Rust', 'Kubernetes', 'GraphQL', 'MongoDB', 'Redis', 'CI/CD'],
    'diseno-ux': ['Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'User Research', 'Wireframing', 'UI Design', 'Design Systems', 'HTML/CSS', 'InVision', 'Zeplin', 'Usability Testing', 'Information Architecture', 'Interaction Design', 'Miro'],
    producto: ['Roadmapping', 'Agile', 'Scrum', 'User Stories', 'Jira', 'Data Analysis', 'A/B Testing', 'Stakeholder Management', 'SQL', 'Product Strategy', 'KPIs', 'Market Research', 'Prioritization', 'Product Discovery', 'MVP'],
    marketing: ['SEO', 'SEM', 'Social Media', 'Content Marketing', 'Google Analytics', 'Email Marketing', 'Copywriting', 'Branding', 'CRM', 'Google Ads', 'Facebook Ads', 'Marketing Automation', 'Growth Hacking', 'PR', 'HubSpot'],
    data: ['Python', 'R', 'SQL', 'Tableau', 'Power BI', 'Machine Learning', 'Big Data', 'Statistics', 'Excel', 'Data Mining', 'TensorFlow', 'Spark', 'Pandas', 'Data Visualization', 'ETL'],
    ventas: ['CRM', 'Salesforce', 'Negotiation', 'Lead Generation', 'B2B Sales', 'Key Account Management', 'Cold Calling', 'Presentation', 'Closing', 'Pipeline Management', 'Customer Relationship', 'Sales Strategy', 'Business Development', 'Prospecting'],
    rrhh: ['Recruiting', 'Talent Acquisition', 'Onboarding', 'Employee Relations', 'Performance Management', 'Labor Law', 'HRIS', 'Compensation & Benefits', 'Training & Development', 'Organizational Culture', 'Diversity & Inclusion', 'Employee Engagement', 'Workday'],
    finanzas: ['Excel', 'Financial Analysis', 'Accounting', 'Budgeting', 'Forecasting', 'SAP', 'Audit', 'Taxation', 'Corporate Finance', 'Valuation', 'Risk Management', 'Financial Reporting', 'Payroll', 'QuickBooks', 'Investment'],
    other: ['Communication', 'Management', 'English', 'Office', 'Leadership', 'Project Management', 'Problem Solving', 'Time Management', 'Teamwork', 'Critical Thinking', 'Adaptability', 'Creativity', 'Networking', 'Public Speaking']
};

const interestsByArea = {
    desarrollo: ['Open Source', 'Hackathons', 'Cloud Computing', 'Cybersecurity', 'Blockchain', 'IoT', 'Game Dev', 'AI/ML'],
    'diseno-ux': ['Typography', 'Illustration', 'Animation', 'Accessibility', 'Micro-interactions', 'Vercel', 'Dribbble', 'Behance'],
    producto: ['Startups', 'Tech Trends', 'Innovation', 'User Psychology', 'Behavioral Economics', 'SaaS', 'Fintech', 'Growth'],
    marketing: ['Digital Trends', 'Neuromarketing', 'Influencer Marketing', 'E-commerce', 'Video Marketing', 'Podcasting', 'Storytelling'],
    data: ['Data Engineering', 'Deep Learning', 'NLP', 'Computer Vision', 'Algorithmic Trading', ' Kaggle', 'Data Ethics'],
    ventas: ['Networking', 'Public Speaking', 'Psychology', 'Entrepreneurship', 'Real Estate', 'Stocks', 'Negotiation Workshops'],
    rrhh: ['Psychology', 'Coaching', 'Mentoring', 'Workforce Tech', 'Labor Trends', 'Remote Work', 'Wellness'],
    finanzas: ['Stock Market', 'Crypto', 'Real Estate', 'Economics', 'Investing', 'Banking', ' Fintech'],
    operaciones: ['Logística', 'Supply Chain', 'Mejora Continua', 'Lean Six Sigma', 'Gestión de Proyectos', 'Operaciones', 'Distribución', 'Inventarios', 'KPIs', 'Calidad', 'Seguridad Industrial', 'Planificación', 'Compras'],
    other: ['Startups', 'Technology', 'Innovation', 'Personal Growth', 'Reading', 'Volunteering', 'Education']
};

const interestsData = {
    'Deportes y Bienestar': ['Fútbol', 'Running', 'Yoga', 'Trekking', 'Ciclismo', 'Natación', 'Crossfit', 'Tenis', 'Meditación'],
    'Arte y Creatividad': ['Música', 'Fotografía', 'Cine', 'Diseño', 'Pintura', 'Escritura', 'Lectura', 'Cocina', 'Viajes'],
    'Tecnología y Ciencia': ['Gadgets', 'Gaming', 'Inteligencia Artificial', 'Astronomía', 'Robótica', 'Hackathons', 'Criptomonedas'],
    'Desarrollo Personal': ['Idiomas', 'Voluntariado', 'Mentoring', 'Networking', 'Emprendimiento', 'Inversiones']
};

const mockCandidates = [
    {
        id: 1,
        name: 'Ana García',
        role: 'Senior React Developer',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
        skills: ['React', 'TypeScript', 'Redux', 'Node.js'],
        experience: '5 años',
        location: 'Santiago, Chile',
        salary: '$2.5M - $3.5M',
        match: 95
    },
    {
        id: 2,
        name: 'Carlos Rodríguez',
        role: 'Full Stack Python Developer',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        skills: ['Python', 'Django', 'React', 'AWS', 'Docker'],
        experience: '4 años',
        location: 'Remoto',
        salary: '$3.0M - $4.0M',
        match: 88
    },
    {
        id: 3,
        name: 'Valentina Martínez',
        role: 'UX/UI Designer',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
        skills: ['Figma', 'Prototyping', 'User Research', 'HTML/CSS'],
        experience: '3 años',
        location: 'Buenos Aires, Argentina',
        salary: '$2.0M - $3.0M',
        match: 92
    },
    {
        id: 4,
        name: 'Felipe Soto',
        role: 'Backend Developer (Go)',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
        skills: ['Go', 'Microservices', 'Kubernetes', 'gRPC'],
        experience: '6 años',
        location: 'Lima, Perú',
        salary: '$3.5M - $4.5M',
        match: 85
    },
    {
        id: 5,
        name: 'Laura Pavez',
        role: 'Data Scientist',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
        skills: ['Python', 'Machine Learning', 'SQL', 'Pandas'],
        experience: '4 años',
        location: 'Bogotá, Colombia',
        salary: '$3.2M - $4.2M',
        match: 90
    }
];
