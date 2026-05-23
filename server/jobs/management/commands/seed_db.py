from django.core.management.base import BaseCommand
from django.db import transaction
from accounts.models import User
from companies.models import Company
from jobs.models import Skill, Category, Job


SKILLS = [
    'Python', 'JavaScript', 'TypeScript', 'React', 'Django',
    'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Machine Learning',
    'Java', 'Go', 'Kubernetes', 'GraphQL', 'Redis',
]

CATEGORIES = [
    ('Engineering', 'Software engineering and development roles'),
    ('Data & AI', 'Data science, ML and AI roles'),
    ('Design', 'UI/UX and product design roles'),
    ('DevOps', 'Infrastructure and DevOps roles'),
    ('Product', 'Product management roles'),
]

JOBS = [
    {
        'title': 'Senior Backend Engineer',
        'description': 'Build scalable backend services powering millions of users. You will design APIs, optimize databases, and mentor junior engineers.',
        'requirements': '5+ years Python/Django experience\nStrong SQL and database design skills\nExperience with REST APIs and microservices',
        'responsibilities': 'Design and build RESTful APIs\nOptimize database queries\nCode review and mentoring',
        'benefits': 'Remote-first\nHealth insurance\nStock options\n$2000 annual learning budget',
        'job_type': 'full_time', 'work_mode': 'remote', 'experience_level': 'senior',
        'location': 'Remote', 'salary_min': 120000, 'salary_max': 160000,
        'category': 'Engineering', 'skills': ['Python', 'Django', 'PostgreSQL', 'Docker'],
    },
    {
        'title': 'Frontend React Developer',
        'description': 'Join our product team to build beautiful, performant user interfaces used by thousands of customers daily.',
        'requirements': '3+ years React experience\nTypeScript proficiency\nExperience with state management (Redux/Zustand)',
        'responsibilities': 'Build reusable UI components\nCollaborate with designers\nPerformance optimization',
        'benefits': 'Hybrid work\nCompetitive salary\nFree lunch\nGym membership',
        'job_type': 'full_time', 'work_mode': 'hybrid', 'experience_level': 'mid',
        'location': 'Bangalore, India', 'salary_min': 1800000, 'salary_max': 2800000, 'salary_currency': 'INR',
        'category': 'Engineering', 'skills': ['React', 'TypeScript', 'JavaScript'],
    },
    {
        'title': 'Machine Learning Engineer',
        'description': 'Work on cutting-edge ML models that power our recommendation engine and fraud detection systems.',
        'requirements': 'MS/PhD in CS or related field\nExperience with PyTorch or TensorFlow\nStrong Python skills',
        'responsibilities': 'Train and deploy ML models\nA/B test model performance\nCollaborate with data engineers',
        'benefits': 'Top-tier compensation\nGPU compute credits\nConference budget',
        'job_type': 'full_time', 'work_mode': 'onsite', 'experience_level': 'senior',
        'location': 'San Francisco, USA', 'salary_min': 150000, 'salary_max': 220000,
        'category': 'Data & AI', 'skills': ['Python', 'Machine Learning', 'AWS'],
    },
    {
        'title': 'DevOps Engineer',
        'description': 'Own our cloud infrastructure on AWS, build CI/CD pipelines, and ensure 99.9% uptime for our platform.',
        'requirements': '3+ years DevOps/SRE experience\nAWS certifications preferred\nExperience with Terraform and Kubernetes',
        'responsibilities': 'Manage AWS infrastructure\nBuild and maintain CI/CD pipelines\nIncident response and on-call',
        'benefits': 'Remote work\nHealth & dental\nEquity package',
        'job_type': 'full_time', 'work_mode': 'remote', 'experience_level': 'mid',
        'location': 'Remote', 'salary_min': 100000, 'salary_max': 140000,
        'category': 'DevOps', 'skills': ['Docker', 'Kubernetes', 'AWS'],
    },
    {
        'title': 'Full Stack Developer',
        'description': 'Build features end-to-end across our React frontend and Node.js/Django backend in a fast-moving startup.',
        'requirements': '2+ years full stack experience\nComfort with both frontend and backend\nGit and agile workflow',
        'responsibilities': 'Develop frontend and backend features\nWrite unit and integration tests\nParticipate in sprint planning',
        'benefits': 'Flexible hours\nWork from anywhere\nProfessional development budget',
        'job_type': 'full_time', 'work_mode': 'remote', 'experience_level': 'mid',
        'location': 'Remote', 'salary_min': 90000, 'salary_max': 120000,
        'category': 'Engineering', 'skills': ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    },
    {
        'title': 'Data Engineer',
        'description': 'Design and maintain data pipelines that process billions of events per day. Own our data warehouse and ETL infrastructure.',
        'requirements': 'Strong SQL and Python\nExperience with Spark, Airflow or similar\nData warehouse experience (Redshift/BigQuery)',
        'responsibilities': 'Build and maintain ETL pipelines\nOptimize data warehouse queries\nCollaborate with analytics and ML teams',
        'benefits': 'Hybrid work\nHealth insurance\nAnnual bonus',
        'job_type': 'full_time', 'work_mode': 'hybrid', 'experience_level': 'mid',
        'location': 'Hyderabad, India', 'salary_min': 2000000, 'salary_max': 3200000, 'salary_currency': 'INR',
        'category': 'Data & AI', 'skills': ['Python', 'PostgreSQL', 'AWS'],
    },
    {
        'title': 'UI/UX Designer',
        'description': 'Design intuitive experiences for our B2B SaaS product. Work closely with product and engineering to ship pixel-perfect designs.',
        'requirements': '3+ years UX design experience\nProficiency in Figma\nPortfolio demonstrating end-to-end design process',
        'responsibilities': 'Create wireframes and prototypes\nConduct user research\nMaintain design system',
        'benefits': 'Creative environment\nLatest design tools\nFlexible hours',
        'job_type': 'full_time', 'work_mode': 'hybrid', 'experience_level': 'mid',
        'location': 'Mumbai, India', 'salary_min': 1500000, 'salary_max': 2200000, 'salary_currency': 'INR',
        'category': 'Design', 'skills': ['JavaScript', 'TypeScript'],
    },
    {
        'title': 'Backend Engineer (Go)',
        'description': 'Build high-performance microservices in Go that handle millions of API requests per second.',
        'requirements': '2+ years Go experience\nUnderstanding of distributed systems\nExperience with gRPC and message queues',
        'responsibilities': 'Build and own microservices\nDesign for high availability\nPerformance profiling and optimization',
        'benefits': 'Competitive salary\nRemote-first\nEquity',
        'job_type': 'full_time', 'work_mode': 'remote', 'experience_level': 'junior',
        'location': 'Remote', 'salary_min': 80000, 'salary_max': 110000,
        'category': 'Engineering', 'skills': ['Go', 'Docker', 'Redis', 'Kubernetes'],
    },
    {
        'title': 'Product Manager',
        'description': 'Lead the roadmap for our core platform product. Work cross-functionally with engineering, design and sales to deliver value.',
        'requirements': '4+ years product management experience\nStrong analytical skills\nExperience in B2B SaaS',
        'responsibilities': 'Define and prioritize product roadmap\nWrite detailed specs and user stories\nAnalyze usage metrics and feedback',
        'benefits': 'Senior role with high impact\nGenerous equity\nFlex work policy',
        'job_type': 'full_time', 'work_mode': 'hybrid', 'experience_level': 'senior',
        'location': 'Delhi, India', 'salary_min': 3000000, 'salary_max': 4500000, 'salary_currency': 'INR',
        'category': 'Product', 'skills': ['Python', 'GraphQL'],
    },
    {
        'title': 'Junior Frontend Developer (Internship)',
        'description': 'Great opportunity to kickstart your career building real features in a production React app with mentorship from senior engineers.',
        'requirements': 'Familiarity with React and JavaScript\nBasic understanding of HTML/CSS\nEager to learn',
        'responsibilities': 'Build UI components under guidance\nWrite tests\nParticipate in code reviews',
        'benefits': 'Paid internship\nMentorship program\nFull-time offer potential',
        'job_type': 'internship', 'work_mode': 'hybrid', 'experience_level': 'entry',
        'location': 'Pune, India', 'salary_min': 400000, 'salary_max': 600000, 'salary_currency': 'INR',
        'category': 'Engineering', 'skills': ['React', 'JavaScript', 'TypeScript'],
    },
]


