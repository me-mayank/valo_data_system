// Sample hardcoded course data for Phase 2 static rendering.
// Replaced by live API data in Phase 6.

export const SAMPLE_COURSES = [
  {
    id: 'c1',
    code: 'SN-101',
    slug: 'servicenow-fundamentals',
    title: 'ServiceNow Fundamentals',
    shortDescription:
      'Master the platform used by 85% of Fortune 500 companies for enterprise service management.',
    overview:
      'This course gives college students direct hands-on practice in ServiceNow. You will learn the core data model, navigate the Agent Workspace, handle incidents and changes, and understand how enterprise IT organizations operate on a daily basis.',
    category: 'ITSM',
    tools: ['ServiceNow', 'ITSM'],
    level: 'beginner',
    mode: 'online',
    duration: '6 weeks',
    audience:
      'College students (2nd to 4th year) interested in IT operations, enterprise systems, and technical consulting.',
    fee: null, // Fee hidden publicly per PRD §7.4
    status: 'published',
    featured: true,
    sortOrder: 1,
    syllabus: [
      {
        id: 'm1',
        title: 'Platform Architecture & Navigation',
        topics: [
          'Platform architecture and instance setup',
          'Users, groups, and role-based access control',
          'Navigating lists, filters, forms, and breadcrumbs',
        ],
      },
      {
        id: 'm2',
        title: 'Incident & Service Level Management',
        topics: [
          'Incident lifecycle: creation, investigation, resolution',
          'Priority matrix and SLA definition',
          'Notifications and automated assignment rules',
        ],
      },
      {
        id: 'm3',
        title: 'Change & Problem Management',
        topics: [
          'Change request workflows: Standard, Normal, Emergency',
          'CAB approval processes and risk evaluation',
          'Root-cause analysis in Problem Management',
        ],
      },
    ],
  },
  {
    id: 'c2',
    code: 'JR-201',
    slug: 'jira-agile-teams',
    title: 'Jira for Agile Teams',
    shortDescription:
      'Plan, track, and manage software releases using industry-standard Scrum and Kanban workflows.',
    overview:
      'Software teams do not track work on spreadsheets. In this course, you will configure real Jira projects, run simulated sprint cycles, manage backlogs, track velocity, and link issues with Confluence documentation.',
    category: 'Project Management',
    tools: ['Jira', 'Confluence'],
    level: 'intermediate',
    mode: 'hybrid',
    duration: '4 weeks',
    audience:
      'Students preparing for software engineering, QA testing, product management, or agile analyst roles.',
    fee: null,
    status: 'published',
    featured: true,
    sortOrder: 2,
    syllabus: [
      {
        id: 'm1',
        title: 'Agile Frameworks in Practice',
        topics: [
          'Scrum vs Kanban methodology comparison',
          'Project templates and issue hierarchies',
          'Configuring board columns and workflow states',
        ],
      },
      {
        id: 'm2',
        title: 'Sprint Planning & Release Tracking',
        topics: [
          'Backlog grooming, estimation, and story points',
          'Active sprint monitoring and burndown charts',
          'Release versions, components, and deploy tracking',
        ],
      },
      {
        id: 'm3',
        title: 'Confluence Integration & Reporting',
        topics: [
          'Documentation templates and requirements linking',
          'Jira issue macros and product status pages',
          'Custom filters, JQL queries, and shared dashboards',
        ],
      },
    ],
  },
  {
    id: 'c3',
    code: 'DV-301',
    slug: 'devops-tooling',
    title: 'Enterprise DevOps & Git Workflows',
    shortDescription:
      'Practical Git branch policies, code reviews, and automated CI/CD pipeline fundamentals.',
    overview:
      'Move beyond personal code repos to enterprise collaborative engineering. Practice GitFlow, branch protection, pull request reviews, automated lint and test pipelines, and Linux server fundamentals.',
    category: 'DevOps',
    tools: ['Git', 'Jenkins', 'Linux'],
    level: 'intermediate',
    mode: 'offline',
    duration: '8 weeks',
    audience:
      'Computer science and IT undergraduates aiming for software development or infrastructure engineering roles.',
    fee: null,
    status: 'published',
    featured: true,
    sortOrder: 3,
    syllabus: [
      {
        id: 'm1',
        title: 'Git Collaboration at Scale',
        topics: [
          'Branching strategies: trunk-based vs GitFlow',
          'Resolving complex merge conflicts',
          'Commit message conventions and rebase etiquette',
        ],
      },
      {
        id: 'm2',
        title: 'Code Reviews & Quality Gates',
        topics: [
          'Pull request checklists and review standards',
          'Automated linting and unit test execution',
          'Branch protection rules and mandatory approvals',
        ],
      },
      {
        id: 'm3',
        title: 'Continuous Integration Pipelines',
        topics: [
          'Pipeline triggers and environment variables',
          'Build artifact generation and verification',
          'Automated deployment to test servers',
        ],
      },
    ],
  },
];