class Command(BaseCommand):
    help = 'Seed the database with test users, companies, and sample jobs'

    def handle(self, *args, **options):
        with transaction.atomic():
            self._seed_users()
            self._seed_skills()
            self._seed_categories()
            company = self._seed_company()
            self._seed_jobs(company)
        self.stdout.write(self.style.SUCCESS('Database seeded successfully.'))

    def _seed_users(self):
        if not User.objects.filter(email='admin@test.com').exists():
            User.objects.create_user(
                email='admin@test.com',
                password='Admin@1234',
                first_name='Admin',
                last_name='HR',
                role=User.Role.EMPLOYER,
                username='admin_hr',
            )
            self.stdout.write('  Created HR user: admin@test.com')

        if not User.objects.filter(email='user@test.com').exists():
            User.objects.create_user(
                email='user@test.com',
                password='User@1234',
                first_name='Test',
                last_name='Candidate',
                role=User.Role.JOB_SEEKER,
                username='test_candidate',
            )
            self.stdout.write('  Created candidate user: user@test.com')

    def _seed_skills(self):
        for name in SKILLS:
            slug = name.lower().replace('.', '').replace('/', '-').replace(' ', '-')
            Skill.objects.get_or_create(slug=slug, defaults={'name': name})

    def _seed_categories(self):
        for name, description in CATEGORIES:
            slug = name.lower().replace(' ', '-').replace('&', 'and').replace('/', '-')
            Category.objects.get_or_create(slug=slug, defaults={'name': name, 'description': description})

    def _seed_company(self):
        hr_user = User.objects.get(email='admin@test.com')
        company, created = Company.objects.get_or_create(
            slug='skypoint-cloud',
            defaults={
                'name': 'SkyPoint Cloud',
                'owner': hr_user,
                'industry': 'Technology',
                'description': 'SkyPoint Cloud is a modern data and AI platform helping enterprises unlock value from their data.',
                'headquarters': 'San Francisco, USA',
                'website': 'https://skypointcloud.com',
                'size': '201-500',
            }
        )
        if created:
            self.stdout.write('  Created company: SkyPoint Cloud')
        return company

    def _seed_jobs(self, company):
        if Job.objects.count() >= 10:
            self.stdout.write('  Jobs already seeded, skipping.')
            return

        hr_user = User.objects.get(email='admin@test.com')
        for data in JOBS:
            skill_names = data.pop('skills')
            category_name = data.pop('category')
            salary_currency = data.pop('salary_currency', 'USD')

            slug = data['title'].lower().replace(' ', '-').replace('(', '').replace(')', '')
            category_slug = category_name.lower().replace(' ', '-').replace('&', 'and').replace('/', '-')

            category = Category.objects.filter(slug=category_slug).first()
            job, created = Job.objects.get_or_create(
                slug=slug,
                defaults={
                    **data,
                    'company': company,
                    'category': category,
                    'posted_by': hr_user,
                    'status': Job.Status.ACTIVE,
                    'salary_currency': salary_currency,
                }
            )
            if created:
                skills = Skill.objects.filter(name__in=skill_names)
                job.skills.set(skills)
                self.stdout.write(f'  Created job: {job.title}')
